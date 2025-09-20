// Simple test to check registration API
import fetch from 'node-fetch';

const testAPI = async () => {
  try {
    console.log('Testing registration API...');
    
    const response = await fetch('http://localhost:3000/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Simple Test",
        address: "Test Address",
        contactNumber: "1234567890",
        dateOfBirth: "1990-01-01",
        age: 34,
        gender: "Male",
        weight: 70,
        height: 170,
        bmi: 24.2,
        bloodPressure: "120/80",
        selectedTests: []
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Success!', result);
    } else {
      console.log('Failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testAPI();