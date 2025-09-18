import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const testTypes = await prisma.testType.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(testTypes)
  } catch (error) {
    console.error('Error fetching test types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const testType = await prisma.testType.create({
      data: {
        name: data.name,
        requiresResult: data.requiresResult || false,
        requiresPrintSheet: data.requiresPrintSheet || false,
        requiresBarcode: data.requiresBarcode || false,
      }
    })
    
    return NextResponse.json(testType)
  } catch (error) {
    console.error('Error creating test type:', error)
    return NextResponse.json(
      { error: 'Failed to create test type' },
      { status: 500 }
    )
  }
}