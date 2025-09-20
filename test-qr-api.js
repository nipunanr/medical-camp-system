// Test the new QR API endpoint
const testQRAPI = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/qr/test-registration-id');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ QR API test successful!');
      console.log('Registration ID:', data.registrationId);
      console.log('QR Code generated:', data.qrCode ? 'Yes' : 'No');
    } else {
      console.error('❌ QR API test failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testQRAPI();