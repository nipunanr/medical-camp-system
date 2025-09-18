import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Create patient
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        address: data.address,
        contactNumber: data.contactNumber,
        dateOfBirth: new Date(data.dateOfBirth),
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        bmi: data.bmi,
        bloodPressure: data.bloodPressure || '',
      }
    })

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(patient.id)

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        patientId: patient.id,
        qrCode: qrCode,
      }
    })

    // Create registration tests
    if (data.selectedTests && data.selectedTests.length > 0) {
      await prisma.registrationTest.createMany({
        data: data.selectedTests.map((testId: string) => ({
          registrationId: registration.id,
          testTypeId: testId,
        }))
      })
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      patientId: patient.id,
      qrCode: qrCode
    })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}