#!/usr/bin/env python3
"""
Export a SentenceTransformer model to ONNX format for efficient inference.

Supports two strategies:
- Optimum (preferred): uses optimum[onnxruntime] for automated export.
- Manual: uses PyTorch's ONNX exporter and onnxruntime for optimization.

Includes comprehensive error handling, logging, type annotations, input validation,
security checks, and performance considerations. The resulting ONNX model can be
loaded with onnxruntime for production inference.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional, Sequence, Tuple

# Third‑party imports – handled with graceful degradation
try:
    import numpy as np
    import onnxruntime as ort
    import torch
except ImportError:  # pragma: no cover
    _has_core = False
    _core_error = "numpy, torch, and onnxruntime are required for ONNX export"
else:
    _has_core = True
    _core_error = ""

try:
    from optimum.onnxruntime import ORTModelForFeatureExtraction
    from transformers import AutoTokenizer

    _has_optimum = True
except ImportError:
    _has_optimum = False

try:
    from sentence_transformers import SentenceTransformer

    _has_st = True
except ImportError:
    _has_st = False

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("export_onnx")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEFAULT_MODEL: str = "all-MiniLM-L6-v2"
DEFAULT_OUTPUT: str = "./models"
ONNX_FILE_NAME: str = "model.onnx"
OPTIMIZED_FILE_NAME: str = "model_optimized.onnx"
ALLOWED_MODEL_CHARS: str = (
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "0123456789_-./"
)
FORBIDDEN_PATH_PREFIXES: Tuple[str, ...] = (
    "/etc",
    "/sys",
    "/proc",
    "/dev",
    "/bin",
    "/sbin",
    "/boot",
    "/root",
)


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------
def validate_model_name(model_name: str) -> str:
    """Validate that a model name is a safe HuggingFace identifier.

    Parameters
    ----------
    model_name : str
        HuggingFace model ID (e.g. ``'all-MiniLM-L6-v2'``).

    Returns
    -------
    str
        The validated model name (unchanged).

    Raises
    ------
    ValueError
        If the name is empty, contains invalid characters, or is a local path.
    """
    if not model_name or not isinstance(model_name, str):
        raise ValueError("Model name must be a non‑empty string.")
    if model_name.startswith("/") or model_name.startswith("."):
        raise ValueError(
            f"Model name must be a HuggingFace identifier, not a path: {model_name!r}"
        )
    if not all(c in ALLOWED_MODEL_CHARS for c in model_name):
        raise ValueError(
            f"Model name contains invalid characters: {model_name!r}\n"
            f"Allowed characters: '{ALLOWED_MODEL_CHARS}'"
        )
    return model_name


def validate_output_path(output_path: str) -> Path:
    """Validate and resolve the output directory path.

    Parameters
    ----------
    output_path : str
        User-supplied output path (relative or absolute).

    Returns
    -------
    Path
        Resolved absolute path to the output directory.

    Raises
    ------
    ValueError
        If the path is empty, resolves to a system directory, or is otherwise unsafe.
    """
    if not output_path or not isinstance(output_path, str):
        raise ValueError("Output path must be a non‑empty string.")

    resolved = Path(output_path).resolve()

    # Prevent writing to critical system directories (security safeguard)
    for prefix in FORBIDDEN_PATH_PREFIXES:
        if str(resolved).startswith(prefix):
            raise ValueError(
                f"Output path resolves to a system directory: {resolved}\n"
                f"Please choose a writable location (e.g. ./models)."
            )

    return resolved


def get_onnx_provider() -> str:
    """Determine the best available ONNX Runtime execution provider.

    Returns
    -------
    str
        Provider name, e.g. ``'CUDAExecutionProvider'`` or ``'CPUExecutionProvider'``.

    Raises
    ------
    RuntimeError
        If no supported execution provider is available.
    """
    if not ort:
        raise RuntimeError("onnxruntime is not installed.")

    available = ort.get_available_providers()
    # Prefer GPU provider if available
    for provider in ("CUDAExecutionProvider", "TensorrtExecutionProvider"):
        if provider in available:
            logger.info("Using execution provider: %s", provider)
            return provider

    if "CPUExecutionProvider" in available:
        logger.info("Using execution provider: CPUExecutionProvider")
        return "CPUExecutionProvider"

    raise RuntimeError(
        "No compatible ONNX Runtime execution provider found. "
        "Available providers: %s" % available
    )


# ---------------------------------------------------------------------------
# Export strategy: Optimum
# ---------------------------------------------------------------------------
def export_using_optimum(
    model_name: str, output_dir: Path
) -> Tuple[Path, Optional[Path]]:
    """Export a SentenceTransformer model using the 🤗 Optimum library.

    This is the preferred method when ``optimum[onnxruntime]`` is installed,
    as it handles export and optional graph optimization automatically.

    Parameters
    ----------
    model_name : str
        HuggingFace model identifier.
    output_dir : Path
        Directory where the ONNX model and tokenizer files will be saved.

    Returns
    -------
    Tuple[Path, Optional[Path]]
        - Path to the primary ONNX model file (``model.onnx``).
        - Path to an optimized ONNX model, if generated; otherwise ``None``.

    Raises
    ------
    ImportError
        If ``optimum`` or ``transformers`` are not installed.
    RuntimeError
        If the export or file writing fails.
    """
    if not _has_optimum:
        raise ImportError(
            "optimum and transformers are required for this export strategy.\n"
            "Install with: pip install optimum[onnxruntime]"
        )

    logger.info("Exporting using Optimum for model: %s", model_name)

    try:
        logger.debug("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        logger.debug("Loading and exporting model (ORTModelForFeatureExtraction)...")
        model = ORTModelForFeatureExtraction.from_pretrained(
            model_name,
            export=True,
            provider=get_onnx_provider(),
        )
    except Exception as exc:
        logger.error("Optimum export failed: %s", exc)
        raise RuntimeError(f"Optimum export failed: {exc}") from exc

    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        model.save_pretrained(output_dir)
        tokenizer.save_pretrained(output_dir)
        logger.info("Model and tokenizer saved to %s", output_dir)
    except OSError as exc:
        logger.error("Failed to write model files: %s", exc)
        raise RuntimeError(f"Could not write to output directory: {exc}") from exc

    onnx_file = output_dir / ONNX_FILE_NAME
    if not onnx_file.exists():
        raise RuntimeError(
            f"Optimum did not produce the expected ONNX file: {onnx_file}"
        )

    # Optimum may also create an optimized version automatically
    possible_optimized = output_dir / "model_optimized.onnx"
    optimized_file: Optional[Path] = (
        possible_optimized if possible_optimized.exists() else None
    )

    return onnx_file, optimized_file


# ---------------------------------------------------------------------------
# Export strategy: Manual (PyTorch + onnxruntime)
# ---------------------------------------------------------------------------
def _generate_dummy_inputs(
    tokenizer: Any,
    batch_size: int = 1,
    seq_length: int = 128,
    device: str = "cpu",
) -> Dict[str, torch.Tensor]:
    """Create dummy ONNX input tensors matching the tokenizer's expected format.

    Parameters
    ----------
    tokenizer : transformers.PreTrainedTokenizerBase
        Tokenizer object used to infer model input names.
    batch_size : int, optional
        Dummy batch size (default 1).
    seq_length : int, optional
        Dummy sequence length (default 128).
    device : str, optional
        Target device (``'cpu'`` or ``'cuda'``).

    Returns
    -------
    Dict[str, torch.Tensor]
        Dictionary of input tensors (``input_ids``, ``attention_mask``, etc.).
    """
    input_ids = torch.randint(
        0, tokenizer.vocab_size, (batch_size, seq_length), dtype=torch.long,
        device=device
    )
    attention_mask = torch.ones(
        (batch_size, seq_length), dtype=torch.long, device=device
    )
    # Common additional inputs (token_type_ids for BERT‑style models)
    token_type_ids = torch.zeros(
        (batch_size, seq_length), dtype=torch.long, device=device
    )
    return {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "token_type_ids": token_type_ids,
    }


def _onnx_export_pytorch(
    transformer_model: torch.nn.Module,
    dummy_inputs: Dict[str, torch.Tensor],
    output_path: Path,
    input_names: Sequence[str],
    output_names: Sequence[str],
    dynamic_axes: Dict[str, Dict[int, str]],
    opset_version: int = 14,
) -> None:
    """Export a PyTorch transformer model to ONNX format.

    Parameters
    ----------
    transformer_model : torch.nn.Module
        The transformer sub‑model (not the full SentenceTransformer wrapper).
    dummy_inputs : Dict[str, torch.Tensor]
        Example inputs for tracing.
    output_path : Path
        Destination file path for the ONNX model.
    input_names, output_names, dynamic_axes : see ``torch.onnx.export``.
    opset_version : int, optional
        ONNX opset version (default 14, supports dynamic shapes).

    Raises
    ------
    RuntimeError
        If the ONNX export fails.
    """
    logger.debug("Starting PyTorch → ONNX export (opset %d)...", opset_version)
    try:
        torch.onnx.export(
            transformer_model,
            args=tuple(dummy_inputs.values()),
            f=str(output_path),
            input_names=list(input_names),
            output_names=list(output_names),
            dynamic_axes=dynamic_axes,
            opset_version=opset_version,
            do_constant_folding=True,
            export_params=True,
            verbose=False,
        )
    except Exception as exc:
        raise RuntimeError(f"ONNX export failed: {exc}") from exc

    if not output_path.exists() or output_path.stat().st_size == 0:
        raise RuntimeError(
            f"ONNX export produced an empty or missing file: {output_path}"
        )


def _onnx_optimize(input_path: Path, output_path: Path) -> None:
    """Apply ONNX Runtime graph optimization to an ONNX model.

    Parameters
    ----------
    input_path : Path
        Path to the original ONNX model.
    output_path : Path
        Path where the optimized model will be saved.

    Raises
    ------
    RuntimeError
        If optimization fails.
    """
    logger.debug("Optimizing ONNX model with onnxruntime...")
    try:
        import onnx  # noqa: F401 – needed for model transformation
    except ImportError:
        raise RuntimeError(
            "onnx package is required for optimization.\n"
            "Install with: pip install onnx"
        )

    try:
        session_options = ort.SessionOptions()
        session_options.graph_optimization_level = (
            ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        )
        session_options.optimized_model_filepath = str(output_path)

        # Load model and run session creation to trigger optimization
        _ = ort.InferenceSession(
            str(input_path),
            session_options,
            providers=["CPUExecutionProvider"],
        )
    except Exception as exc:
        raise RuntimeError(f"ONNX optimization failed: {exc}") from exc

    if not output_path.exists() or output_path.stat().st_size == 0:
        raise RuntimeError(
            f"Optimized model file missing or empty: {output_path}"
        )


def export_manual(
    model_name: str, output_dir: Path
) -> Tuple[Path, Optional[Path]]:
    """Export a SentenceTransformer model manually using PyTorch and onnxruntime.

    This strategy works without the 🤗 Optimum library. It loads the model via
    ``sentence-transformers``, extracts the underlying transformer, exports it
    to ONNX with dynamic batch and sequence axes, then applies onnxruntime
    graph optimization.

    Parameters
    ----------
    model_name : str
        HuggingFace model identifier.
    output_dir : Path
        Directory where the ONNX model and tokenizer files will be saved.

    Returns
    -------
    Tuple[Path, Optional[Path]]
        - Path to the primary ONNX model (unoptimized).
        - Path to the optimized ONNX model (always saved in this strategy).

    Raises
    ------
    ImportError
        If ``sentence-transformers`` or ``torch`` are not installed.
    RuntimeError
        If any step of the export or optimization fails.
    """
    if not _has_st:
        raise ImportError(
            "sentence-transformers is required for manual export.\n"
            "Install with: pip install sentence-transformers"
        )
    if not _has_core:
        raise ImportError(_core_error)

    logger.info("Exporting manually (PyTorch → ONNX) for model: %s", model_name)

    # 1. Load SentenceTransformer model
    try:
        logger.debug("Loading SentenceTransformer model...")
        st_model = SentenceTransformer(model_name)
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load SentenceTransformer model '{model_name}': {exc}"
        ) from exc

    # 2. Extract the transformer sub‑model (auto model)
    try:
        transformer = st_model[0].auto_model  # type: ignore[union-attr]
    except AttributeError as exc:
        raise RuntimeError(
            "Could not extract transformer model from SentenceTransformer.\n"
            "Make sure the model is a standard transformer pipeline."
        ) from exc

    # 3. Get the tokenizer (st_model stores it)
    try:
        tokenizer = st_model.tokenizer
    except AttributeError as exc:
        raise RuntimeError(
            "SentenceTransformer does not expose tokenizer.\n"
            "Falling back to loading from model name..."
        )
        # Fallback: load tokenizer explicitly
        tokenizer = AutoTokenizer.from_pretrained(model_name)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    transformer.to(device)
    transformer.eval()

    # 4. Prepare dummy inputs and dynamic axes
    dummy_inputs = _generate_dummy_inputs(tokenizer, batch_size=1, seq_length=128, device=device)
    input_names = list(dummy_inputs.keys())
    output_names = ["last_hidden_state", "pooler_output"]  # adjust as needed
    dynamic_axes: Dict[str, Dict[int, str]] = {
        "input_ids": {0: "batch_size", 1: "sequence_length"},
        "attention_mask": {0: "batch_size", 1: "sequence_length"},
        "token_type_ids": {0: "batch_size", 1: "sequence_length"},
        "last_hidden_state": {0: "batch_size", 1: "sequence_length"},
        "pooler_output": {0: "batch_size"},
    }

    # 5. Export to ONNX (unoptimized)
    output_dir.mkdir(parents=True, exist_ok=True)
    onnx_file = output_dir / ONNX_FILE_NAME
    _onnx_export_pytorch(
        transformer_model=transformer,
        dummy_inputs=dummy_inputs,
        output_path=onnx_file,
        input_names=input_names,
        output_names=output_names,
        dynamic_axes=dynamic_axes,
        opset_version=14,  # sufficient for dynamic shapes
    )

    # 6. Optimize the ONNX model
    optimized_file = output_dir / OPTIMIZED_FILE_NAME
    _onnx_optimize(onnx_file, optimized_file)

    # 7. Save tokenizer files (needed for inference)
    tokenizer.save_pretrained(output_dir)
    logger.info("Tokenizer saved to %s", output_dir)

    return onnx_file, optimized_file


# ---------------------------------------------------------------------------
# Benchmark helper (optional, for testing)
# ---------------------------------------------------------------------------
def run_benchmark(
    model_path: Path, tokenizer_path: Path, sentences: Sequence[str]
) -> float:
    """Run a simple inference benchmark on an ONNX model.

    Parameters
    ----------
    model_path : Path
        Path to the ONNX model file.
    tokenizer_path : Path
        Path where the tokenizer was saved.
    sentences : Sequence[str]
        List of sentences to encode.

    Returns
    -------
    float
        Average inference time per sentence in seconds.
    """
    from transformers import AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
    ort_session = ort.InferenceSession(
        str(model_path),
        providers=["CPUExecutionProvider"],
    )

    inputs = tokenizer(
        list(sentences),
        padding=True,
        truncation=True,
        return_tensors="np",
    )
    ort_inputs = {
        "input_ids": inputs["input_ids"],
        "attention_mask": inputs["attention_mask"],
        "token_type_ids": inputs.get("token_type_ids", np.zeros_like(inputs["input_ids"])),
    }

    # Warmup
    _ = ort_session.run(None, ort_inputs)

    # Timed runs
    num_runs = 10
    start = time.perf_counter()
    for _ in range(num_runs):
        _ = ort_session.run(None, ort_inputs)
    elapsed = time.perf_counter() - start
    avg_time = elapsed / (num_runs * len(sentences))
    logger.info(
        "Benchmark: %d runs of %d sentences → average %.3f ms per sentence",
        num_runs,
        len(sentences),
        avg_time * 1000,
    )
    return avg_time


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------
def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    """Parse command‑line arguments.

    Parameters
    ----------
    argv : Sequence[str] or None
        Arguments to parse (defaults to ``sys.argv[1:]``).

    Returns
    -------
    argparse.Namespace
        Parsed arguments.
    """
    parser = argparse.ArgumentParser(
        description="Export a SentenceTransformer model to ONNX format.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help="HuggingFace model identifier (e.g. 'all-MiniLM-L6-v2').",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=DEFAULT_OUTPUT,
        help="Directory to save the ONNX model and tokenizer files.",
    )
    parser.add_argument(
        "--strategy",
        choices=["auto", "optimum", "manual"],
        default="auto",
        help=(
            "Export strategy. 'auto' tries optimum first, falls back to manual. "
            "'optimum' uses optimum[onnxruntime] (preferred). "
            "'manual' uses PyTorch + onnxruntime."
        ),
    )
    parser.add_argument(
        "--benchmark",
        action="store_true",
        help="After export, run a quick inference benchmark.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug logging.",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    """Execute the ONNX export workflow.

    Parameters
    ----------
    argv : Sequence[str] or None
        Command‑line arguments.

    Returns
    -------
    int
        Exit code (0 on success, 1 on failure).
    """
    args = parse_args(argv)

    # Set logging level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    try:
        # Validate inputs
        model_name = validate_model_name(args.model)
        output_dir = validate_output_path(args.output)

        # Export
        if args.strategy == "optimum":
            if not _has_optimum:
                logger.error("Optimum strategy requested but not installed.")
                return 1
            onnx_path, optimized_path = export_using_optimum(model_name, output_dir)
        elif args.strategy == "manual":
            if not _has_st:
                logger.error("Manual strategy requires sentence-transformers.")
                return 1
            onnx_path, optimized_path = export_manual(model_name, output_dir)
        else:  # auto
            if _has_optimum:
                logger.info("Auto‑detected optimum, using Optimum strategy.")
                onnx_path, optimized_path = export_using_optimum(model_name, output_dir)
            elif _has_st:
                logger.info("Optimum not available, falling back to manual export.")
                onnx_path, optimized_path = export_manual(model_name, output_dir)
            else:
                logger.error(
                    "Neither optimum nor sentence-transformers are installed.\n"
                    "Install one with:\n"
                    "  pip install optimum[onnxruntime]\n"
                    "or:\n"
                    "  pip install sentence-transformers"
                )
                return 1

        logger.info("Export complete.")
        logger.info("  ONNX model:  %s", onnx_path)
        if optimized_path:
            logger.info("  Optimized:   %s", optimized_path)
        else:
            logger.info("  Optimized:   (not generated)")

        # Optional benchmark
        if args.benchmark:
            test_sentences = [
                "This is a sample sentence for embedding.",
                "Debugging machine learning models is both art and science.",
                "ONNX Runtime speeds up inference significantly.",
            ]
            run_benchmark(onnx_path, output_dir, test_sentences)

    except (ValueError, RuntimeError, ImportError, OSError) as exc:
        logger.error("Export failed: %s", exc)
        if logger.isEnabledFor(logging.DEBUG):
            logger.exception("Details:")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())