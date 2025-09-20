// Test script to verify registration API is working
const testRegistration = async () => {
  try {
    console.log('Testing registration API...')
    
    const registrationData = {
      name: 'John Doe',
      address: '123 Test Street, Test City',
      contactNumber: '0771234567',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      weight: 70,
      height: 175,
      bloodPressure: '120/80',
      age: 34,
      bmi: 22.9,
      selectedTests: [] // No tests for initial test
    }
    
    const response = await fetch('http://localhost:3000/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Registration successful:', result)
      return result
    } else {
      const error = await response.text()
      console.error('❌ Registration failed:', error)
      throw new Error('Registration failed')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Test fetching test types
const testTestTypes = async () => {
  try {
    console.log('Testing test types API...')
    
    const response = await fetch('http://localhost:3000/api/test-types')
    
    if (response.ok) {
      const testTypes = await response.json()
      console.log('✅ Test types fetched:', testTypes.length, 'types found')
      return testTypes
    } else {
      console.error('❌ Failed to fetch test types')
    }
  } catch (error) {
    console.error('❌ Error fetching test types:', error.message)
  }
}

// Run tests
const runTests = async () => {
  console.log('🧪 Starting registration system tests...\n')
  
  await testTestTypes()
  console.log('\n')
  await testRegistration()
  
  console.log('\n✅ All tests completed!')
}

runTests()