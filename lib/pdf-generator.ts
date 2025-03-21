import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CartItem } from '@/types/cart'

interface ExtendedCartItem extends CartItem {
  description?: string
  image: string
}

interface OrderPDFData {
  orderId: string
  orderDate: Date | string
  customerName: string
  customerEmail: string
  shippingAddress: string
  paymentMethod: string
  items: ExtendedCartItem[]
  subtotal: number
  shipping: number
  total: number
}

// Helper function to load image and convert to base64
async function loadImage(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error loading image:', error)
    return ''
  }
}

export async function downloadOrderPDF(order: OrderPDFData) {
  const doc = new jsPDF()
  let yPos = 20 // Starting Y position

  // Add business logo
  const logoUrl = '/Images/logo.png' // Replace with your logo URL
  const logoData = await loadImage(logoUrl)
  if (logoData) {
    doc.addImage(logoData, 'PNG', 14, yPos, 30, 30) // Adjusted logo size
    yPos += 35
  }

  // Add header
  doc.setFontSize(20)
  doc.text('Sen Jewels', 14, yPos)
  yPos += 15
  
  doc.setFontSize(16)
  doc.text('Order Confirmation', 14, yPos)
  yPos += 20

  // Add order details
  doc.setFontSize(12)
  doc.text(`Order Number: ${order.orderId}`, 14, yPos)
  yPos += 10
  doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString('en-GB')}`, 14, yPos)
  yPos += 15

  // Add customer details
  doc.text('Customer Information:', 14, yPos)
  yPos += 10
  doc.setFontSize(11)

  // Add customer information
  const customerDetails = [
    `Name: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    'Shipping Address:',
    ...order.shippingAddress.split('\n'), // Split address into multiple lines
    `Payment Method: ${order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}`
  ]

  for (const line of customerDetails) {
    doc.text(line, 14, yPos)
    yPos += 7
  }

  yPos += 10 // Add space before items

  // Add items with images
  doc.setFontSize(10)
  for (const item of order.items) {
    if (item.image) {
      try {
        const imgData = await loadImage(item.image)
        if (imgData) {
          // Add image
          doc.addImage(imgData, 'JPEG', 14, yPos, 20, 20)
          
          // Add item details next to image
          doc.text(item.name, 40, yPos + 5)
          if (item.description) {
            doc.setFontSize(8)
            doc.text(item.description, 40, yPos + 10)
            doc.setFontSize(10)
          }
          
          // Add price and quantity
          doc.text(`£${item.price.toFixed(2)} x ${item.quantity}`, 40, yPos + 15)
          
          yPos += 25 // Space for next item
        }
      } catch (error) {
        console.error('Error adding image:', error)
      }
    }
  }

  yPos += 10 // Add space before table

  // Add summary table
  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Price', 'Quantity', 'Total']],
    body: order.items.map(item => [
      item.name,
      `£${item.price.toFixed(2)}`,
      item.quantity.toString(),
      `£${(item.price * item.quantity).toFixed(2)}`
    ]),
    foot: [
      ['', '', 'Subtotal:', `£${order.subtotal.toFixed(2)}`],
      ['', '', 'Shipping:', order.shipping === 0 ? 'Free' : `£${order.shipping.toFixed(2)}`],
      ['', '', 'Total:', `£${order.total.toFixed(2)}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' }
    }
  })

  // Add footer
  const finalY = (doc as any).lastAutoTable.finalY || 200
  doc.setFontSize(12) // Increased text size
  doc.text('Thank you for shopping with Sen Jewels!', 14, finalY + 10)
  doc.setFontSize(10) // Increased text size
  doc.text('If you have any questions, please contact us at contact@senjewels.com', 14, finalY + 20)

  // Download the PDF
  doc.save(`order-${order.orderId}.pdf`)
}

