const mongoose = require('mongoose');
require('dotenv').config();

// Import the Certificate model
const Certificate = require('./src/models/Certificate');

async function testEndpoints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a certificate to test with
    const certificate = await Certificate.findOne();
    
    if (!certificate) {
      console.log('❌ No certificates found in database');
      return;
    }

    console.log(`✅ Found certificate: ${certificate.certificateID}`);
    console.log(`📄 PDF Buffer exists: ${certificate.pdfBuffer ? 'Yes' : 'No'}`);
    console.log(`📋 Metadata Buffer exists: ${certificate.metadataBuffer ? 'Yes' : 'No'}`);
    
    if (certificate.pdfBuffer) {
      console.log(`📊 PDF Buffer size: ${certificate.pdfBuffer.length} bytes`);
    }
    
    if (certificate.metadataBuffer) {
      console.log(`📊 Metadata Buffer size: ${certificate.metadataBuffer.length} bytes`);
      try {
        const metadata = JSON.parse(certificate.metadataBuffer.toString());
        console.log(`📋 Metadata content:`, metadata);
      } catch (e) {
        console.log(`❌ Error parsing metadata: ${e.message}`);
      }
    }

    console.log(`\n🔗 Test URLs:`);
    console.log(`PDF: http://localhost:3000/api/certificates/${certificate._id}/pdf`);
    console.log(`Metadata: http://localhost:3000/api/certificates/${certificate._id}/metadata`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testEndpoints();
