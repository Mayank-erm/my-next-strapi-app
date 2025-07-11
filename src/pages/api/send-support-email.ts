// src/pages/api/send-support-email.ts - API ROUTE FOR SENDING SUPPORT EMAILS
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

interface SupportRequest {
  name: string;
  email: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  message: string;
  timestamp: string;
  userAgent: string;
}

// Email configuration - Replace with your actual email service credentials
const emailConfig = {
  // For Gmail/Google Workspace
  service: 'gmail',
  auth: {
    user: process.env.SUPPORT_EMAIL_USER || 'support@commercialcontenthub.com',
    pass: process.env.SUPPORT_EMAIL_PASSWORD || 'your-app-password'
  }
  
  // Alternative: For custom SMTP server
  // host: process.env.SMTP_HOST || 'smtp.your-domain.com',
  // port: parseInt(process.env.SMTP_PORT || '587'),
  // secure: process.env.SMTP_SECURE === 'true',
  // auth: {
  //   user: process.env.SMTP_USER || 'support@commercialcontenthub.com',
  //   pass: process.env.SMTP_PASSWORD || 'your-password'
  // }
};

// Create reusable transporter object
const createTransporter = () => {
  return nodemailer.createTransporter(emailConfig);
};

// Generate support ticket ID
const generateTicketId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CCH-${timestamp}-${random}`.toUpperCase();
};

// Format priority with emoji and color
const formatPriority = (priority: string): string => {
  const priorityMap = {
    low: '🟢 Low',
    medium: '🟡 Medium', 
    high: '🟠 High',
    urgent: '🔴 Urgent'
  };
  return priorityMap[priority as keyof typeof priorityMap] || priority;
};

// Format category for better readability
const formatCategory = (category: string): string => {
  const categoryMap = {
    general: 'General Question',
    technical: 'Technical Issue',
    account: 'Account & Billing',
    feature: 'Feature Request',
    bug: 'Bug Report',
    training: 'Training & Documentation',
    integration: 'API & Integration',
    security: 'Security & Privacy'
  };
  return categoryMap[category as keyof typeof categoryMap] || category;
};

// Create HTML email template
const createEmailTemplate = (data: SupportRequest, ticketId: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Request - ${ticketId}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #007A5F 0%, #00382C 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .ticket-id { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-size: 14px; font-weight: 500; }
        .content { padding: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #007A5F; }
        .info-label { font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 14px; }
        .message-section { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .message-header { font-weight: 600; color: #374151; margin-bottom: 15px; display: flex; align-items: center; }
        .message-content { white-space: pre-wrap; line-height: 1.6; color: #4b5563; }
        .metadata { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .metadata h3 { margin: 0 0 15px 0; color: #374151; font-size: 16px; }
        .metadata-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .metadata-item { font-size: 12px; }
        .metadata-label { font-weight: 600; color: #6b7280; }
        .metadata-value { color: #4b5563; margin-top: 2px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; color: #6b7280; font-size: 12px; }
        .priority-urgent { border-left-color: #dc2626 !important; }
        .priority-high { border-left-color: #ea580c !important; }
        .priority-medium { border-left-color: #d97706 !important; }
        .priority-low { border-left-color: #16a34a !important; }
        @media (max-width: 600px) {
          .info-grid, .metadata-grid { grid-template-columns: 1fr; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 New Support Request</h1>
          <div class="ticket-id">Ticket ID: ${ticketId}</div>
        </div>
        
        <div class="content">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">👤 Customer Name</div>
              <div class="info-value">${data.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">📧 Email Address</div>
              <div class="info-value">${data.email}</div>
            </div>
            <div class="info-item priority-${data.priority}">
              <div class="info-label">⚡ Priority Level</div>
              <div class="info-value">${formatPriority(data.priority)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">📂 Category</div>
              <div class="info-value">${formatCategory(data.category)}</div>
            </div>
          </div>
          
          <div class="info-item" style="margin-bottom: 20px;">
            <div class="info-label">📋 Subject</div>
            <div class="info-value" style="font-size: 16px; font-weight: 500;">${data.subject}</div>
          </div>
          
          <div class="message-section">
            <div class="message-header">
              💬 Customer Message
            </div>
            <div class="message-content">${data.message}</div>
          </div>
          
          <div class="metadata">
            <h3>📊 Request Metadata</h3>
            <div class="metadata-grid">
              <div class="metadata-item">
                <div class="metadata-label">⏰ Submitted At</div>
                <div class="metadata-value">${new Date(data.timestamp).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">🌐 User Agent</div>
                <div class="metadata-value">${data.userAgent}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">🎫 Ticket ID</div>
                <div class="metadata-value">${ticketId}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">📱 Platform</div>
                <div class="metadata-value">Commercial Content Hub</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>This support request was automatically generated from the Commercial Content Hub platform.</p>
          <p>Please respond to the customer at: <strong>${data.email}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create plain text version
const createTextTemplate = (data: SupportRequest, ticketId: string): string => {
  return `
NEW SUPPORT REQUEST - ${ticketId}
========================================

Customer Information:
---------------------
Name: ${data.name}
Email: ${data.email}
Priority: ${formatPriority(data.priority)}
Category: ${formatCategory(data.category)}

Subject: ${data.subject}

Message:
--------
${data.message}

Request Details:
---------------
Ticket ID: ${ticketId}
Submitted: ${new Date(data.timestamp).toLocaleString()}
User Agent: ${data.userAgent}
Platform: Commercial Content Hub

Please respond to the customer at: ${data.email}
  `.trim();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Validate request body
    const data: SupportRequest = req.body;
    
    // Basic validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, subject, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Generate ticket ID
    const ticketId = generateTicketId();

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return res.status(500).json({
        error: 'Email service unavailable',
        message: 'Unable to send email at this time. Please try again later.'
      });
    }

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'Commercial Content Hub Support',
        address: process.env.SUPPORT_EMAIL_USER || 'support@commercialcontenthub.com'
      },
      to: [
        process.env.SUPPORT_EMAIL_RECIPIENT || 'support@commercialcontenthub.com',
        // Add additional recipients as needed
        // 'tech-support@commercialcontenthub.com',
        // 'customer-success@commercialcontenthub.com'
      ],
      subject: `🎫 [${ticketId}] ${formatPriority(data.priority)} - ${data.subject}`,
      text: createTextTemplate(data, ticketId),
      html: createEmailTemplate(data, ticketId),
      // Set reply-to as customer email for easy responses
      replyTo: {
        name: data.name,
        address: data.email
      },
      // Add headers for better email management
      headers: {
        'X-Priority': data.priority === 'urgent' ? '1' : data.priority === 'high' ? '2' : '3',
        'X-Support-Category': data.category,
        'X-Ticket-ID': ticketId,
        'X-Customer-Email': data.email
      }
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Support email sent successfully:', {
      ticketId,
      messageId: info.messageId,
      customer: data.email,
      priority: data.priority,
      category: data.category
    });

    // Send confirmation email to customer (optional)
    if (process.env.SEND_CUSTOMER_CONFIRMATION === 'true') {
      const customerConfirmation = {
        from: {
          name: 'Commercial Content Hub Support',
          address: process.env.SUPPORT_EMAIL_USER || 'support@commercialcontenthub.com'
        },
        to: data.email,
        subject: `✅ Support Request Received - ${ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #007A5F 0%, #00382C 100%); color: white; padding: 20px; text-align: center;">
              <h1>Thank You for Contacting Support</h1>
            </div>
            <div style="padding: 30px;">
              <p>Hi ${data.name},</p>
              <p>We've received your support request and our team will get back to you within 4-6 hours during business hours.</p>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <strong>Your Support Request:</strong><br>
                <strong>Ticket ID:</strong> ${ticketId}<br>
                <strong>Subject:</strong> ${data.subject}<br>
                <strong>Priority:</strong> ${formatPriority(data.priority)}
              </div>
              <p>If you need immediate assistance, you can also reach us at:</p>
              <ul>
                <li>Email: support@commercialcontenthub.com</li>
                <li>Live Chat: Available Mon-Fri 9AM-6PM EST</li>
              </ul>
              <p>Best regards,<br>Commercial Content Hub Support Team</p>
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(customerConfirmation);
        console.log('Customer confirmation email sent:', ticketId);
      } catch (confirmationError) {
        console.error('Failed to send customer confirmation:', confirmationError);
        // Don't fail the main request if confirmation email fails
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Support request submitted successfully',
      ticketId: ticketId,
      estimatedResponse: '4-6 hours during business hours'
    });

  } catch (error) {
    console.error('Support email error:', error);
    
    // Return appropriate error response
    res.status(500).json({
      error: 'Failed to submit support request',
      message: 'An error occurred while processing your request. Please try again or contact us directly at support@commercialcontenthub.com'
    });
  }
}

// Export configuration to handle larger request bodies if needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};