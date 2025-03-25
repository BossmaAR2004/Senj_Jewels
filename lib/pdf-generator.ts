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
  shippingAddress: string  // Should be formatted as "Street, City, State/County, Postcode, Country"
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
  let yPos = 20
  
  // Define the teal color
  const tealColor: [number, number, number] = [13/255, 148/255, 136/255] // Convert RGB to 0-1 range for jsPDF

  // Add business logo
  const logoUrl = '/Images/logo.png'
  const logoData = await loadImage(logoUrl)
  if (logoData) {
    doc.addImage(logoData, 'PNG', 14, yPos, 30, 30)
    yPos += 35
  }

  // Add header with teal color
  doc.setTextColor(...tealColor)
  doc.setFontSize(20)
  doc.text('Sen Jewels', 14, yPos)
  yPos += 15
  
  doc.setFontSize(16)
  doc.text('Order Confirmation', 14, yPos)
  yPos += 20

  // Reset color for regular text
  doc.setTextColor(0, 0, 0)

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

  // Format shipping address properly
  const formattedAddress = order.shippingAddress
    .split(',')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Add customer information with properly formatted address
  const customerDetails = [
    `Name: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    'Shipping Address:',
    ...formattedAddress.map(line => `  ${line}`), // Add indentation to address lines
    `Payment Method: ${order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}`
  ]

  for (const line of customerDetails) {
    // Add more space after the "Shipping Address:" label
    if (line === 'Shipping Address:') {
      doc.text(line, 14, yPos)
      yPos += 8 // Add extra space before address lines
    } else {
      doc.text(line, 14, yPos)
      yPos += 7
    }
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

  // Update table styles with teal color
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
    headStyles: { 
      fillColor: [13, 148, 136],
      textColor: [255, 255, 255]
    },
    footStyles: { 
      fillColor: [240, 240, 240], 
      textColor: [13, 148, 136]
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'right', textColor: [13, 148, 136] },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'right', textColor: [13, 148, 136] }
    }
  })

  // Add footer with teal accents
  const finalY = (doc as any).lastAutoTable.finalY || 200
  doc.setFontSize(12)
  doc.setTextColor(...tealColor)
  doc.text('Thank you for shopping with Sen Jewels!', 14, finalY + 10)
  
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0) // Reset to black for contact info
  doc.text('If you have any questions, please contact us at', 14, finalY + 20)
  doc.setTextColor(...tealColor)
  doc.text('senjutibiswas05@gmail.com', 14, finalY + 30)

  // Download the PDF
  doc.save(`order-${order.orderId}.pdf`)
}

