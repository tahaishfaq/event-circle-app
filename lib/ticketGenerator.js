import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"
import { format } from "date-fns"

export async function generateTicketPDF(ticketData) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(ticketData.ticketNumbers[0], {
      width: 120,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Convert QR code to bytes and embed
    const qrCodeBytes = qrCodeDataUrl.split(",")[1]
    const qrCodeImage = await pdfDoc.embedPng(Buffer.from(qrCodeBytes, "base64"))

    // Colors
    const primaryBlue = rgb(0.149, 0.388, 0.922) // #2563eb
    const darkGray = rgb(0.2, 0.2, 0.2)
    const lightGray = rgb(0.6, 0.6, 0.6)

    // Header
    page.drawText("EVENT CIRCLE", {
      x: 50,
      y: 780,
      size: 24,
      font: helveticaBold,
      color: primaryBlue,
    })

    page.drawText("Your Event Ticket", {
      x: 50,
      y: 750,
      size: 16,
      font: helveticaFont,
      color: lightGray,
    })

    // Ticket border
    page.drawRectangle({
      x: 40,
      y: 200,
      width: 515,
      height: 500,
      borderColor: primaryBlue,
      borderWidth: 2,
    })

    // Event name
    page.drawText(ticketData.eventName, {
      x: 60,
      y: 650,
      size: 20,
      font: helveticaBold,
      color: darkGray,
      maxWidth: 300,
    })

    // Event details
    const eventDate = format(new Date(ticketData.eventDate), "EEEE, MMMM dd, yyyy")

    page.drawText("Date & Time:", {
      x: 60,
      y: 600,
      size: 12,
      font: helveticaBold,
      color: lightGray,
    })

    page.drawText(`${eventDate} at ${ticketData.eventTime}`, {
      x: 60,
      y: 580,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText("Location:", {
      x: 60,
      y: 550,
      size: 12,
      font: helveticaBold,
      color: lightGray,
    })

    page.drawText(ticketData.eventLocation.address, {
      x: 60,
      y: 530,
      size: 12,
      font: helveticaFont,
      color: darkGray,
      maxWidth: 300,
    })

    page.drawText("Attendee:", {
      x: 60,
      y: 490,
      size: 12,
      font: helveticaBold,
      color: lightGray,
    })

    page.drawText(ticketData.attendeeName, {
      x: 60,
      y: 470,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText("Email:", {
      x: 60,
      y: 440,
      size: 12,
      font: helveticaBold,
      color: lightGray,
    })

    page.drawText(ticketData.attendeeEmail, {
      x: 60,
      y: 420,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    // Ticket details box
    page.drawRectangle({
      x: 60,
      y: 250,
      width: 200,
      height: 120,
      borderColor: lightGray,
      borderWidth: 1,
    })

    page.drawText("Ticket Number:", {
      x: 70,
      y: 350,
      size: 10,
      font: helveticaBold,
      color: lightGray,
    })

    page.drawText(ticketData.ticketNumbers[0], {
      x: 70,
      y: 330,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText("Quantity:", {
      x: 70,
      y: 300,
      size: 10,
      font: helveticaBold,
      color: lightGray,
    })

    page.drawText(ticketData.quantity.toString(), {
      x: 70,
      y: 280,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText("Total Amount:", {
      x: 70,
      y: 260,
      size: 10,
      font: helveticaBold,
      color: lightGray,
    })

    page.drawText(`${ticketData.totalAmount.toLocaleString()}`, {
      x: 70,
      y: 240,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    // QR Code
    page.drawImage(qrCodeImage, {
      x: 380,
      y: 250,
      width: 120,
      height: 120,
    })

    page.drawText("QR Code", {
      x: 420,
      y: 230,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    })

    page.drawText("Scan at venue", {
      x: 410,
      y: 220,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    })

    // Footer
    page.drawText("This ticket is non-transferable and must be presented at the event venue.", {
      x: 60,
      y: 180,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    })

    page.drawText("For support, contact: support@eventcircle.com", {
      x: 60,
      y: 170,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    })

    page.drawText("Terms & Conditions apply. Visit eventcircle.com/terms for details.", {
      x: 60,
      y: 150,
      size: 7,
      font: helveticaFont,
      color: lightGray,
    })

    // Reference number
    page.drawText(`Reference: ${ticketData.reference}`, {
      x: 60,
      y: 130,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    })

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

export async function generateInvoicePDF(invoiceData) {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const primaryBlue = rgb(0.149, 0.388, 0.922)
    const darkGray = rgb(0.2, 0.2, 0.2)
    const lightGray = rgb(0.6, 0.6, 0.6)

    // Header
    page.drawText("EVENT CIRCLE", {
      x: 50,
      y: 780,
      size: 24,
      font: helveticaBold,
      color: primaryBlue,
    })

    page.drawText("Invoice", {
      x: 50,
      y: 750,
      size: 16,
      font: helveticaFont,
      color: lightGray,
    })

    // Invoice details
    page.drawText(`Invoice Number: ${invoiceData.invoiceNumber}`, {
      x: 50,
      y: 700,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText(`Date: ${format(invoiceData.date, "MMMM dd, yyyy")}`, {
      x: 50,
      y: 680,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    // Billing details
    page.drawText("Bill To:", {
      x: 50,
      y: 640,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    })

    page.drawText(invoiceData.customerName, {
      x: 50,
      y: 620,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText(invoiceData.customerEmail, {
      x: 50,
      y: 600,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    // Items table header
    const tableTop = 550
    page.drawText("Description", {
      x: 50,
      y: tableTop,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    })

    page.drawText("Quantity", {
      x: 250,
      y: tableTop,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    })

    page.drawText("Unit Price", {
      x: 350,
      y: tableTop,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    })

    page.drawText("Total", {
      x: 450,
      y: tableTop,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    })

    // Line
    page.drawLine({
      start: { x: 50, y: tableTop - 10 },
      end: { x: 545, y: tableTop - 10 },
      thickness: 1,
      color: lightGray,
    })

    // Item
    page.drawText(`Event Ticket - ${invoiceData.eventName}`, {
      x: 50,
      y: tableTop - 30,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText(invoiceData.quantity.toString(), {
      x: 250,
      y: tableTop - 30,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText(`${(invoiceData.amount / invoiceData.quantity).toFixed(2)}`, {
      x: 350,
      y: tableTop - 30,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText(`${invoiceData.amount.toFixed(2)}`, {
      x: 450,
      y: tableTop - 30,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    // Totals
    const totalsTop = tableTop - 80
    page.drawText("Subtotal:", {
      x: 350,
      y: totalsTop,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText(`${(invoiceData.amount - invoiceData.platformFee).toFixed(2)}`, {
      x: 450,
      y: totalsTop,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText("Platform Fee (13%):", {
      x: 350,
      y: totalsTop - 20,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText(`${invoiceData.platformFee.toFixed(2)}`, {
      x: 450,
      y: totalsTop - 20,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })

    page.drawText("Total:", {
      x: 350,
      y: totalsTop - 50,
      size: 14,
      font: helveticaBold,
      color: darkGray,
    })

    page.drawText(`${invoiceData.amount.toFixed(2)}`, {
      x: 450,
      y: totalsTop - 50,
      size: 14,
      font: helveticaBold,
      color: darkGray,
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    throw error
  }
}
