import os
import sys
import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format="[AuditRetention] %(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Ensure parent path is in python path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from supabase import create_client

def get_supabase_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured in environment.")
        return None
    return create_client(url, key)

def upload_to_s3(bucket: str, file_path: Path, object_name: str) -> bool:
    try:
        import boto3
        s3 = boto3.client("s3")
        s3.upload_file(str(file_path), bucket, object_name)
        logger.info(f"Successfully archived to S3 bucket '{bucket}' as '{object_name}'")
        return True
    except ImportError:
        logger.warning("boto3 not installed. Skipping Amazon S3 upload.")
    except Exception as e:
        logger.error(f"Failed to upload to S3: {e}")
    return False

def upload_to_gcs(bucket: str, file_path: Path, object_name: str) -> bool:
    try:
        from google.cloud import storage
        client = storage.Client()
        bucket_obj = client.bucket(bucket)
        blob = bucket_obj.blob(object_name)
        blob.upload_from_filename(str(file_path))
        logger.info(f"Successfully archived to GCS bucket '{bucket}' as '{object_name}'")
        return True
    except ImportError:
        logger.warning("google-cloud-storage not installed. Skipping Google Cloud Storage upload.")
    except Exception as e:
        logger.error(f"Failed to upload to GCS: {e}")
    return False

def upload_to_azure(connection_string: str, container: str, file_path: Path, blob_name: str) -> bool:
    try:
        from azure.storage.blob import BlobServiceClient
        service_client = BlobServiceClient.from_connection_string(connection_string)
        blob_client = service_client.get_blob_client(container=container, blob=blob_name)
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        logger.info(f"Successfully archived to Azure Container '{container}' as '{blob_name}'")
        return True
    except ImportError:
        logger.warning("azure-storage-blob not installed. Skipping Azure Blob Storage upload.")
    except Exception as e:
        logger.error(f"Failed to upload to Azure Blob Storage: {e}")
    return False

def main():
    logger.info("Starting audit log retention and archival sweep.")
    supabase = get_supabase_client()
    if not supabase:
        sys.exit(1)

    now = datetime.now(timezone.utc)
    one_year_ago = now - timedelta(days=365)
    one_year_ago_str = one_year_ago.isoformat()

    # 1. Query all logs older than 1 year for archiving
    logger.info(f"Fetching audit logs older than 1 year (before {one_year_ago_str})")
    try:
        res = supabase.table("enterprise_audit_logs").select("*").lte("timestamp", one_year_ago_str).order("timestamp", desc=False).execute()
        expired_logs = res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch expired logs from database: {e}")
        sys.exit(1)

    if not expired_logs:
        logger.info("No audit logs older than 1 year found for archival. Work complete.")
        sys.exit(0)

    logger.info(f"Found {len(expired_logs)} records to archive.")

    # 2. Serialize and write locally first as fallback / temporary staging
    archive_dir = Path(__file__).parent.parent / "data" / "archive"
    archive_dir.mkdir(parents=True, exist_ok=True)
    
    file_name = f"audit_archive_{one_year_ago.strftime('%Y%m%d')}_{now.strftime('%Y%m%d')}.json"
    local_file_path = archive_dir / file_name
    
    with open(local_file_path, "w", encoding="utf-8") as f:
        json.dump(expired_logs, f, default=str, indent=2)
    logger.info(f"Staged archived logs locally at: {local_file_path}")

    # 3. Attempt uploads to configured cloud targets
    archived_successfully = False

    # Target A: AWS S3
    s3_bucket = os.environ.get("AUDIT_ARCHIVE_S3_BUCKET")
    if s3_bucket:
        if upload_to_s3(s3_bucket, local_file_path, f"audit-logs/{file_name}"):
            archived_successfully = True

    # Target B: Google Cloud Storage
    gcs_bucket = os.environ.get("AUDIT_ARCHIVE_GCS_BUCKET")
    if gcs_bucket:
        if upload_to_gcs(gcs_bucket, local_file_path, f"audit-logs/{file_name}"):
            archived_successfully = True

    # Target C: Azure Blob Storage
    azure_conn = os.environ.get("AUDIT_ARCHIVE_AZURE_CONNECTION_STRING")
    azure_container = os.environ.get("AUDIT_ARCHIVE_AZURE_CONTAINER", "audit-logs")
    if azure_conn:
        if upload_to_azure(azure_conn, azure_container, local_file_path, file_name):
            archived_successfully = True

    # Fallback: if no cloud target is configured, we keep local archive as source-of-truth
    if not (s3_bucket or gcs_bucket or azure_conn):
        logger.info("No cloud archival targets configured. Keeping local archive staging as primary storage.")
        archived_successfully = True

    # 4. If archived successfully, purge from Hot database table via RPC bypass
    if archived_successfully:
        logger.info("Archival verified. Proceeding to purge records from hot database storage.")
        try:
            purge_res = supabase.rpc("purge_expired_logs", {"expired_before": one_year_ago_str}).execute()
            purged_count = purge_res.data or 0
            logger.info(f"Successfully purged {purged_count} records from hot database storage.")
        except Exception as e:
            logger.error(f"Failed to purge expired records from database: {e}")
            sys.exit(1)
    else:
        logger.error("Archival to cloud targets failed and no local bypass configured. Aborting database purge to prevent data loss.")
        sys.exit(1)

    logger.info("Audit log retention sweep finished successfully.")

if __name__ == "__main__":
    main()
