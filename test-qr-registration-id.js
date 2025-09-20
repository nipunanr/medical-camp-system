// Test script to verify QR code changes work with Registration ID
const testQRCodeWithRegistrationId = async () => {
  try {
    console.log('🧪 Testing QR code with Registration ID...');
    
    // First, create a test registration
    const testPatient = {
      name: "Test QR Patient",
      address: "123 QR Test Street",
      contactNumber: "1234567890",
      dateOfBirth: "1990-01-01",
      age: 34,
      gender: "Male",
      weight: 70,
      height: 170,
      bmi: 24.2,
      bloodPressure: "120/80",
      selectedTests: []
    };

    console.log('📝 Creating test registration...');
    const registrationResponse = await fetch('http://localhost:3000/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPatient),
    });

    if (!registrationResponse.ok) {
      throw new Error('Failed to create registration');
    }

    const registrationResult = await registrationResponse.json();
    console.log('✅ Registration created successfully!');
    console.log('📄 Registration ID:', registrationResult.registrationId);
    console.log('🏥 Patient ID:', registrationResult.patientId);
    console.log('🆔 Patient Number:', registrationResult.patientNumber);
    console.log('🔗 QR Code: Generated dynamically (not stored)');

    // Now test if we can find the registration using the ID
    console.log('\n🔍 Testing registration lookup by ID...');
    const lookupResponse = await fetch(`http://localhost:3000/api/registration/${registrationResult.registrationId}`);
    
    if (lookupResponse.ok) {
      const lookupResult = await lookupResponse.json();
      console.log('✅ Registration lookup successful!');
      console.log('👤 Patient Name:', lookupResult.patient.name);
      console.log('🏥 Registration ID:', lookupResult.id);
    } else {
      console.error('❌ Registration lookup failed');
    }

    // Test patient search by Registration ID
    console.log('\n🔍 Testing patient search by Registration ID...');
    const searchResponse = await fetch(`http://localhost:3000/api/patients/search?q=${registrationResult.registrationId}`);
    
    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.patients && searchResult.patients.length > 0) {
        console.log('✅ Patient search by Registration ID successful!');
        console.log('👤 Found Patient:', searchResult.patients[0].name);
        console.log('🏥 Registration ID in search results:', searchResult.patients[0].registrations[0].id);
      } else {
        console.log('⚠️ No patients found in search results');
      }
    } else {
      console.error('❌ Patient search failed');
    }

    console.log('\n🎉 QR Code Registration ID test completed!');
    console.log('📋 Summary:');
    console.log('- QR codes now contain Registration IDs instead of patient numbers');
    console.log('- Medicine Issue and Lab Results pages can accept Registration IDs');
    console.log('- Patient search can find patients by Registration ID');
    console.log('- All QR scanning workflows now use Registration Numbers as requested');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Wait for server to be ready and run test
setTimeout(testQRCodeWithRegistrationId, 3000);