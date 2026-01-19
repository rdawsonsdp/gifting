# Order Confirmation Email Setup

## Overview

The application now sends order confirmation emails to customers automatically when an order is placed. The email includes order details, pricing, and next steps.

## Email Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
# SMTP Configuration (for Gmail, Outlook, or other SMTP servers)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Customize sender information
FROM_EMAIL=noreply@brownsugarbakerychicago.com
FROM_NAME=Brown Sugar Bakery
```

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" at: https://myaccount.google.com/apppasswords
3. Use that app password as `SMTP_PASS` (not your regular Gmail password)

### Other SMTP Providers

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Email Template

The email template is located in `/lib/email.ts` and includes:

- **Order Details**: Order number, date, tier, delivery date, recipient count
- **Order Items**: Product list with quantities and prices
- **Order Summary**: Subtotal, fulfillment fees, and total
- **Order Notes**: Customer notes if provided
- **Next Steps**: What happens after order placement
- **Invoice Link**: Direct link to Shopify invoice

### Template Customization

The email template includes HTML comments with instructions for customization:

1. **Update Branding**: Replace colors, logo, brand name
2. **Update Content**: Customize messaging and "What Happens Next?" section
3. **Update Contact Info**: Phone number, website, social media
4. **Add Attachments**: Excel file, PDF invoice, product images
5. **Add Personalization**: Company logo, product recommendations

See the HTML comments in `/lib/email.ts` for detailed customization instructions.

## Email Behavior

### When Email is Configured

- ✅ Email is sent automatically when order is placed
- ✅ Email includes all order details
- ✅ Excel file is attached if available
- ✅ Order creation succeeds even if email fails

### When Email is NOT Configured

- ⚠️ Order is still created successfully
- ⚠️ Email sending is skipped (logged to console)
- ⚠️ No error is shown to the customer
- ✅ All other functionality works normally

## Error Handling

The email sending is designed to be non-blocking:

- If email fails, the order is still created successfully
- Email errors are logged to the console
- Email status is included in the API response
- Customer sees success message regardless of email status

## Testing

1. **Configure SMTP settings** in `.env.local`
2. **Place a test order** through the application
3. **Check customer email** for confirmation
4. **Check server logs** for email sending status
5. **Verify email formatting** on different email clients

## Email Content Preview

The email includes:

- Professional HTML layout with brand colors
- Plain text fallback for email clients
- Responsive design for mobile devices
- Clear call-to-action (View Invoice button)
- Contact information and next steps

## Future Enhancements

Potential improvements:

- [ ] Email templates for different order statuses
- [ ] PDF invoice attachment
- [ ] Product images in email
- [ ] Personalized product recommendations
- [ ] Multi-language support
- [ ] Email tracking and analytics
- [ ] Automated follow-up emails

## Troubleshooting

### Email Not Sending

1. Check `.env.local` has correct SMTP credentials
2. Verify SMTP settings match your provider
3. Check server logs for error messages
4. Test SMTP connection manually
5. Ensure firewall allows SMTP ports

### Email Goes to Spam

1. Configure SPF records for your domain
2. Set up DKIM signing
3. Use a professional FROM_EMAIL address
4. Avoid spam trigger words
5. Test email deliverability

### Email Formatting Issues

1. Test on multiple email clients
2. Check HTML validity
3. Verify images load correctly
4. Test mobile responsiveness
5. Check plain text version

## Support

For email configuration issues:
- Check server logs: `npm run dev` shows email sending status
- Test SMTP connection: Use nodemailer test script
- Verify credentials: Double-check `.env.local` values
