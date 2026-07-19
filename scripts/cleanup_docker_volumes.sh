#!/bin/bash
# cleanup_docker_volumes.sh
# Script to clean up dangling Docker volumes

echo "Cleaning up dangling Docker volumes..."

# Remove all unused local volumes
# -f or --force bypasses the confirmation prompt
docker volume prune -f

echo "Cleanup complete."
