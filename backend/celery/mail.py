import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'ali@example.com'
SENDER_PASSWORD = ''

def send_email(to, subject, content):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL

    msg.attach(MIMEText(content, 'html'))

    try:
        with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
            if SENDER_PASSWORD:
                client.login(SENDER_EMAIL, SENDER_PASSWORD)
            client.send_message(msg)
        print(f"Email sent successfully to {to}")
    except Exception as e:
        print(f"Failed to send email to {to}: {e}")


#send_email('ali@example.com', 'Test', '<h1>This is a test email</h1>')