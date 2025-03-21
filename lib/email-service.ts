import type { CartItem } from "@/types/cart"
import { Resend } from 'resend'

// Initialize Resend with your API key
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY)

// Email configuration
const EMAIL_CONFIG = {
  from: 'Sen Jewels <noreplysenjewels@gmail.com>',
  replyTo: 'senjutibiswas05@gmail.com'
} as const

// Email templates with better styling
function getOrderStatusEmailTemplate(
  orderId: string,
  customerName: string,
  status: 'processing' | 'completed',
  trackingInfo?: {
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
  }
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0d9488; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { 
            display: inline-block;
            padding: 10px 20px;
            background-color: #0d9488;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
          .tracking-info {
            background: #f3f4f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order ${status === 'processing' ? 'Update' : 'Shipped'}!</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            ${status === 'processing' 
              ? `<p>Great news! Your order #${orderId} is being processed. Our team is carefully preparing your items for shipment.</p>
                 <p>We'll send you another update when your order ships.</p>`
              : `<p>Exciting news! Your order #${orderId} is on its way to you!</p>`
            }
            
            ${trackingInfo ? `
              <div class="tracking-info">
                <h3>Tracking Information</h3>
                <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
                <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
                ${trackingInfo.trackingUrl ? `
                  <p><a href="${trackingInfo.trackingUrl}" class="button">Track Your Package</a></p>
                ` : ''}
              </div>
            ` : ''}
            
            <p>If you have any questions about your order, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with Sen Jewels!</p>
            <p>© ${new Date().getFullYear()} Sen Jewels. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export async function sendOrderStatusEmail({
  orderId,
  customerEmail,
  customerName,
  status,
  trackingInfo
}: {
  orderId: string
  customerEmail: string
  customerName: string
  status: 'processing' | 'completed'
  trackingInfo?: {
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
  }
}) {
  console.log('Attempting to send email to:', { customerEmail, customerName, status }) // Debug log
  
  try {
    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: customerEmail,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: status === 'processing' 
        ? '🔧 Your order is being processed'
        : '🚚 Your order is on its way!',
      html: getOrderStatusEmailTemplate(orderId, customerName, status, trackingInfo),
      text: `Your order #${orderId} is ${status}. ${
        trackingInfo 
          ? `\nTracking Number: ${trackingInfo.trackingNumber}\nCarrier: ${trackingInfo.carrier}` 
          : ''
      }`,
    })

    console.log('Email sent successfully:', response)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Add order confirmation email function
export async function sendOrderConfirmationEmail({
  orderDetails,
  to,
}: {
  orderDetails: {
    orderId: string
    customerName: string
    items: CartItem[]
    total: number
    orderDate: string
  }
  to: string
}) {
  try {
    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: '🎉 Thank you for your order!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #0d9488; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .order-summary { margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmation</h1>
              </div>
              <div class="content">
                <p>Dear ${orderDetails.customerName},</p>
                <p>Thank you for your order! We've received your purchase and are getting it ready.</p>
                
                <div class="order-summary">
                  <h2>Order Summary</h2>
                  <p><strong>Order Number:</strong> ${orderDetails.orderId}</p>
                  <p><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
                  
                  <table style="width: 100%; margin: 20px 0;">
                    ${orderDetails.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>x${item.quantity}</td>
                        <td style="text-align: right;">£${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                    <tr style="border-top: 1px solid #ddd;">
                      <td colspan="2" style="text-align: right;"><strong>Total:</strong></td>
                      <td style="text-align: right;"><strong>£${orderDetails.total.toFixed(2)}</strong></td>
                    </tr>
                  </table>
                </div>
                
                <p>We'll send you another email when your order ships.</p>
              </div>
              <div class="footer">
                <p>Thank you for shopping with Sen Jewels!</p>
                <p>© ${new Date().getFullYear()} Sen Jewels. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log('Confirmation email sent:', response)
    return true
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    return false
  }
}

