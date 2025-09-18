// Test script to verify Supabase connection with our API
const testPatientRegistration = async () => {
  try {
    console.log('🧪 Testing patient registration API...');
    
    const testPatient = {
      name: "Test Patient",
      address: "123 Test Street",
      contactNumber: "1234567890",
      dateOfBirth: "1990-01-01",
      age: 34,
      gender: "Male",
      weight: 70,
      height: 170,
      bmi: 24.2,
      bloodPressure: "120/80",
      doctor: "Dr. Test",
      complaint: "Test complaint",
      diagnosis: "Test diagnosis",
      prescription: "Test prescription"
    };

    const response = await fetch('http://localhost:3000/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPatient),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration successful!');
      console.log('📄 Registration ID:', result.registration.id);
      console.log('🏥 Patient ID:', result.patient.id);
      console.log('🔗 QR Code:', result.registration.qrCode);
    } else {
      const error = await response.text();
      console.error('❌ Registration failed:', error);
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
};

// Wait a moment for the server to be ready
setTimeout(testPatientRegistration, 3000);