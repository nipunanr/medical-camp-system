import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medicineIssue = await prisma.medicineIssue.findUnique({
      where: { id: params.id },
      include: {
        medicine: true,
        registration: {
          include: {
            patient: true
          }
        }
      }
    });

    if (!medicineIssue) {
      return NextResponse.json(
        { error: 'Medicine issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(medicineIssue);
  } catch (error) {
    console.error('Error fetching medicine issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      quantity, 
      dosage, 
      instructions, 
      issuedBy 
    } = body;

    // Get existing medicine issue
    const existingIssue = await prisma.medicineIssue.findUnique({
      where: { id: params.id },
      include: { medicine: true }
    });

    if (!existingIssue) {
      return NextResponse.json(
        { error: 'Medicine issue not found' },
        { status: 404 }
      );
    }

    // If quantity is being changed and it's a regular medicine (not custom), adjust stock
    if (quantity !== undefined && existingIssue.medicineId && existingIssue.medicine) {
      const quantityDiff = quantity - existingIssue.quantity;
      
      if (quantityDiff > 0) {
        // Increasing quantity - check if enough stock
        if (existingIssue.medicine.stock < quantityDiff) {
          return NextResponse.json(
            { error: `Insufficient stock. Available: ${existingIssue.medicine.stock}, Additional needed: ${quantityDiff}` },
            { status: 400 }
          );
        }
      }

      // Update medicine stock
      await prisma.medicine.update({
        where: { id: existingIssue.medicineId },
        data: { 
          stock: existingIssue.medicine.stock - quantityDiff 
        }
      });
    }

    // Update medicine issue
    const updatedMedicineIssue = await prisma.medicineIssue.update({
      where: { id: params.id },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(dosage !== undefined && { dosage }),
        ...(instructions !== undefined && { instructions }),
        ...(issuedBy !== undefined && { issuedBy })
      },
      include: {
        medicine: true,
        registration: {
          include: {
            patient: true
          }
        }
      }
    });

    return NextResponse.json(updatedMedicineIssue);
  } catch (error) {
    console.error('Error updating medicine issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get existing medicine issue before deletion
    const existingIssue = await prisma.medicineIssue.findUnique({
      where: { id: params.id },
      include: { medicine: true }
    });

    if (!existingIssue) {
      return NextResponse.json(
        { error: 'Medicine issue not found' },
        { status: 404 }
      );
    }

    // If it's a regular medicine (not custom), restore stock
    if (existingIssue.medicineId && existingIssue.medicine) {
      await prisma.medicine.update({
        where: { id: existingIssue.medicineId },
        data: { 
          stock: existingIssue.medicine.stock + existingIssue.quantity 
        }
      });
    }

    // Delete the medicine issue
    await prisma.medicineIssue.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Medicine issue deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting medicine issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}