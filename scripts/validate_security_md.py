#!/usr/bin/env python3
"""
scripts/validate_security_md.py

Purpose: Validate SECURITY.md content and structure against rules.

This script checks that a SECURITY.md file exists in the repository root,
contains required sections (e.g., Reporting a Vulnerability, Supported Versions),
and follows a standard security policy template. It returns exit code 0 on
success, 1 on validation failure, and 2 on unexpected errors.
"""

import logging
import os
import re
import sys
from dataclasses import dataclass, field
from enum import Enum, auto
from pathlib import Path
from typing import Dict, List, Optional, Pattern, Set, Tuple, Union

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REQUIRED_SECTIONS: List[str] = [
    "Reporting a Vulnerability",
    "Supported Versions",
    "Security Contact",
    "Disclosure Policy",
]

SECTION_PATTERNS: Dict[str, str] = {
    "Reporting a Vulnerability": r"##\s*Reporting a Vulnerability",
    "Supported Versions": r"##\s*Supported Versions",
    "Security Contact": r"##\s*Security Contact",
    "Disclosure Policy": r"##\s*Disclosure Policy",
}

MIN_LINE_COUNT: int = 20
MAX_LINE_COUNT: int = 200

PLACEHOLDER_PATTERNS: List[str] = [
    r"\[.*?\]",
    r"<.*?>",
    r"YOUR_EMAIL",
    r"YOUR_ORGANIZATION",
    r"TODO",
    r"FIXME",
]

EMAIL_PATTERN: str = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------

def setup_logging(level: int = logging.INFO) -> None:
    """Configure logging with proper format and level."""
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

logger: logging.Logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Enums and Data Classes
# ---------------------------------------------------------------------------

class ValidationResult(Enum):
    """Enum for validation results."""
    PASS = auto()
    FAIL = auto()
    WARNING = auto()

@dataclass
class ValidationIssue:
    """Data class for storing validation issues."""
    result: ValidationResult
    message: str
    details: Optional[Union[str, List[str]]] = None

@dataclass
class ValidationReport:
    """Data class for storing complete validation report."""
    passed: bool = True
    issues: List[ValidationIssue] = field(default_factory=list)
    
    def add_issue(self, issue: ValidationIssue) -> None:
        """Add an issue to the report."""
        self.issues.append(issue)
        if issue.result == ValidationResult.FAIL:
            self.passed = False
    
    def print_report(self) -> None:
        """Print the validation report in a human-readable format."""
        for issue in self.issues:
            prefix = {
                ValidationResult.PASS: "✓",
                ValidationResult.FAIL: "✗",
                ValidationResult.WARNING: "⚠",
            }.get(issue.result, "?")
            
            message = f"{prefix} {issue.message}"
            if issue.details:
                if isinstance(issue.details, list):
                    message += f": {', '.join(issue.details[:5])}"
                    if len(issue.details) > 5:
                        message += f" ... and {len(issue.details) - 5} more"
                else:
                    message += f": {issue.details}"
            
            logger.info(message)
        
        if self.passed:
            logger.info("\n✓ SUCCESS: SECURITY.md validation passed.")
        else:
            logger.error("\n✗ FAILURE: SECURITY.md validation failed.")

# ---------------------------------------------------------------------------
# File Operations
# ---------------------------------------------------------------------------

class FileReadError(Exception):
    """Custom exception for file read errors."""
    pass

def read_file(filepath: Path) -> str:
    """
    Read file content with comprehensive error handling.
    
    Args:
        filepath: Path to the file to read.
    
    Returns:
        File content as string.
    
    Raises:
        FileReadError: If file cannot be read.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content: str = f.read()
            logger.debug(f"Successfully read file: {filepath}")
            return content
    except FileNotFoundError as e:
        logger.error(f"File not found: {filepath}")
        raise FileReadError(f"File not found: {filepath}") from e
    except PermissionError as e:
        logger.error(f"Permission denied reading: {filepath}")
        raise FileReadError(f"Permission denied reading: {filepath}") from e
    except UnicodeDecodeError as e:
        logger.error(f"Unicode decode error reading: {filepath}")
        raise FileReadError(f"Unicode decode error reading: {filepath}") from e
    except OSError as e:
        logger.error(f"OS error reading {filepath}: {e}")
        raise FileReadError(f"OS error reading {filepath}: {e}") from e
    except Exception as e:
        logger.error(f"Unexpected error reading {filepath}: {e}")
        raise FileReadError(f"Unexpected error reading {filepath}: {e}") from e

# ---------------------------------------------------------------------------
# Validation Functions
# ---------------------------------------------------------------------------

def check_file_exists(security_md_path: Path) -> ValidationIssue:
    """
    Check if SECURITY.md exists in repository root.
    
    Args:
        security_md_path: Path to SECURITY.md file.
    
    Returns:
        ValidationIssue with result.
    """
    try:
        if security_md_path.is_file():
            logger.debug(f"SECURITY.md found at: {security_md_path}")
            return ValidationIssue(
                result=ValidationResult.PASS,
                message="SECURITY.md exists in repository root.",
                details=str(security_md_path)
            )
        else:
            logger.warning(f"SECURITY.md not found at: {security_md_path}")
            return ValidationIssue(
                result=ValidationResult.FAIL,
                message="SECURITY.md does not exist in repository root.",
                details=str(security_md_path)
            )
    except PermissionError as e:
        logger.error(f"Permission error checking file existence: {e}")
        return ValidationIssue(
            result=ValidationResult.FAIL,
            message=f"Permission error checking file existence: {e}"
        )
    except OSError as e:
        logger.error(f"OS error checking file existence: {e}")
        return ValidationIssue(
            result=ValidationResult.FAIL,
            message=f"OS error checking file existence: {e}"
        )

def check_required_sections(content: str) -> ValidationIssue:
    """
    Check that all required sections are present.
    
    Args:
        content: File content as string.
    
    Returns:
        ValidationIssue with result.
    """
    missing_sections: List[str] = []
    
    for section, pattern in SECTION_PATTERNS.items():
        try:
            if not re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
                missing_sections.append(section)
                logger.debug(f"Missing section: {section}")
        except re.error as e:
            logger.error(f"Regex error for pattern '{pattern}': {e}")
            return ValidationIssue(
                result=ValidationResult.FAIL,
                message=f"Regex error checking section '{section}': {e}"
            )
    
    if missing_sections:
        return ValidationIssue(
            result=ValidationResult.FAIL,
            message="Missing required sections",
            details=missing_sections
        )
    
    return ValidationIssue(
        result=ValidationResult.PASS,
        message="All required sections present."
    )

def check_line_count(content: str) -> ValidationIssue:
    """
    Check that line count is within acceptable range.
    
    Args:
        content: File content as string.
    
    Returns:
        ValidationIssue with result.
    """
    lines: List[str] = content.splitlines()
    line_count: int = len(lines)
    
    if line_count < MIN_LINE_COUNT:
        return ValidationIssue(
            result=ValidationResult.WARNING,
            message=f"File has {line_count} lines (minimum {MIN_LINE_COUNT} recommended)",
            details=f"Consider adding more content to reach {MIN_LINE_COUNT} lines"
        )
    
    if line_count > MAX_LINE_COUNT:
        return ValidationIssue(
            result=ValidationResult.WARNING,
            message=f"File has {line_count} lines (maximum {MAX_LINE_COUNT} recommended)",
            details=f"Consider reducing content to stay under {MAX_LINE_COUNT} lines"
        )
    
    return ValidationIssue(
        result=ValidationResult.PASS,
        message=f"Line count ({line_count}) within acceptable range."
    )

def check_placeholders(content: str) -> ValidationIssue:
    """
    Check for placeholder text that should be replaced.
    
    Args:
        content: File content as string.
    
    Returns:
        ValidationIssue with result.
    """
    found_placeholders: List[str] = []
    
    for pattern in PLACEHOLDER_PATTERNS:
        try:
            matches: List[str] = re.findall(pattern, content, re.IGNORECASE)
            found_placeholders.extend(matches)
        except re.error as e:
            logger.error(f"Regex error for placeholder pattern '{pattern}': {e}")
            return ValidationIssue(
                result=ValidationResult.FAIL,
                message=f"Regex error checking placeholder pattern: {e}"
            )
    
    if found_placeholders:
        unique_placeholders: List[str] = list(set(found_placeholders))
        return ValidationIssue(
            result=ValidationResult.WARNING,
            message="Placeholder text found that should be replaced",
            details=unique_placeholders
        )
    
    return ValidationIssue(
        result=ValidationResult.PASS,
        message="No placeholder text found."
    )

def check_email_contact(content: str) -> ValidationIssue:
    """
    Check that a valid email contact is present.
    
    Args:
        content: File content as string.
    
    Returns:
        ValidationIssue with result.
    """
    try:
        emails: List[str] = re.findall(EMAIL_PATTERN, content)
        
        if not emails:
            return ValidationIssue(
                result=ValidationResult.WARNING,
                message="No email contact found in SECURITY.md",
                details="Consider adding a security contact email"
            )
        
        return ValidationIssue(
            result=ValidationResult.PASS,
            message=f"Email contact found: {emails[0]}"
        )
    except re.error as e:
        logger.error(f"Regex error for email pattern: {e}")
        return ValidationIssue(
            result=ValidationResult.FAIL,
            message=f"Regex error checking email pattern: {e}"
        )

def check_section_order(content: str) -> ValidationIssue:
    """
    Check that sections appear in the recommended order.
    
    Args:
        content: File content as string.
    
    Returns:
        ValidationIssue with result.
    """
    section_positions: Dict[str, int] = {}
    
    for section, pattern in SECTION_PATTERNS.items():
        try:
            match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
            if match:
                section_positions[section] = match.start()
        except re.error as e:
            logger.error(f"Regex error for pattern '{pattern}': {e}")
            return ValidationIssue(
                result=ValidationResult.FAIL,
                message=f"Regex error checking section order: {e}"
            )
    
    if len(section_positions) < 2:
        return ValidationIssue(
            result=ValidationResult.PASS,
            message="Insufficient sections to check order."
        )
    
    sorted_sections: List[str] = sorted(section_positions.keys(), key=lambda s: section_positions[s])
    expected_order: List[str] = [s for s in REQUIRED_SECTIONS if s in section_positions]
    
    if sorted_sections != expected_order:
        return ValidationIssue(
            result=ValidationResult.WARNING,
            message="Sections not in recommended order",
            details=f"Expected: {expected_order}, Found: {sorted_sections}"
        )
    
    return ValidationIssue(
        result=ValidationResult.PASS,
        message="Sections in recommended order."
    )

def validate_security_md(security_md_path: Path) -> ValidationReport:
    """
    Main validation function for SECURITY.md.
    
    Args:
        security_md_path: Path to SECURITY.md file.
    
    Returns:
        ValidationReport with all validation results.
    """
    report: ValidationReport = ValidationReport()
    
    # Check file existence
    file_exists_issue: ValidationIssue = check_file_exists(security_md_path)
    report.add_issue(file_exists_issue)
    
    if file_exists_issue.result == ValidationResult.FAIL:
        return report
    
    # Read file content
    try:
        content: str = read_file(security_md_path)
    except FileReadError as e:
        report.add_issue(ValidationIssue(
            result=ValidationResult.FAIL,
            message=f"Failed to read SECURITY.md: {e}"
        ))
        return report
    
    # Run all validation checks
    report.add_issue(check_required_sections(content))
    report.add_issue(check_line_count(content))
    report.add_issue(check_placeholders(content))
    report.add_issue(check_email_contact(content))
    report.add_issue(check_section_order(content))
    
    return report

# ---------------------------------------------------------------------------
# Main Execution
# ---------------------------------------------------------------------------

def main() -> int:
    """
    Main entry point for the script.
    
    Returns:
        Exit code: 0 for success, 1 for validation failure, 2 for errors.
    """
    try:
        setup_logging()
        
        # Determine repository root (script is in scripts/ directory)
        script_dir: Path = Path(__file__).resolve().parent
        repo_root: Path = script_dir.parent
        
        security_md_path: Path = repo_root / "SECURITY.md"
        
        logger.info(f"Validating SECURITY.md at: {security_md_path}")
        
        report: ValidationReport = validate_security_md(security_md_path)
        report.print_report()
        
        return 0 if report.passed else 1
        
    except Exception as e:
        logger.critical(f"Unexpected error during validation: {e}", exc_info=True)
        return 2

if __name__ == "__main__":
    sys.exit(main())