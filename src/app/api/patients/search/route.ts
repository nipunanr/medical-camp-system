import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    let patients;
    
    if (!query || query.trim() === '') {
      // Return all patients if no query is provided
      patients = await prisma.patient.findMany({
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit to 50 patients for performance
      })
    } else {
      // Search patients by name, contact number, patient ID, or registration ID
      patients = await prisma.patient.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { contactNumber: { contains: query } },
            { id: { contains: query, mode: 'insensitive' } }, // Search by patient ID
            {
              registrations: {
                some: {
                  id: query // Direct match on registration ID
                }
              }
            }
          ]
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
        },
        take: 10 // Limit results
      })
    }

    return NextResponse.json({
      success: true,
      patients: patients
    })
  } catch (error) {
    console.error('Error searching patients:', error)
    return NextResponse.json(
      { error: 'Failed to search patients' },
      { status: 500 }
    )
  }
}