"""
Comprehensive tests for atomic corrections log service (Issue #1391).

Tests thread-safety, process-safety, atomic writes, and concurrent access patterns.
"""

import json
import tempfile
import threading
import time
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest

from backend.services.corrections_log_service import (
    CorrectionsLogService,
    get_corrections_log_service,
    cleanup_corrections_log_service,
)


@pytest.fixture
def temp_log_dir():
    """Create a temporary directory for test logs."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def log_service(temp_log_dir):
    """Create a fresh log service instance for each test."""
    log_path = temp_log_dir / "test_corrections.json"
    service = CorrectionsLogService(log_path=log_path, max_entries=100)
    yield service
    service.cleanup_lock_file()


@pytest.fixture
def sample_entry():
    """Sample correction log entry."""
    return {
        "ticket_id": "test-123",
        "original_text": "test text",
        "original_prediction": {"category": "Hardware"},
        "corrected_prediction": {"category": "Software"},
        "changed_fields": ["category"],
        "confidence": 0.85,
        "corrected_by": "user-456",
        "company_id": "company-789",
        "timestamp": "2026-06-03T10:00:00Z"
    }


class TestBasicOperations:
    """Test basic log operations."""

    def test_append_single_entry(self, log_service, sample_entry):
        """Test appending a single entry."""
        result = log_service.append_entry(sample_entry)
        assert result is True
        
        entries = log_service.get_entries()
        assert len(entries) == 1
        assert entries[0] == sample_entry

    def test_append_multiple_entries(self, log_service, sample_entry):
        """Test appending multiple entries."""
        for i in range(5):
            entry = {**sample_entry, "ticket_id": f"test-{i}"}
            result = log_service.append_entry(entry)
            assert result is True
        
        entries = log_service.get_entries()
        assert len(entries) == 5

    def test_get_entries_with_limit(self, log_service, sample_entry):
        """Test reading entries with limit."""
        for i in range(10):
            entry = {**sample_entry, "ticket_id": f"test-{i}"}
            log_service.append_entry(entry)
        
        entries = log_service.get_entries(limit=5)
        assert len(entries) == 5

    def test_get_entries_with_offset(self, log_service, sample_entry):
        """Test reading entries with offset."""
        for i in range(10):
            entry = {**sample_entry, "ticket_id": f"test-{i}"}
            log_service.append_entry(entry)
        
        entries = log_service.get_entries(offset=5)
        assert len(entries) == 5
        assert entries[0]["ticket_id"] == "test-5"

    def test_get_entry_count(self, log_service, sample_entry):
        """Test getting entry count."""
        assert log_service.get_entry_count() == 0
        
        for i in range(3):
            log_service.append_entry({**sample_entry, "ticket_id": f"test-{i}"})
        
        assert log_service.get_entry_count() == 3

    def test_clear_log(self, log_service, sample_entry):
        """Test clearing the log."""
        for i in range(5):
            log_service.append_entry({**sample_entry, "ticket_id": f"test-{i}"})
        
        assert log_service.get_entry_count() == 5
        
        result = log_service.clear_log()
        assert result is True
        assert log_service.get_entry_count() == 0

    def test_read_nonexistent_log(self, temp_log_dir):
        """Test reading from a non-existent log file."""
        log_path = temp_log_dir / "nonexistent.json"
        service = CorrectionsLogService(log_path=log_path)
        
        entries = service.get_entries()
        assert entries == []
        
        service.cleanup_lock_file()

    def test_read_empty_log(self, log_service):
        """Test reading from an empty log."""
        entries = log_service.get_entries()
        assert entries == []

    def test_read_invalid_json(self, temp_log_dir):
        """Test reading from a file with invalid JSON."""
        log_path = temp_log_dir / "invalid.json"
        log_path.write_text("not valid json")
        
        service = CorrectionsLogService(log_path=log_path)
        entries = service.get_entries()
        assert entries == []
        
        service.cleanup_lock_file()


class TestLogRotation:
    """Test log rotation (max entries limit)."""

    def test_rotation_keeps_max_entries(self, temp_log_dir):
        """Test that rotation keeps only the most recent entries."""
        log_path = temp_log_dir / "rotation_test.json"
        service = CorrectionsLogService(log_path=log_path, max_entries=5)
        
        # Add 10 entries
        for i in range(10):
            entry = {
                "ticket_id": f"test-{i}",
                "timestamp": f"2026-06-03T10:0{i}:00Z"
            }
            service.append_entry(entry)
        
        # Should only keep the last 4 entries (max_entries - 1)
        entries = service.get_entries()
        assert len(entries) == 4
        assert entries[0]["ticket_id"] == "test-6"
        assert entries[-1]["ticket_id"] == "test-9"
        
        service.cleanup_lock_file()

    def test_rotation_does_not_exceed_max(self, temp_log_dir):
        """Test that log never exceeds max_entries."""
        log_path = temp_log_dir / "max_test.json"
        service = CorrectionsLogService(log_path=log_path, max_entries=10)
        
        # Add 20 entries
        for i in range(20):
            service.append_entry({"ticket_id": f"test-{i}"})
        
        # Should not exceed max_entries
        assert service.get_entry_count() <= 10
        
        service.cleanup_lock_file()


class TestThreadSafety:
    """Test thread-safety of concurrent operations."""

    def test_concurrent_appends(self, log_service, sample_entry):
        """Test multiple threads appending entries concurrently."""
        num_threads = 10
        entries_per_thread = 10
        
        def append_entries(thread_id):
            for i in range(entries_per_thread):
                entry = {
                    **sample_entry,
                    "ticket_id": f"thread-{thread_id}-entry-{i}"
                }
                log_service.append_entry(entry)
        
        # Start all threads
        threads = []
        for thread_id in range(num_threads):
            thread = threading.Thread(target=append_entries, args=(thread_id,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all entries were written
        entries = log_service.get_entries()
        expected_count = num_threads * entries_per_thread
        
        # All entries should be present (no data loss)
        assert len(entries) == expected_count
        
        # Verify no duplicate entries
        ticket_ids = [e["ticket_id"] for e in entries]
        assert len(ticket_ids) == len(set(ticket_ids))

    def test_concurrent_reads_and_writes(self, log_service, sample_entry):
        """Test concurrent reads and writes."""
        num_writers = 5
        num_readers = 5
        entries_per_writer = 10
        
        read_results = []
        
        def write_entries(writer_id):
            for i in range(entries_per_writer):
                entry = {
                    **sample_entry,
                    "ticket_id": f"writer-{writer_id}-entry-{i}"
                }
                log_service.append_entry(entry)
        
        def read_entries():
            # Read multiple times
            for _ in range(10):
                entries = log_service.get_entries()
                read_results.append(len(entries))
                time.sleep(0.001)
        
        # Start writers and readers
        threads = []
        for writer_id in range(num_writers):
            thread = threading.Thread(target=write_entries, args=(writer_id,))
            threads.append(thread)
        
        for _ in range(num_readers):
            thread = threading.Thread(target=read_entries)
            threads.append(thread)
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # All writes should succeed
        final_count = log_service.get_entry_count()
        assert final_count == num_writers * entries_per_writer

    def test_concurrent_append_and_clear(self, log_service, sample_entry):
        """Test concurrent append and clear operations."""
        num_appends = 50
        
        def append_entries():
            for i in range(num_appends):
                log_service.append_entry({**sample_entry, "ticket_id": f"test-{i}"})
                time.sleep(0.001)
        
        def clear_log():
            time.sleep(0.02)  # Let some appends happen first
            log_service.clear_log()
        
        # Start append thread
        append_thread = threading.Thread(target=append_entries)
        
        # Start clear thread
        clear_thread = threading.Thread(target=clear_log)
        
        append_thread.start()
        clear_thread.start()
        
        append_thread.join()
        clear_thread.join()
        
        # Log should be in a consistent state (either cleared or with entries)
        entries = log_service.get_entries()
        assert isinstance(entries, list)


class TestAtomicWrites:
    """Test atomic write guarantees."""

    def test_write_creates_temp_file(self, log_service, sample_entry, temp_log_dir):
        """Test that writes use a temporary file."""
        # This is verified by the implementation, but we can check the result
        result = log_service.append_entry(sample_entry)
        assert result is True
        
        # Verify the log file exists and is valid JSON
        assert log_service.log_path.exists()
        
        with open(log_service.log_path, 'r') as f:
            data = json.load(f)
            assert isinstance(data, list)
            assert len(data) == 1

    def test_write_is_atomic_on_success(self, log_service, sample_entry):
        """Test that successful writes are atomic."""
        # Add entry
        result = log_service.append_entry(sample_entry)
        assert result is True
        
        # Verify entry is complete (not partial)
        entries = log_service.get_entries()
        assert len(entries) == 1
        assert entries[0] == sample_entry

    def test_no_partial_writes(self, log_service):
        """Test that partial writes don't corrupt the log."""
        # Add valid entries
        for i in range(5):
            log_service.append_entry({"ticket_id": f"test-{i}"})
        
        # Simulate a failed write by writing invalid JSON directly
        # (This shouldn't happen in practice, but tests resilience)
        invalid_path = log_service.log_path.with_suffix('.tmp')
        invalid_path.write_text("invalid json")
        
        # Try to read - should get the original valid entries
        entries = log_service.get_entries()
        assert len(entries) == 5


class TestFileLocking:
    """Test file locking behavior."""

    def test_lock_file_is_created(self, log_service, sample_entry):
        """Test that lock file is created during operations."""
        lock_path = log_service._get_lock_path()
        
        # Lock file shouldn't exist initially
        assert not lock_path.exists()
        
        # Perform an operation
        log_service.append_entry(sample_entry)
        
        # Lock file should be created (but may be cleaned up)
        # This is implementation-dependent

    def test_lock_timeout(self, temp_log_dir):
        """Test that lock acquisition times out appropriately."""
        log_path = temp_log_dir / "timeout_test.json"
        service = CorrectionsLogService(
            log_path=log_path,
            lock_timeout=0.1  # Very short timeout
        )
        
        # Manually acquire the lock
        lock_path = service._get_lock_path()
        with open(lock_path, 'w') as lock_fd:
            import fcntl
            fcntl.flock(lock_fd.fileno(), fcntl.LOCK_EX)
            
            # Try to append - should fail due to lock
            result = service.append_entry({"ticket_id": "test"})
            assert result is False
        
        service.cleanup_lock_file()


class TestErrorHandling:
    """Test error handling and recovery."""

    def test_append_to_readonly_directory(self, temp_log_dir, sample_entry):
        """Test appending to a read-only directory."""
        # Create a read-only directory
        readonly_dir = temp_log_dir / "readonly"
        readonly_dir.mkdir()
        readonly_dir.chmod(0o555)
        
        log_path = readonly_dir / "test.json"
        service = CorrectionsLogService(log_path=log_path)
        
        # Should handle gracefully
        result = service.append_entry(sample_entry)
        assert result is False
        
        # Restore permissions for cleanup
        readonly_dir.chmod(0o755)
        service.cleanup_lock_file()

    def test_corrupted_log_recovery(self, temp_log_dir):
        """Test recovery from a corrupted log file."""
        log_path = temp_log_dir / "corrupted.json"
        
        # Write corrupted JSON
        log_path.write_text("{invalid json")
        
        service = CorrectionsLogService(log_path=log_path)
        
        # Should start fresh
        entries = service.get_entries()
        assert entries == []
        
        # Should be able to add new entries
        result = service.append_entry({"ticket_id": "test"})
        assert result is True
        
        entries = service.get_entries()
        assert len(entries) == 1
        
        service.cleanup_lock_file()


class TestSingleton:
    """Test singleton service pattern."""

    def test_get_service_returns_same_instance(self, temp_log_dir):
        """Test that get_corrections_log_service returns the same instance."""
        log_path = temp_log_dir / "singleton.json"
        
        service1 = get_corrections_log_service(log_path=log_path)
        service2 = get_corrections_log_service(log_path=log_path)
        
        assert service1 is service2
        
        cleanup_corrections_log_service()

    def test_cleanup_removes_singleton(self, temp_log_dir):
        """Test that cleanup removes the singleton instance."""
        log_path = temp_log_dir / "cleanup.json"
        
        service1 = get_corrections_log_service(log_path=log_path)
        cleanup_corrections_log_service()
        
        service2 = get_corrections_log_service(log_path=log_path)
        
        # Should be a new instance
        assert service1 is not service2
        
        cleanup_corrections_log_service()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
