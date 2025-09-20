import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Generate readable patient number (R250001, R250002, etc.)
async function generatePatientNumber(): Promise<string> {
  const currentDate = new Date()
  const year = currentDate.getFullYear().toString().slice(-2) // Last 2 digits of year
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  
  // Get the count of registrations today
  const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0))
  const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999))
  
  const todayRegistrations = await prisma.registration.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  })
  
  const nextNumber = (todayRegistrations + 1).toString().padStart(3, '0')
  return `R${year}${month}${nextNumber}`
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate readable patient ID (this will be the primary ID)
    const patientId = await generatePatientNumber()
    
    // Create patient with readable ID
    const patient = await prisma.patient.create({
      data: {
        id: patientId, // Use readable ID as primary key
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

    // Create registration linked to patient ID
    const registration = await prisma.registration.create({
      data: {
        patientId: patientId, // Use the readable patient ID
      }
    })

    // Create registration tests
    if (data.selectedTests && data.selectedTests.length > 0) {
      console.log('Selected test IDs:', data.selectedTests)
      
      // Verify test types exist before creating registration tests
      const existingTestTypes = await prisma.testType.findMany({
        where: {
          id: {
            in: data.selectedTests
          }
        }
      })
      
      console.log('Existing test types found:', existingTestTypes.map(t => ({ id: t.id, name: t.name })))
      
      if (existingTestTypes.length !== data.selectedTests.length) {
        const missingIds = data.selectedTests.filter((id: string) => !existingTestTypes.find(t => t.id === id))
        console.error('Missing test type IDs:', missingIds)
        throw new Error(`Invalid test type IDs: ${missingIds.join(', ')}`)
      }
      
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
      patientId: patientId, // This is now the readable ID
    })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}