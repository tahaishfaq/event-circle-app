import nodemailer from "nodemailer"
import { generateInvoicePDF } from "./ticketGenerator"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendTicketEmail({ to, attendeeName, eventName, ticketPDF, invoiceData }) {
  try {
    // Generate invoice PDF
    const invoicePDF = await generateInvoicePDF({
      ...invoiceData,
      customerName: attendeeName,
      customerEmail: to,
      eventName,
    })

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: to,
      subject: `Your ticket for ${eventName} - Event Circle`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Event Circle</h1>
            <h2>Your Ticket Confirmation</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${attendeeName},</p>
            
            <p>Thank you for purchasing tickets for <strong>${eventName}</strong>!</p>
            
            <p>Your payment has been successfully processed and your tickets are attached to this email.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Important Information:</h3>
              <ul>
                <li>Please bring your ticket (digital or printed) to the event</li>
                <li>Arrive at least 15 minutes before the event starts</li>
                <li>Your ticket includes a QR code for quick entry</li>
                <li>This ticket is non-transferable</li>
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us at support@eventcircle.com</p>
            
            <p>We look forward to seeing you at the event!</p>
            
            <p>Best regards,<br>The Event Circle Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>Event Circle | support@eventcircle.com</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `ticket-${eventName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`,
          content: ticketPDF,
          contentType: "application/pdf",
        },
        {
          filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
          content: invoicePDF,
          contentType: "application/pdf",
        },
      ],
    }

    await transporter.sendMail(mailOptions)
    console.log(`Ticket email sent to ${to}`)
  } catch (error) {
    console.error("Error sending ticket email:", error)
    throw error
  }
}

export async function sendPayoutNotification({ to, creatorName, eventName, amount }) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: to,
      subject: `New payout available - Event Circle`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>Event Circle</h1>
            <h2>Payout Available</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${creatorName},</p>
            
            <p>Great news! You have a new payout available from ticket sales for your event <strong>${eventName}</strong>.</p>
            
            <div style="background: #f0fdf4; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h3 style="color: #10b981; margin: 0;">Payout Amount</h3>
              <h2 style="color: #10b981; margin: 10px 0;">R${amount.toFixed(2)}</h2>
            </div>
            
            <p>To withdraw your earnings:</p>
            <ol>
              <li>Log in to your Event Circle account</li>
              <li>Go to your Finance dashboard</li>
              <li>Add your bank details if you haven't already</li>
              <li>Request a withdrawal</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/finance" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Finance Dashboard
              </a>
            </div>
            
            <p>Withdrawals are processed within 2-3 business days.</p>
            
            <p>Best regards,<br>The Event Circle Team</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Payout notification sent to ${to}`)
  } catch (error) {
    console.error("Error sending payout notification:", error)
    throw error
  }
}
