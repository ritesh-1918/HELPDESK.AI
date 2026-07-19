import os
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def audit_aws_iam():
    logger.info("Starting AWS IAM Audit...")
    try:
        import boto3
        # Attempt to initialize the IAM client
        if os.environ.get('AWS_ACCESS_KEY_ID') and os.environ.get('AWS_SECRET_ACCESS_KEY'):
            iam = boto3.client('iam')
            response = iam.list_roles()
            roles = response.get('Roles', [])
            for role in roles:
                logger.info(f"Auditing AWS Role: {role['RoleName']}")
                # A basic check for attached policies; full least privilege analysis would involve Access Analyzer
                attached_policies = iam.list_attached_role_policies(RoleName=role['RoleName'])
                for policy in attached_policies.get('AttachedPolicies', []):
                    logger.info(f"  Attached Policy: {policy['PolicyName']}")
                    if policy['PolicyName'] == 'AdministratorAccess':
                        logger.warning(f"  WARNING: Role {role['RoleName']} has AdministratorAccess. Verify if least privilege is violated.")
        else:
            logger.info("AWS credentials not found. Skipping AWS IAM audit.")
    except Exception as e:
        logger.error(f"Error during AWS IAM audit: {e}")

def audit_gcp_iam():
    logger.info("Starting GCP IAM Audit...")
    try:
        if os.environ.get('GCP_CREDENTIALS') and os.environ.get('GCP_PROJECT'):
            from google.oauth2 import service_account
            from googleapiclient.discovery import build

            credentials_info = json.loads(os.environ['GCP_CREDENTIALS'])
            credentials = service_account.Credentials.from_service_account_info(credentials_info)
            project_id = os.environ['GCP_PROJECT']
            
            crm_service = build('cloudresourcemanager', 'v1', credentials=credentials)
            policy = crm_service.projects().getIamPolicy(resource=project_id).execute()
            
            bindings = policy.get('bindings', [])
            for binding in bindings:
                role = binding.get('role')
                members = binding.get('members', [])
                logger.info(f"Auditing GCP Role: {role}")
                if role == 'roles/owner':
                    logger.warning(f"  WARNING: The following members have Owner role: {', '.join(members)}. Verify if least privilege is violated.")
        else:
            logger.info("GCP credentials not found. Skipping GCP IAM audit.")
    except Exception as e:
        logger.error(f"Error during GCP IAM audit: {e}")

if __name__ == "__main__":
    logger.info("--- IAM Least Privilege Audit Started ---")
    audit_aws_iam()
    audit_gcp_iam()
    logger.info("--- IAM Least Privilege Audit Completed ---")
