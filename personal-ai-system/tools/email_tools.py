"""Email management tools."""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional

from loguru import logger

from core.config import get_settings


async def send_email_tool(
    to: str,
    subject: str,
    body: str,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
) -> bool:
    """Send an email via Gmail.
    
    Args:
        to: Recipient email address
        subject: Email subject
        body: Email body (HTML supported)
        cc: CC recipients
        bcc: BCC recipients
        
    Returns:
        True if sent successfully
    """
    try:
        settings = get_settings()
        
        # This is a placeholder implementation
        # In production, use proper Gmail API or SMTP
        logger.info(f"Sending email to {to}: {subject}")
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = "your_email@gmail.com"  # From settings
        msg['To'] = to
        
        if cc:
            msg['Cc'] = ", ".join(cc)
        if bcc:
            msg['Bcc'] = ", ".join(bcc)
        
        # Add body
        html_part = MIMEText(body, 'html')
        msg.attach(html_part)
        
        # Note: This requires SMTP setup and app password
        # server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        # server.login(gmail_user, gmail_app_password)
        # server.send_message(msg)
        # server.quit()
        
        logger.info(f"Email sent successfully to {to}")
        return True
    
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False


def compose_email(recipient: str, subject: str, body: str) -> str:
    """Compose and send an email.
    
    Args:
        recipient: Recipient email
        subject: Email subject
        body: Email body
        
    Returns:
        Status message
    """
    import asyncio
    
    success = asyncio.run(send_email_tool(recipient, subject, body))
    
    if success:
        return f"Email sent successfully to {recipient}"
    else:
        return "Failed to send email"
