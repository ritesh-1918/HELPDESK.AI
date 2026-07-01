#!/usr/bin/env python3
"""
Script: generate_security_md.py
Purpose: Automated generation of SECURITY.md file with standard template.
Location: scripts/generate_security_md.py
"""

import os
import sys
import logging
from pathlib import Path
from typing import Optional, Dict, List, Set, Tuple, Union, Any, Generator, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
import hashlib
import json
from datetime import datetime
import re
from contextlib import contextmanager, ExitStack
import functools
import time
import shutil
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed, Future
import threading
import errno
import stat
import gzip
import io
import signal
import atexit
import weakref
from typing import IO
import mmap
import fcntl
import platform

# Configure logging with proper levels and format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_ENCODING: str = 'utf-8'
DEFAULT_OUTPUT_FILENAME: str = "SECURITY.md"
MAX_FILE_SIZE_BYTES: int = 1024 * 1024  # 1MB
REQUIRED_SECTIONS: List[str] = [
    "Security Policy",
    "Supported Versions",
    "Reporting a Vulnerability",
    "Disclosure Policy"
]
VALID_EMAIL_PATTERN: re.Pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
MAX_RETRIES: int = 3
RETRY_DELAY_SECONDS: float = 0.5
BACKUP_SUFFIX: str = ".backup"
TEMP_FILE_PREFIX: str = "security_md_"
MAX_THREADS: int = 4
CHUNK_SIZE: int = 8192
BUFFER_SIZE: int = 65536
MAX_LINE_LENGTH: int = 1000
MAX_SECTION_DEPTH: int = 10
VALID_SECTION_CHARS: re.Pattern = re.compile(r'^[a-zA-Z0-9\s\-_#]+$')
LOCK_TIMEOUT: float = 10.0
CLEANUP_TIMEOUT: float = 5.0


class SecurityError(Exception):
    """Base exception for security-related errors."""
    pass


class FileOperationError(SecurityError):
    """Exception for file operation failures."""
    pass


class ValidationError(SecurityError):
    """Exception for validation failures."""
    pass


class ConfigurationError(SecurityError):
    """Exception for configuration errors."""
    pass


class BackupError(SecurityError):
    """Exception for backup failures."""
    pass


class LockError(SecurityError):
    """Exception for lock acquisition failures."""
    pass


class ResourceError(SecurityError):
    """Exception for resource management failures."""
    pass


class SecurityLevel(Enum):
    """Security levels for vulnerability classification."""
    CRITICAL = auto()
    HIGH = auto()
    MEDIUM = auto()
    LOW = auto()


@dataclass(frozen=True)
class SecurityConfig:
    """Configuration for security policy generation."""
    output_path: Path
    template_content: str
    encoding: str = DEFAULT_ENCODING
    max_file_size: int = MAX_FILE_SIZE_BYTES
    required_sections: List[str] = field(default_factory=lambda: REQUIRED_SECTIONS.copy())
    backup_enabled: bool = True
    validate_content: bool = True
    log_level: int = logging.INFO
    max_retries: int = MAX_RETRIES
    retry_delay: float = RETRY_DELAY_SECONDS
    create_backup: bool = True
    validate_email: bool = True
    validate_sections: bool = True
    validate_file_size: bool = True
    validate_encoding: bool = True
    atomic_write: bool = True
    compression_enabled: bool = False
    max_threads: int = MAX_THREADS
    chunk_size: int = CHUNK_SIZE
    buffer_size: int = BUFFER_SIZE
    max_line_length: int = MAX_LINE_LENGTH
    max_section_depth: int = MAX_SECTION_DEPTH
    lock_timeout: float = LOCK_TIMEOUT
    cleanup_timeout: float = CLEANUP_TIMEOUT


@dataclass(frozen=True)
class FileValidationResult:
    """Result of file validation."""
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    file_size: int = 0
    checksum: str = ""
    sections_found: List[str] = field(default_factory=list)
    sections_missing: List[str] = field(default_factory=list)
    encoding_valid: bool = True
    email_valid: bool = True
    timestamp: datetime = field(default_factory=datetime.now)
    line_count: int = 0
    max_line_length: int = 0
    has_bom: bool = False
    has_trailing_whitespace: bool = False
    has_invalid_chars: bool = False


@dataclass(frozen=True)
class GenerationStats:
    """Statistics for file generation."""
    start_time: datetime = field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    duration_seconds: float = 0.0
    file_size_bytes: int = 0
    checksum: str = ""
    validation_result: Optional[FileValidationResult] = None
    backup_created: bool = False
    retries_used: int = 0
    success: bool = False
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


# Standard SECURITY.md template
SECURITY_MD_TEMPLATE: str = """# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS (Common Vulnerability Scoring System) v3.0 rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The HELPDESK.AI team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

To report a security issue, please use the GitHub Security Advisory **"Report a Vulnerability"** tab.

Alternatively, you can email the project maintainer directly at **ritesh-1918@example.com** (replace with actual email).

The maintainer will send a response indicating the next steps in handling your report. After the initial reply to your report, the security team will keep you informed of the progress towards a fix and full announcement, and may ask for additional information or guidance.

### What to include in your report

Please include as much of the information listed below as possible to help us better understand and resolve the issue:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Preferred Languages

We prefer all communications to be in English.

## Disclosure Policy

When the security team receives a security bug report, they will assign it to a primary handler. This person will coordinate the fix and release process, involving the following steps:

- Confirm the problem and determine the affected versions.
- Audit code to find any potential similar problems.
- Prepare fixes for all releases still under maintenance. These fixes will be released as fast as possible.

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue for discussion.
"""


class FileLock:
    """Cross-platform file locking mechanism."""
    
    def __init__(self, path: Path, timeout: float = LOCK_TIMEOUT) -> None:
        """
        Initialize file lock.
        
        Args:
            path: Path to lock file.
            timeout: Lock acquisition timeout in seconds.
            
        Raises:
            ValueError: If path is invalid or timeout is negative.
        """
        if not isinstance(path, Path):
            raise ValueError(f"Path must be a Path instance, got {type(path)}")
        if timeout < 0:
            raise ValueError(f"Timeout must be non-negative, got {timeout}")
            
        self._path: Path = path
        self._lock_path: Path = path.with_suffix('.lock')
        self._timeout: float = timeout
        self._lock_file: Optional[IO] = None
        self._acquired: bool = False
        self._lock = threading.Lock()
        
    def acquire(self) -> bool:
        """
        Acquire the file lock.
        
        Returns:
            True if lock acquired, False otherwise.
            
        Raises:
            LockError: If lock acquisition fails.
        """
        with self._lock:
            if self._acquired:
                return True
                
            start_time = time.time()
            while time.time() - start_time < self._timeout:
                try:
                    self._lock_file = open(self._lock_path, 'w')
                    fcntl.flock(self._lock_file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                    self._acquired = True
                    logger.debug(f"Lock acquired for {self._path}")
                    return True
                except (IOError, OSError) as e:
                    if e.errno in (errno.EACCES, errno.EAGAIN):
                        time.sleep(0.1)
                        continue
                    raise LockError(f"Failed to acquire lock: {e}")
                    
            raise LockError(f"Timeout acquiring lock for {self._path}")
            
    def release(self) -> None:
        """Release the file lock."""
        with self._lock:
            if self._acquired and self._lock_file:
                try:
                    fcntl.flock(self._lock_file.fileno(), fcntl.LOCK_UN)
                    self._lock_file.close()
                    self._lock_path.unlink(missing_ok=True)
                    self._acquired = False
                    logger.debug(f"Lock released for {self._path}")
                except (IOError, OSError) as e:
                    logger.error(f"Failed to release lock: {e}")
                    
    def __enter__(self) -> 'FileLock':
        """Context manager entry."""
        self.acquire()
        return self
        
    def __exit__(self, exc_type: Optional[type], exc_val: Optional[Exception], exc_tb: Optional[object]) -> None:
        """Context manager exit."""
        self.release()


class FileValidator:
    """Validates file content and structure."""
    
    def __init__(self, config: SecurityConfig) -> None:
        """
        Initialize validator.
        
        Args:
            config: Security configuration.
            
        Raises:
            ConfigurationError: If config is invalid.
        """
        if not isinstance(config, SecurityConfig):
            raise ConfigurationError(f"Expected SecurityConfig, got {type(config)}")
            
        self._config: SecurityConfig = config
        self._logger: logging.Logger = logging.getLogger(f"{__name__}.FileValidator")
        
    def validate_file(self, file_path: Path) -> FileValidationResult:
        """
        Validate a file for security policy compliance.
        
        Args:
            file_path: Path to file to validate.
            
        Returns:
            FileValidationResult with validation results.
            
        Raises:
            FileOperationError: If file cannot be read.
            ValidationError: If validation fails critically.
        """
        errors: List[str] = []
        warnings: List[str] = []
        
        try:
            # Check file exists
            if not file_path.exists():
                raise FileOperationError(f"File not found: {file_path}")
                
            # Check file size
            file_size: int = file_path.stat().st_size
            if self._config.validate_file_size and file_size > self._config.max_file_size:
                warnings.append(f"File size {file_size} exceeds maximum {self._config.max_file_size}")
                
            # Read file content
            content: str = self._read_file_safe(file_path)
            
            # Calculate checksum
            checksum: str = self._calculate_checksum(content)
            
            # Validate encoding
            encoding_valid: bool = True
            if self._config.validate_encoding:
                encoding_valid = self._validate_encoding(content)
                if not encoding_valid:
                    errors.append("Invalid file encoding detected")
                    
            # Validate sections
            sections_found: List[str] = self._extract_sections(content)
            sections_missing: List[str] = [
                section for section in self._config.required_sections 
                if section not in sections_found
            ]
            
            if sections_missing and self._config.validate_sections:
                errors.append(f"Missing required sections: {', '.join(sections_missing)}")
                
            # Validate email
            email_valid: bool = True
            if self._config.validate_email:
                email_valid = self._validate_email(content)
                if not email_valid:
                    warnings.append("No valid email found in security policy")
                    
            # Check for BOM
            has_bom: bool = content.startswith('\ufeff')
            if has_bom:
                warnings.append("File contains BOM (Byte Order Mark)")
                
            # Check for trailing whitespace
            has_trailing_whitespace: bool = any(
                line != line.rstrip() for line in content.split('\n')
            )
            if has_trailing_whitespace:
                warnings.append("File contains trailing whitespace")
                
            # Check for invalid characters
            has_invalid_chars: bool = bool(re.search(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', content))
            if has_invalid_chars:
                errors.append("File contains invalid control characters")
                
            # Calculate line metrics
            lines: List[str] = content.split('\n')
            line_count: int = len(lines)
            max_line_length: int = max(len(line) for line in lines) if lines else 0
            
            if max_line_length > self._config.max_line_length:
                warnings.append(f"Maximum line length {max_line_length} exceeds {self._config.max_line_length}")
                
            return FileValidationResult(
                is_valid=len(errors) == 0,
                errors=errors,
                warnings=warnings,
                file_size=file_size,
                checksum=checksum,
                sections_found=sections_found,
                sections_missing=sections_missing,
                encoding_valid=encoding_valid,
                email_valid=email_valid,
                line_count=line_count,
                max_line_length=max_line_length,
                has_bom=has_bom,
                has_trailing_whitespace=has_trailing_whitespace,
                has_invalid_chars=has_invalid_chars
            )
            
        except (IOError, OSError) as e:
            raise FileOperationError(f"Failed to validate file: {e}")
        except Exception as e:
            raise ValidationError(f"Validation failed: {e}")
            
    def _read_file_safe(self, file_path: Path) -> str:
        """
        Safely read file content with proper encoding handling.
        
        Args:
            file_path: Path to file.
            
        Returns:
            File content as string.
            
        Raises:
            FileOperationError: If file cannot be read.
        """
        try:
            # Try specified encoding first
            with open(file_path, 'r', encoding=self._config.encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            # Try common encodings
            for encoding in ['utf-8-sig', 'latin-1', 'cp1252']:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        content: str = f.read()
                        self._logger.warning(f"Read file with encoding {encoding} instead of {self._config.encoding}")
                        return content
                except UnicodeDecodeError:
                    continue
                    
            raise FileOperationError(f"Unable to read file with any supported encoding")
            
    def _calculate_checksum(self, content: str) -> str:
        """
        Calculate SHA-256 checksum of content.
        
        Args:
            content: File content.
            
        Returns:
            Hex digest of checksum.
        """
        return hashlib.sha256(content.encode(self._config.encoding)).hexdigest()
        
    def _validate_encoding(self, content: str) -> bool:
        """
        Validate that content is properly encoded.
        
        Args:
            content: File content.
            
        Returns:
            True if encoding is valid.
        """
        try:
            content.encode(self._config.encoding)
            return True
        except UnicodeEncodeError:
            return False
            
    def _extract_sections(self, content: str) -> List[str]:
        """
        Extract section headers from markdown content.
        
        Args:
            content: Markdown content.
            
        Returns:
            List of section names.
        """
        sections: List[str] = []
        pattern: re.Pattern = re.compile(r'^##\s+(.+)$', re.MULTILINE)
        
        for match in pattern.finditer(content):
            section_name: str = match.group(1).strip()
            if VALID_SECTION_CHARS.match(section_name):
                sections.append(section_name)
                
        return sections
        
    def _validate_email(self, content: str) -> bool:
        """
        Validate that content contains a valid email.
        
        Args:
            content: File content.
            
        Returns:
            True if valid email found.
        """
        return bool(VALID_EMAIL_PATTERN.search(content))


class BackupManager:
    """Manages file backups with versioning."""
    
    def __init__(self, config: SecurityConfig) -> None:
        """
        Initialize backup manager.
        
        Args:
            config: Security configuration.
            
        Raises:
            ConfigurationError: If config is invalid.
        """
        if not isinstance(config, SecurityConfig):
            raise ConfigurationError(f"Expected SecurityConfig, got {type(config)}")
            
        self._config: SecurityConfig = config
        self._logger: logging.Logger = logging.getLogger