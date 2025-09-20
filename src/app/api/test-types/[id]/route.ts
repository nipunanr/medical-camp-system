import { NextRequest, NextResponse } from 'next/server'

// Import the test types store from the main route
// In a real application, this would be a database
let testTypesStore = [
  {
    id: '1',
    name: 'Blood Test',
    requiresResult: true,
    requiresPrintSheet: false,
    requiresBarcode: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Urine Test',
    requiresResult: true,
    requiresPrintSheet: false,
    requiresBarcode: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Blood Pressure Check',
    requiresResult: true,
    requiresPrintSheet: false,
    requiresBarcode: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Weight & Height',
    requiresResult: true,
    requiresPrintSheet: false,
    requiresBarcode: false,
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
    
    const index = testTypesStore.findIndex(t => t.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Test type not found' },
        { status: 404 }
      )
    }
    
    const testType = {
      ...testTypesStore[index],
      name: data.name,
      requiresResult: data.requiresResult || false,
      requiresPrintSheet: data.requiresPrintSheet || false,
      requiresBarcode: data.requiresBarcode || false,
      updatedAt: new Date().toISOString()
    }
    
    testTypesStore[index] = testType
    
    return NextResponse.json(testType)
  } catch (error) {
    console.error('Error updating test type:', error)
    return NextResponse.json(
      { error: 'Failed to update test type' },
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
    
    const index = testTypesStore.findIndex(t => t.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Test type not found' },
        { status: 404 }
      )
    }
    
    testTypesStore.splice(index, 1)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test type:', error)
    return NextResponse.json(
      { error: 'Failed to delete test type' },
      { status: 500 }
    )
  }
}