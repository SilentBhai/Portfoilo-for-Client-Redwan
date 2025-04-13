import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    // Use a variable for form name for consistency
    const formName = "RDH JUNIOR"; // Updated form name

    // Validate form inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create transporter with better error detection
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465', // Auto-detect if secure is needed
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // Helps with self-signed certificates
        }
      });
    } catch (smtpConfigError) {
      console.error('SMTP Configuration error:', smtpConfigError);
      return NextResponse.json(
        { error: 'Server email configuration error. Please contact the administrator.' },
        { status: 500 }
      );
    }

    // Base URL for absolute paths
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Updated recipient email
    const recipientEmail = "ratulahmedreadhoan123@gmail.com";

    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@rdhjunior.com',
      to: recipientEmail,
      subject: `${formName} Contact: ${subject}`,
      replyTo: email,
      text: `
Form: ${formName}
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
  <!-- Logo Header -->
  <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
    <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
      <tr>
        <td>
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 8px; display: inline-block; text-align: center; line-height: 50px; color: white; font-weight: bold; position: relative; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            RDH
            <div style="position: absolute; bottom: -5px; right: -5px; width: 20px; height: 20px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 4px; opacity: 0.8;"></div>
          </div>
        </td>
        <td style="padding-left: 15px; text-align: left;">
          <div style="font-size: 18px; font-weight: bold; color: #333;">Redwan Ahmed Ratul</div>
          <div style="font-size: 12px; color: #666;">Esports Caster</div>
        </td>
      </tr>
    </table>
  </div>

  <h2 style="color: #3b82f6; margin-bottom: 20px;">New Contact Form Submission</h2>
  <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
    The following message was submitted through the ${formName} contact form:
  </p>
  
  <div style="margin-bottom: 25px;">
    <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
    <p style="margin-bottom: 10px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></p>
    <p style="margin-bottom: 10px;"><strong>Subject:</strong> ${subject}</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #3b82f6;">
    <h3 style="margin-top: 0; color: #4b5563; font-size: 16px;">Message:</h3>
    <p style="white-space: pre-line; color: #4b5563; font-size: 14px;">${message}</p>
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
    <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} ${formName}. All rights reserved.</p>
    <p style="font-size: 11px; color: #9ca3af;">This is an automated email sent from your portfolio contact form.</p>
  </div>
</div>
      `,
    };

    // Verify transporter connection and send mail with better error handling
    try {
      // Verify SMTP connection first
      await transporter.verify();
      
      // Send the email
      await transporter.sendMail(mailOptions);
      
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 }
      );
    } catch (emailError: any) {
      // Handle different types of email errors
      console.error('Email sending error:', emailError);
      
      let errorMessage = 'Failed to send email. Please try again later.';
      let statusCode = 500;
      
      // Detect specific SMTP errors
      if (emailError.code === 'ECONNREFUSED') {
        errorMessage = 'Could not connect to email server. Please try again later.';
      } else if (emailError.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please contact the administrator.';
        statusCode = 503;
      } else if (emailError.responseCode >= 400) {
        errorMessage = `Email server error: ${emailError.response || 'Unknown error'}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('General error in contact API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
} 