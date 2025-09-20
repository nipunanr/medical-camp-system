import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 50 // Default to 50, but allow override
    
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
        take: limit > 0 ? limit : undefined // If limit is 0 or negative, get all
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
        take: limit > 0 ? Math.min(limit, 10) : 10 // For search queries, still limit for performance, but respect the limit parameter
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