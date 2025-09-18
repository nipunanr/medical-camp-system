import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: data.name,
        dosage: data.dosage || null,
        stock: data.stock || 0,
      }
    })
    
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
    await prisma.medicine.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return NextResponse.json(
      { error: 'Failed to delete medicine' },
      { status: 500 }
    )
  }
}