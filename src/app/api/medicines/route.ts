import { NextRequest, NextResponse } from 'next/server'
import { getMedicines, addMedicine } from '@/lib/medicineStore'

export async function GET() {
  try {
    return NextResponse.json(getMedicines())
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
    
    const medicine = addMedicine({
      name: data.name,
      dosage: data.dosage || '',
      stock: data.stock || 0
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