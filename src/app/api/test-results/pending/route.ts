import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const testTypeId = searchParams.get('testTypeId') || '';

    const skip = (page - 1) * limit;

    // Build where clause for search
    let whereClause: any = {
      registrationTests: {
        some: {}
      }
    };

    // Add test type filter if specified
    if (testTypeId) {
      whereClause.registrationTests.some.testTypeId = testTypeId;
    }

    // Add search filter for patient name or registration ID
    if (search) {
      whereClause.OR = [
        {
          id: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          patient: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Get registrations with their tests and existing results
    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where: whereClause,
        include: {
          patient: true,
          registrationTests: {
            include: {
              testType: true
            }
          },
          testResults: {
            include: {
              testType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.registration.count({ where: whereClause })
    ]);

    // Filter to only include registrations with pending tests
    const pendingResults = registrations.map(registration => {
      // Get tests that don't have results yet
      const pendingTests = registration.registrationTests.filter(regTest => 
        !registration.testResults.some(result => result.testTypeId === regTest.testTypeId)
      );

      if (pendingTests.length > 0) {
        return {
          id: registration.id,
          patient: registration.patient,
          createdAt: registration.createdAt,
          status: registration.status,
          pendingTests,
          completedTests: registration.testResults
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({
      pendingResults,
      pagination: {
        page,
        limit,
        total: pendingResults.length,
        totalPages: Math.ceil(pendingResults.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching pending results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}