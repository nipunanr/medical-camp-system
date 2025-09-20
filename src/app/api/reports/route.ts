import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type') || 'overview';

    // Build date filter
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else if (startDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate)
        }
      };
    } else if (endDate) {
      dateFilter = {
        createdAt: {
          lte: new Date(endDate)
        }
      };
    }

    switch (reportType) {
      case 'overview':
        return await getOverviewReport(dateFilter);
      case 'patients':
        return await getPatientsReport(dateFilter);
      case 'medicines':
        return await getMedicinesReport(dateFilter);
      case 'tests':
        return await getTestsReport(dateFilter);
      case 'satisfaction':
        return await getSatisfactionReport(dateFilter);
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getOverviewReport(dateFilter: any) {
  const [
    totalPatients,
    totalRegistrations,
    totalMedicineIssues,
    totalTestResults,
    totalSatisfactionRatings,
    registrationsByStatus,
    recentRegistrations
  ] = await Promise.all([
    // Total patients
    prisma.patient.count({
      where: dateFilter
    }),
    
    // Total registrations
    prisma.registration.count({
      where: dateFilter
    }),
    
    // Total medicine issues
    prisma.medicineIssue.count({
      where: {
        issuedAt: dateFilter.createdAt
      }
    }),
    
    // Total test results
    prisma.testResult.count({
      where: {
        enteredAt: dateFilter.createdAt
      }
    }),
    
    // Total satisfaction ratings
    prisma.satisfactionRating.count({
      where: dateFilter
    }),
    
    // Registrations by status
    prisma.registration.groupBy({
      by: ['status'],
      _count: true,
      where: dateFilter
    }),
    
    // Recent registrations (last 10)
    prisma.registration.findMany({
      where: dateFilter,
      include: {
        patient: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const data = {
    summary: {
      totalPatients,
      totalRegistrations,
      totalMedicineIssues,
      totalTestResults,
      totalSatisfactionRatings
    },
    registrationsByStatus: registrationsByStatus.map(item => ({
      status: item.status,
      count: item._count
    })),
    recentRegistrations
  };

  return NextResponse.json(data);
}

async function getPatientsReport(dateFilter: any) {
  const [
    patientsByGender,
    patientsByAgeGroup,
    patientsOverTime,
    topPatientsByVisits
  ] = await Promise.all([
    // Patients by gender
    prisma.patient.groupBy({
      by: ['gender'],
      _count: true,
      where: dateFilter
    }),
    
    // Patients by age group
    prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN age < 18 THEN 'Under 18'
          WHEN age BETWEEN 18 AND 30 THEN '18-30'
          WHEN age BETWEEN 31 AND 50 THEN '31-50'
          WHEN age BETWEEN 51 AND 70 THEN '51-70'
          ELSE 'Over 70'
        END as age_group,
        COUNT(*) as count
      FROM "Patient"
      ${dateFilter.createdAt ? `WHERE "createdAt" >= '${dateFilter.createdAt.gte?.toISOString() || '1900-01-01'}' 
        AND "createdAt" <= '${dateFilter.createdAt.lte?.toISOString() || new Date().toISOString()}'` : ''}
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Under 18' THEN 1
          WHEN '18-30' THEN 2
          WHEN '31-50' THEN 3
          WHEN '51-70' THEN 4
          WHEN 'Over 70' THEN 5
        END
    `,
    
    // Patients over time (daily for last 30 days)
    prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "Patient"
      ${dateFilter.createdAt ? `WHERE "createdAt" >= '${dateFilter.createdAt.gte?.toISOString() || '1900-01-01'}' 
        AND "createdAt" <= '${dateFilter.createdAt.lte?.toISOString() || new Date().toISOString()}'` : ''}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `,
    
    // Top patients by number of visits
    prisma.patient.findMany({
      where: dateFilter,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        registrations: {
          _count: 'desc'
        }
      },
      take: 10
    })
  ]);

  const data = {
    patientsByGender: patientsByGender.map(item => ({
      gender: item.gender,
      count: item._count
    })),
    patientsByAgeGroup,
    patientsOverTime,
    topPatientsByVisits
  };

  return NextResponse.json(data);
}

async function getMedicinesReport(dateFilter: any) {
  const [
    medicineStockLevels,
    topIssuedMedicines,
    medicineIssuesOverTime,
    lowStockMedicines
  ] = await Promise.all([
    // Current medicine stock levels
    prisma.medicine.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        dosage: true
      },
      orderBy: { stock: 'asc' }
    }),
    
    // Top issued medicines
    prisma.$queryRaw`
      SELECT 
        m.name,
        m.dosage,
        COUNT(mi.id) as issue_count,
        SUM(mi.quantity) as total_quantity
      FROM "Medicine" m
      LEFT JOIN "MedicineIssue" mi ON m.id = mi."medicineId"
      ${dateFilter.createdAt ? `WHERE mi."issuedAt" >= '${dateFilter.createdAt.gte?.toISOString() || '1900-01-01'}' 
        AND mi."issuedAt" <= '${dateFilter.createdAt.lte?.toISOString() || new Date().toISOString()}'` : ''}
      GROUP BY m.id, m.name, m.dosage
      ORDER BY total_quantity DESC
      LIMIT 10
    `,
    
    // Medicine issues over time
    prisma.$queryRaw`
      SELECT 
        DATE("issuedAt") as date,
        COUNT(*) as count,
        SUM(quantity) as total_quantity
      FROM "MedicineIssue"
      ${dateFilter.createdAt ? `WHERE "issuedAt" >= '${dateFilter.createdAt.gte?.toISOString() || '1900-01-01'}' 
        AND "issuedAt" <= '${dateFilter.createdAt.lte?.toISOString() || new Date().toISOString()}'` : ''}
      GROUP BY DATE("issuedAt")
      ORDER BY date DESC
      LIMIT 30
    `,
    
    // Low stock medicines (stock < 10)
    prisma.medicine.findMany({
      where: {
        stock: {
          lt: 10
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        dosage: true
      },
      orderBy: { stock: 'asc' }
    })
  ]);

  const data = {
    medicineStockLevels,
    topIssuedMedicines,
    medicineIssuesOverTime,
    lowStockMedicines
  };

  return NextResponse.json(data);
}

async function getTestsReport(dateFilter: any) {
  const [
    testTypeUsage,
    testResultsOverTime,
    abnormalResults,
    testCompletionRate
  ] = await Promise.all([
    // Test type usage
    prisma.$queryRaw`
      SELECT 
        tt.name,
        COUNT(tr.id) as result_count,
        COUNT(rt.id) as assigned_count
      FROM "TestType" tt
      LEFT JOIN "TestResult" tr ON tt.id = tr."testTypeId"
      LEFT JOIN "RegistrationTest" rt ON tt.id = rt."testTypeId"
      ${dateFilter.createdAt ? `WHERE tr."enteredAt" >= '${dateFilter.createdAt.gte?.toISOString() || '1900-01-01'}' 
        AND tr."enteredAt" <= '${dateFilter.createdAt.lte?.toISOString() || new Date().toISOString()}'` : ''}
      GROUP BY tt.id, tt.name
      ORDER BY result_count DESC
    `,
    
    // Test results over time
    prisma.$queryRaw`
      SELECT 
        DATE("enteredAt") as date,
        COUNT(*) as count
      FROM "TestResult"
      ${dateFilter.createdAt ? `WHERE "enteredAt" >= '${dateFilter.createdAt.gte?.toISOString() || '1900-01-01'}' 
        AND "enteredAt" <= '${dateFilter.createdAt.lte?.toISOString() || new Date().toISOString()}'` : ''}
      GROUP BY DATE("enteredAt")
      ORDER BY date DESC
      LIMIT 30
    `,
    
    // Abnormal test results
    prisma.testResult.findMany({
      where: {
        status: {
          in: ['abnormal', 'critical']
        },
        ...(dateFilter.createdAt && { enteredAt: dateFilter.createdAt })
      },
      include: {
        testType: true,
        registration: {
          include: {
            patient: true
          }
        }
      },
      orderBy: { enteredAt: 'desc' },
      take: 20
    }),
    
    // Test completion rate
    prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT rt."registrationId") as total_registrations_with_tests,
        COUNT(DISTINCT tr."registrationId") as registrations_with_results,
        ROUND(
          (COUNT(DISTINCT tr."registrationId")::float / COUNT(DISTINCT rt."registrationId")::float) * 100, 
          2
        ) as completion_rate
      FROM "RegistrationTest" rt
      LEFT JOIN "TestResult" tr ON rt."registrationId" = tr."registrationId" AND rt."testTypeId" = tr."testTypeId"
    ` as any
  ]);

  const data = {
    testTypeUsage,
    testResultsOverTime,
    abnormalResults,
    testCompletionRate: (testCompletionRate as any)[0] || { completion_rate: 0 }
  };

  return NextResponse.json(data);
}

async function getSatisfactionReport(dateFilter: any) {
  const [
    satisfactionStats,
    ratingDistribution,
    satisfactionOverTime,
    recentFeedback
  ] = await Promise.all([
    // Overall satisfaction statistics
    prisma.satisfactionRating.aggregate({
      where: dateFilter,
      _avg: { rating: true },
      _count: { rating: true },
      _min: { rating: true },
      _max: { rating: true }
    }),
    
    // Rating distribution
    prisma.satisfactionRating.groupBy({
      by: ['rating'],
      _count: true,
      where: dateFilter,
      orderBy: { rating: 'asc' }
    }),
    
    // Satisfaction over time
    prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        AVG(rating) as avg_rating,
        COUNT(*) as count
      FROM "SatisfactionRating"
      ${dateFilter.createdAt ? `WHERE "createdAt" >= '${dateFilter.createdAt.gte?.toISOString() || '1900-01-01'}' 
        AND "createdAt" <= '${dateFilter.createdAt.lte?.toISOString() || new Date().toISOString()}'` : ''}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `,
    
    // Recent feedback with comments
    prisma.satisfactionRating.findMany({
      where: {
        ...dateFilter,
        feedback: {
          not: null
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const data = {
    satisfactionStats: {
      averageRating: satisfactionStats._avg.rating || 0,
      totalRatings: satisfactionStats._count.rating || 0,
      minRating: satisfactionStats._min.rating || 0,
      maxRating: satisfactionStats._max.rating || 0
    },
    ratingDistribution: ratingDistribution.map(item => ({
      rating: item.rating,
      count: item._count
    })),
    satisfactionOverTime,
    recentFeedback
  };

  return NextResponse.json(data);
}