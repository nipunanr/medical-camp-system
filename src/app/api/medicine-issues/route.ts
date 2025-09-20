import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getMedicineById, reduceMedicineStock, getMedicines, getMedicineByName } from '@/lib/medicineStore';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      registrationId, 
      medicineId, 
      customMedicine, 
      quantity, 
      dosage, 
      instructions, 
      issuedBy 
    } = body;

    // Validate required fields
    if (!registrationId || !quantity) {
      return NextResponse.json(
        { error: 'Registration ID and quantity are required' },
        { status: 400 }
      );
    }

    if (!medicineId && !customMedicine) {
      return NextResponse.json(
        { error: 'Either medicine ID or custom medicine name is required' },
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

    // If medicineId is provided, verify medicine exists and check stock
    if (medicineId) {
      console.log('🔍 Looking for medicine with ID:', medicineId)
      console.log('🔍 Available medicines:', getMedicines().map(m => ({ id: m.id, name: m.name, stock: m.stock })))
      
      const medicine = getMedicineById(medicineId);
      console.log('🔍 Found medicine:', medicine)

      if (!medicine) {
        console.log('❌ Medicine not found for ID:', medicineId)
        console.log('❌ Request timestamp:', new Date().toISOString())
        // Debug: List all available medicines
        const allMedicines = getMedicines()
        console.log('❌ Available medicines count:', allMedicines.length)
        console.log('❌ Available medicine IDs:', allMedicines.map(m => `${m.id} (${m.name})`))
        return NextResponse.json({ 
          error: 'Medicine not found',
          debug: {
            requestedId: medicineId,
            availableIds: allMedicines.map(m => m.id),
            timestamp: new Date().toISOString()
          }
        }, { status: 404 })
      }

      if (medicine.stock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Available: ${medicine.stock}, Requested: ${quantity}` },
          { status: 400 }
        );
      }

      // Update medicine stock in shared store
      const stockReduced = reduceMedicineStock(medicineId, quantity);
      if (!stockReduced) {
        return NextResponse.json(
          { error: 'Failed to reduce stock' },
          { status: 500 }
        );
      }
    }

    // Create medicine issue record (set medicineId to null since we're using in-memory storage)
    const medicineIssue = await prisma.medicineIssue.create({
      data: {
        registrationId,
        medicineId: null, // Always null since medicines are in-memory
        customMedicine: medicineId ? getMedicineById(medicineId)?.name : customMedicine,
        quantity,
        dosage,
        instructions,
        issuedBy
      },
      include: {
        registration: {
          include: {
            patient: true
          }
        }
      }
    });

    // Add medicine details from in-memory store if available
    const responseData = {
      ...medicineIssue,
      medicine: medicineId ? getMedicineById(medicineId) : null,
      // Override customMedicine to show the actual medicine name if it was selected from dropdown
      customMedicine: medicineId ? getMedicineById(medicineId)?.name : customMedicine
    };

    // Update registration status if needed
    await prisma.registration.update({
      where: { id: registrationId },
      data: { 
        status: 'medicines_issued',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating medicine issue:', error);
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause = {};
    if (registrationId) {
      whereClause = { registrationId };
    }

    const skip = (page - 1) * limit;

    const [medicineIssues, total] = await Promise.all([
      prisma.medicineIssue.findMany({
        where: whereClause,
        include: {
          registration: {
            include: {
              patient: true
            }
          }
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.medicineIssue.count({ where: whereClause })
    ]);

    // Add medicine details from in-memory store
    const medicineIssuesWithDetails = medicineIssues.map(issue => {
      // Try to find medicine by name in customMedicine field
      const medicine = getMedicineByName(issue.customMedicine || '');
      return {
        ...issue,
        medicine: medicine || null,
        // For backwards compatibility, map the medicineId from the in-memory store
        medicineId: medicine?.id || null
      };
    });

    return NextResponse.json({
      medicineIssues: medicineIssuesWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching medicine issues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}