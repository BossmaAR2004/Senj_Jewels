import { NextResponse } from 'next/server'
import { sendOrderStatusEmail } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, customerEmail, customerName, status, trackingInfo } = body

    const emailSent = await sendOrderStatusEmail({
      orderId,
      customerEmail,
      customerName,
      status,
      trackingInfo
    })

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    )
  }
}