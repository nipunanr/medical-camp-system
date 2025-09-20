import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params
    
    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    // Find the registration and get the patient ID (which is readable)
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        patient: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Use patient ID as QR code value (this is now the readable ID)
    const qrValue = registration.patient.id

    // Generate QR code with patient ID
    const qrCodeDataUrl = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      success: true,
      registrationId: registrationId,
      patientId: registration.patient.id,
      qrCode: qrCodeDataUrl,
      qrValue: qrValue
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}