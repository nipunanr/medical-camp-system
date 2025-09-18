import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed Test Types
  const testTypes = [
    {
      name: 'Random Blood Sugar (RBS)',
      requiresResult: true,
      requiresPrintSheet: true,
      requiresBarcode: true,
    },
    {
      name: 'Fasting Blood Sugar (FBS)',
      requiresResult: true,
      requiresPrintSheet: true,
      requiresBarcode: true,
    },
    {
      name: 'Blood Pressure',
      requiresResult: true,
      requiresPrintSheet: false,
      requiresBarcode: false,
    },
    {
      name: 'Total Cholesterol',
      requiresResult: true,
      requiresPrintSheet: true,
      requiresBarcode: true,
    },
    {
      name: 'Dental Checkup',
      requiresResult: true,
      requiresPrintSheet: false,
      requiresBarcode: false,
    },
    {
      name: 'General Health Checkup',
      requiresResult: true,
      requiresPrintSheet: false,
      requiresBarcode: false,
    },
  ]

  for (const testType of testTypes) {
    await prisma.testType.upsert({
      where: { name: testType.name },
      update: {},
      create: testType,
    })
  }

  // Seed Medicines
  const medicines = [
    { name: 'Paracetamol', dosage: '500mg', stock: 100 },
    { name: 'Ibuprofen', dosage: '400mg', stock: 50 },
    { name: 'Aspirin', dosage: '75mg', stock: 75 },
    { name: 'Amoxicillin', dosage: '250mg', stock: 30 },
    { name: 'Metformin', dosage: '500mg', stock: 40 },
    { name: 'Atorvastatin', dosage: '20mg', stock: 25 },
    { name: 'Lisinopril', dosage: '10mg', stock: 35 },
    { name: 'Omeprazole', dosage: '20mg', stock: 60 },
  ]

  for (const medicine of medicines) {
    await prisma.medicine.upsert({
      where: { name: medicine.name },
      update: {},
      create: medicine,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })