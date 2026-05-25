"""
Email Service using Resend API
Sends user approval/rejection emails from noreply@helpdesk.ai
"""
import os
import resend
from resend import Emails

# Initialize Resend with API key from environment
resend.api_key = os.environ.get("RESEND_API_KEY", "")

SENDER_EMAIL = "HelpDesk AI <noreply@helpdesk.ai>"


def send_approval_email(user_email: str, user_name: str) -> bool:
    """
    Send approval email to a newly approved user.
    Returns True on success, False on failure.
    """
    if not resend.api_key:
        print(f"[email_service] RESEND_API_KEY not set — skipping approval email to {user_email}")
        return False

    try:
        Emails.send({
            "from": SENDER_EMAIL,
            "to": [user_email],
            "subject": "Your HelpDesk AI Account Has Been Approved!",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">Welcome to HelpDesk AI! 🎉</h2>
                    <p>Hi {user_name},</p>
                    <p>Great news! Your account has been approved by our admin team. You can now log in and start using HelpDesk AI to resolve your IT issues.</p>
                    <a href="{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/login"
                       style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                        Log In Now
                    </a>
                    <p style="color: #64748b; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
                    <p>Best regards,<br>HelpDesk AI Team</p>
                </div>
            """,
        })
        print(f"[email_service] Approval email sent to {user_email}")
        return True
    except Exception as e:
        print(f"[email_service] Failed to send approval email to {user_email}: {e}")
        return False


def send_rejection_email(user_email: str, user_name: str) -> bool:
    """
    Send rejection email to a user whose account was not approved.
    Returns True on success, False on failure.
    """
    if not resend.api_key:
        print(f"[email_service] RESEND_API_KEY not set — skipping rejection email to {user_email}")
        return False

    try:
        Emails.send({
            "from": SENDER_EMAIL,
            "to": [user_email],
            "subject": "Update on Your HelpDesk AI Account Request",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #ef4444;">Account Request Update</h2>
                    <p>Hi {user_name},</p>
                    <p>Thank you for your interest in HelpDesk AI. After review, we're unable to approve your account request at this time.</p>
                    <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
                    <p>Best regards,<br>HelpDesk AI Team</p>
                </div>
            """,
        })
        print(f"[email_service] Rejection email sent to {user_email}")
        return True
    except Exception as e:
        print(f"[email_service] Failed to send rejection email to {user_email}: {e}")
        return False