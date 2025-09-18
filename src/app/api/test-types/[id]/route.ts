import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const testType = await prisma.testType.update({
      where: { id },
      data: {
        name: data.name,
        requiresResult: data.requiresResult || false,
        requiresPrintSheet: data.requiresPrintSheet || false,
        requiresBarcode: data.requiresBarcode || false,
      }
    })
    
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
    await prisma.testType.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test type:', error)
    return NextResponse.json(
      { error: 'Failed to delete test type' },
      { status: 500 }
    )
  }
}