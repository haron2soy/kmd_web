from django.conf import settings
from django.core.mail import EmailMultiAlternatives


def send_register_email(user_email, verification_link, verification_code):

    company_name = "Regional Specialized Meteorological Center (RSMC) Nairobi"
    support_email = "support@rsmc.meteo.go.ke"
    logo_url = f"{settings.FRONTEND_URL}/logo.png"

    subject = "Verify Your Account"

    # ---------------------------------------------------------
    # Plain text email
    # ---------------------------------------------------------
    text_content = f"""
Welcome to {company_name}

Please verify your email address.

Verification link:
{verification_link}

Verification code:
{verification_code}

This link expires in 24 hours.

If you did not create an account, please ignore this email.

{company_name}
{support_email}
"""

    # ---------------------------------------------------------
    # HTML email
    # ---------------------------------------------------------
    html_content = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:30px 0;">
<tr>
<td align="center">

<table width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">

<tr>
<td style="background:#0b5ed7;padding:20px;text-align:center;">
<img src="{logo_url}" alt="{company_name}" style="height:50px;">
</td>
</tr>

<tr>
<td style="padding:40px;color:#333;">

<h2 style="margin-top:0;">Verify Your Email Address</h2>

<p>
Thank you for registering with <strong>{company_name}</strong>.
Please confirm your email address to activate your account.
</p>

<div style="text-align:center;margin:35px 0;">
<a href="{verification_link}"
style="
background:#28a745;
color:#ffffff;
padding:14px 28px;
text-decoration:none;
border-radius:6px;
font-size:16px;
font-weight:bold;
display:inline-block;">
Verify My Account
</a>
</div>

<p>If the button does not work, copy and paste the link below:</p>

<p style="word-break:break-all;color:#0b5ed7;">
<a href="{verification_link}">{verification_link}</a>
</p>

<p>Alternatively, use this verification code:</p>

<p style="font-size:20px;font-weight:bold;letter-spacing:2px;">
{verification_code}
</p>

<p style="color:#777;font-size:14px;">
This verification link will expire in 24 hours.
</p>

</td>
</tr>

<tr>
<td style="background:#f7f7f7;padding:20px;text-align:center;color:#777;font-size:13px;">

<p style="margin:0;">© {company_name}</p>

<p style="margin:5px 0;">
Need help? Contact
<a href="mailto:{support_email}" style="color:#0b5ed7;text-decoration:none;">
{support_email}
</a>
</p>

<p style="margin:5px 0;">
This is an automated message. Please do not reply.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
"""

    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user_email],
    )

    email_message.attach_alternative(html_content, "text/html")
    email_message.send(fail_silently=False)