import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testResult = await prisma.testResult.findUnique({
      where: { id: params.id },
      include: {
        testType: true,
        registration: {
          include: {
            patient: true
          }
        }
      }
    });

    if (!testResult) {
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error fetching test result:', error);
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
      result, 
      normalRange, 
      status, 
      enteredBy 
    } = body;

    // Check if test result exists
    const existingResult = await prisma.testResult.findUnique({
      where: { id: params.id }
    });

    if (!existingResult) {
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      );
    }

    // Update test result
    const updatedTestResult = await prisma.testResult.update({
      where: { id: params.id },
      data: {
        ...(result !== undefined && { result }),
        ...(normalRange !== undefined && { normalRange }),
        ...(status !== undefined && { status }),
        ...(enteredBy !== undefined && { enteredBy }),
        enteredAt: new Date() // Update timestamp
      },
      include: {
        testType: true,
        registration: {
          include: {
            patient: true
          }
        }
      }
    });

    return NextResponse.json(updatedTestResult);
  } catch (error) {
    console.error('Error updating test result:', error);
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
    // Check if test result exists
    const existingResult = await prisma.testResult.findUnique({
      where: { id: params.id }
    });

    if (!existingResult) {
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      );
    }

    // Delete the test result
    await prisma.testResult.delete({
      where: { id: params.id }
    });

    // Update registration status if needed
    // Check if there are any remaining test results for this registration
    const remainingResults = await prisma.testResult.findMany({
      where: { registrationId: existingResult.registrationId }
    });

    if (remainingResults.length === 0) {
      // No more test results, update registration status back to registered
      await prisma.registration.update({
        where: { id: existingResult.registrationId },
        data: { 
          status: 'registered',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json(
      { message: 'Test result deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting test result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}