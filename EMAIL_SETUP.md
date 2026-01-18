# Email Setup for Contact Form

The contact form saves submissions to JSON files and can send emails when configured.

## Email Configuration

To enable email sending, create a `.env.local` file in the root directory with the following variables:

```env
# SMTP Configuration (for Gmail, Outlook, or other SMTP servers)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# For Gmail:
# 1. Enable 2-factor authentication
# 2. Generate an "App Password" at: https://myaccount.google.com/apppasswords
# 3. Use that app password as SMTP_PASS
```

## Email Recipient

Emails are sent to: **robert@simplybusinessapps.com**

## Without Email Configuration

If email is not configured, the form will still work:
- All submissions are saved to `/data/contact-*.json` files
- A timestamped file is created for each submission
- The latest submission is saved to `/data/contact-latest.json`
- Email content is logged to the console

## Testing

1. Fill out the contact form at `/contact`
2. Submit the form
3. Check `/data/contact-latest.json` for the submission
4. If email is configured, check robert@simplybusinessapps.com inbox
