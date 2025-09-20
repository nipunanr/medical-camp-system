import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params
    
    // The registrationId parameter might actually be a patient ID (readable ID)
    // Try to find patient first, then get their registration
    let patient = await prisma.patient.findUnique({
      where: { id: registrationId },
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

    if (patient && patient.registrations.length > 0) {
      // Return the most recent registration for this patient
      const registration = patient.registrations[patient.registrations.length - 1]
      return NextResponse.json({
        ...registration,
        patient: patient
      })
    }

    // If not found by patient ID, try by registration ID (for backward compatibility)
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        patient: true,
        registrationTests: {
          include: {
            testType: true
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    )
  }
}