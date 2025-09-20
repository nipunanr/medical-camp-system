import { NextRequest, NextResponse } from 'next/server'

// Temporary in-memory storage for medicines (same as main route)
// In production, this would use the database
let medicinesStore = [
  {
    id: '1',
    name: 'Paracetamol',
    dosage: '500mg',
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Ibuprofen', 
    dosage: '400mg',
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Amoxicillin',
    dosage: '250mg',
    stock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Aspirin',
    dosage: '100mg',
    stock: 75,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const index = medicinesStore.findIndex(m => m.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      )
    }
    
    const medicine = {
      ...medicinesStore[index],
      name: data.name,
      dosage: data.dosage || '',
      stock: data.stock || 0,
      updatedAt: new Date().toISOString()
    }
    
    medicinesStore[index] = medicine
    
    return NextResponse.json(medicine)
  } catch (error) {
    console.error('Error updating medicine:', error)
    return NextResponse.json(
      { error: 'Failed to update medicine' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const index = medicinesStore.findIndex(m => m.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      )
    }
    
    medicinesStore.splice(index, 1)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return NextResponse.json(
      { error: 'Failed to delete medicine' },
      { status: 500 }
    )
  }
}