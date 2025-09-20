import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qrValue = searchParams.get('qr')
    
    if (!qrValue) {
      return NextResponse.json(
        { error: 'QR value is required' },
        { status: 400 }
      )
    }

    // Find patient by ID (the QR value is now the patient ID)
    const patient = await prisma.patient.findUnique({
      where: { id: qrValue },
      include: {
        registrations: {
          include: {
            registrationTests: {
              include: {
                testType: true
              }
            },
            testResults: {
              include: {
                testType: true
              }
            },
            medicineIssues: {
              include: {
                medicine: true
              }
            }
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      patient: patient,
      scannedValue: qrValue
    })
  } catch (error) {
    console.error('Error scanning QR code:', error)
    return NextResponse.json(
      { error: 'Failed to scan QR code' },
      { status: 500 }
    )
  }
}