import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const patientId = params.id

    // Update patient information
    const updatedPatient = await prisma.patient.update({
      where: {
        id: patientId
      },
      data: {
        name: data.name,
        address: data.address,
        contactNumber: data.contactNumber,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        bmi: data.bmi,
        bloodPressure: data.bloodPressure,
      },
      include: {
        registrations: {
          include: {
            registrationTests: {
              include: {
                testType: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      patient: updatedPatient
    })
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id

    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId
      },
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
      patient: patient
    })
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}