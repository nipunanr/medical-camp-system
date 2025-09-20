import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      registrationId, 
      testTypeId, 
      result, 
      normalRange, 
      status, 
      enteredBy 
    } = body;

    // Validate required fields
    if (!registrationId || !testTypeId || !result) {
      return NextResponse.json(
        { error: 'Registration ID, test type ID, and result are required' },
        { status: 400 }
      );
    }

    // Verify registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Verify test type exists
    const testType = await prisma.testType.findUnique({
      where: { id: testTypeId }
    });

    if (!testType) {
      return NextResponse.json(
        { error: 'Test type not found' },
        { status: 404 }
      );
    }

    // Check if registration has this test assigned
    const registrationTest = await prisma.registrationTest.findUnique({
      where: {
        registrationId_testTypeId: {
          registrationId,
          testTypeId
        }
      }
    });

    if (!registrationTest) {
      return NextResponse.json(
        { error: 'This test is not assigned to the registration' },
        { status: 400 }
      );
    }

    // Check if result already exists (for updates, use PUT instead)
    const existingResult = await prisma.testResult.findUnique({
      where: {
        registrationId_testTypeId: {
          registrationId,
          testTypeId
        }
      }
    });

    if (existingResult) {
      return NextResponse.json(
        { error: 'Test result already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Create test result
    const testResult = await prisma.testResult.create({
      data: {
        registrationId,
        testTypeId,
        result,
        normalRange,
        status: status || 'normal',
        enteredBy
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

    // Check if all required tests for this registration have results
    const allRegistrationTests = await prisma.registrationTest.findMany({
      where: { registrationId }
    });

    const completedResults = await prisma.testResult.findMany({
      where: { registrationId }
    });

    // If all tests have results, update registration status
    if (allRegistrationTests.length === completedResults.length) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { 
          status: 'tests_done',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json(testResult, { status: 201 });
  } catch (error) {
    console.error('Error creating test result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');
    const testTypeId = searchParams.get('testTypeId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause: any = {};
    
    if (registrationId) {
      whereClause.registrationId = registrationId;
    }
    
    if (testTypeId) {
      whereClause.testTypeId = testTypeId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          registration: {
            id: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          registration: {
            patient: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          testType: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const skip = (page - 1) * limit;

    const [testResults, total] = await Promise.all([
      prisma.testResult.findMany({
        where: whereClause,
        include: {
          testType: true,
          registration: {
            include: {
              patient: true
            }
          }
        },
        orderBy: { enteredAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.testResult.count({ where: whereClause })
    ]);

    return NextResponse.json({
      testResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      registrationId, 
      testTypeId, 
      result, 
      normalRange, 
      status, 
      enteredBy 
    } = body;

    // Validate required fields
    if (!registrationId || !testTypeId) {
      return NextResponse.json(
        { error: 'Registration ID and test type ID are required' },
        { status: 400 }
      );
    }

    // Check if result exists
    const existingResult = await prisma.testResult.findUnique({
      where: {
        registrationId_testTypeId: {
          registrationId,
          testTypeId
        }
      }
    });

    if (!existingResult) {
      return NextResponse.json(
        { error: 'Test result not found. Use POST to create.' },
        { status: 404 }
      );
    }

    // Update test result
    const updatedTestResult = await prisma.testResult.update({
      where: {
        registrationId_testTypeId: {
          registrationId,
          testTypeId
        }
      },
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