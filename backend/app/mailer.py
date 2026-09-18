import smtplib
from email.message import EmailMessage

from .config import settings


def send_email(to_email: str, subject: str, body: str) -> None:
    if not settings.smtp_host or not settings.smtp_from_email:
        if settings.dev_print_email_links:
            print(f"\n[DEV EMAIL] To: {to_email}\nSubject: {subject}\n\n{body}\n")
            return
        raise RuntimeError("SMTP is not configured. Add SMTP_HOST and SMTP_FROM_EMAIL to the backend environment.")
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_username:
            server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)
