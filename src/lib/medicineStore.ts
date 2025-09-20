// Shared in-memory medicine store
// In production, this would use the database
// Trigger recompile

interface Medicine {
  id: string
  name: string
  dosage: string
  stock: number
  createdAt: string
  updatedAt: string
}

// Use globalThis to persist across module reloads in development
declare global {
  var medicinesStore: Medicine[] | undefined
}

if (!globalThis.medicinesStore) {
  globalThis.medicinesStore = [
    {
      id: '1',
      name: 'Paracetamol',
      dosage: '500mg',
      stock: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Ibuprofen', 
      dosage: '400mg',
      stock: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Amoxicillin',
      dosage: '250mg',
      stock: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Aspirin',
      dosage: '100mg',
      stock: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  console.log('🚀 Initialized medicinesStore with', globalThis.medicinesStore.length, 'medicines')
}

const medicinesStore = globalThis.medicinesStore

export const getMedicines = (): Medicine[] => {
  console.log('📋 getMedicines called, store has:', medicinesStore.length, 'medicines')
  console.log('📋 Current medicines IDs:', medicinesStore.map(m => m.id))
  return [...medicinesStore].sort((a, b) => a.name.localeCompare(b.name))
}

export const getMedicineById = (id: string): Medicine | undefined => {
  console.log('🔍 getMedicineById called with ID:', id)
  console.log('🔍 Available medicine IDs:', medicinesStore.map(m => m.id))
  const found = medicinesStore.find(m => m.id === id)
  console.log('🔍 Found medicine:', found ? `${found.name} (${found.id})` : 'NOT FOUND')
  return found
}

export const updateMedicineStock = (id: string, newStock: number): boolean => {
  const medicine = medicinesStore.find(m => m.id === id)
  if (medicine) {
    medicine.stock = newStock
    medicine.updatedAt = new Date().toISOString()
    return true
  }
  return false
}

export const reduceMedicineStock = (id: string, quantity: number): boolean => {
  const medicine = medicinesStore.find(m => m.id === id)
  if (medicine && medicine.stock >= quantity) {
    medicine.stock -= quantity
    medicine.updatedAt = new Date().toISOString()
    return true
  }
  return false
}

export const getMedicineByName = (name: string): Medicine | undefined => {
  return medicinesStore.find(m => m.name === name)
}

export const addMedicine = (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine => {
  const newMedicine: Medicine = {
    id: Date.now().toString(),
    ...medicine,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  medicinesStore.push(newMedicine)
  console.log('➕ Added new medicine:', newMedicine.name, 'with ID:', newMedicine.id)
  console.log('➕ Total medicines in store:', medicinesStore.length)
  console.log('➕ All IDs after addition:', medicinesStore.map(m => m.id))
  return newMedicine
}

export { type Medicine }