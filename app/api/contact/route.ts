import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle?: string;
  estimatedRecipients: string;
  budgetRange: string;
  preferredTier?: string;
  eventDate?: string;
  message: string;
}

// Email configuration - Update these in .env.local
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

const RECIPIENT_EMAIL = 'robert@simplybusinessapps.com';

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.company || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data');
    try {
      await mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Save to JSON file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `contact-${timestamp}.json`;
    const filePath = join(dataDir, filename);

    const contactData = {
      ...data,
      submittedAt: new Date().toISOString(),
    };

    await writeFile(filePath, JSON.stringify(contactData, null, 2), 'utf-8');

    // Also save to latest file
    const latestPath = join(dataDir, 'contact-latest.json');
    await writeFile(latestPath, JSON.stringify(contactData, null, 2), 'utf-8');

    // Format email content
    const emailSubject = `Corporate Gifting Inquiry from ${data.company}`;
    const emailBody = `
New Corporate Gifting Inquiry

Contact Information:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Company: ${data.company}
${data.jobTitle ? `- Job Title: ${data.jobTitle}` : ''}

Order Details:
- Estimated Recipients: ${data.estimatedRecipients}
- Budget Range: ${data.budgetRange}
${data.preferredTier ? `- Preferred Tier: ${data.preferredTier}` : ''}
${data.eventDate ? `- Event Date: ${data.eventDate}` : ''}

Message:
${data.message}

Submitted: ${new Date().toLocaleString()}
    `.trim();

    // Send email if SMTP is configured
    if (EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass) {
      try {
        const transporter = nodemailer.createTransport(EMAIL_CONFIG);
        
        await transporter.sendMail({
          from: `"Brown Sugar Bakery" <${EMAIL_CONFIG.auth.user}>`,
          to: RECIPIENT_EMAIL,
          replyTo: data.email,
          subject: emailSubject,
          text: emailBody,
          html: `
            <h2>New Corporate Gifting Inquiry</h2>
            <h3>Contact Information</h3>
            <ul>
              <li><strong>Name:</strong> ${data.name}</li>
              <li><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></li>
              <li><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></li>
              <li><strong>Company:</strong> ${data.company}</li>
              ${data.jobTitle ? `<li><strong>Job Title:</strong> ${data.jobTitle}</li>` : ''}
            </ul>
            <h3>Order Details</h3>
            <ul>
              <li><strong>Estimated Recipients:</strong> ${data.estimatedRecipients}</li>
              <li><strong>Budget Range:</strong> ${data.budgetRange}</li>
              ${data.preferredTier ? `<li><strong>Preferred Tier:</strong> ${data.preferredTier}</li>` : ''}
              ${data.eventDate ? `<li><strong>Event Date:</strong> ${data.eventDate}</li>` : ''}
            </ul>
            <h3>Message</h3>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Submitted: ${new Date().toLocaleString()}</small></p>
          `,
        });
        
        console.log('Email sent successfully to', RECIPIENT_EMAIL);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails - data is still saved
      }
    } else {
      console.log('Email not configured. Contact form data saved to:', filePath);
      console.log('Email would be sent to:', RECIPIENT_EMAIL);
      console.log('Subject:', emailSubject);
      console.log('Body:', emailBody);
    }

    return NextResponse.json(
      { success: true, message: 'Thank you! Someone will contact you shortly.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
