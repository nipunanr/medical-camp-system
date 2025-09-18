import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(medicines)
  } catch (error) {
    console.error('Error fetching medicines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const medicine = await prisma.medicine.create({
      data: {
        name: data.name,
        dosage: data.dosage || null,
        stock: data.stock || 0,
      }
    })
    
    return NextResponse.json(medicine)
  } catch (error) {
    console.error('Error creating medicine:', error)
    return NextResponse.json(
      { error: 'Failed to create medicine' },
      { status: 500 }
    )
  }
}