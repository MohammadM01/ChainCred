const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
require('dotenv').config();

/**
 * Test script to verify the new PDF endpoint functionality
 * This script will:
 * 1. Connect to MongoDB
 * 2. Find a certificate with PDF buffer
 * 3. Test the PDF buffer data
 * 4. Verify the new schema fields
 */

async function testPDFEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a certificate with PDF buffer
    const certificate = await Certificate.findOne({ pdfBuffer: { $exists: true } });
    
    if (!certificate) {
      console.log('📋 No certificates with PDF buffer found');
      console.log('💡 You may need to run the migration script first or upload a new certificate');
      return;
    }

    console.log('📋 Found certificate with PDF buffer:');
    console.log(`   ID: ${certificate._id}`);
    console.log(`   Certificate ID: ${certificate.certificateID}`);
    console.log(`   Student Wallet: ${certificate.studentWallet}`);
    console.log(`   PDF Buffer Size: ${certificate.pdfBuffer?.length || 0} bytes`);
    console.log(`   PDF Content Type: ${certificate.pdfContentType}`);
    console.log(`   Has fileUrl: ${!!certificate.fileUrl}`);

    // Test PDF buffer data
    if (certificate.pdfBuffer) {
      console.log('\n📄 PDF Buffer Test:');
      console.log(`   Buffer is Buffer: ${Buffer.isBuffer(certificate.pdfBuffer)}`);
      console.log(`   Buffer length: ${certificate.pdfBuffer.length}`);
      
      // Check if it looks like a PDF (should start with %PDF)
      const pdfHeader = certificate.pdfBuffer.toString('ascii', 0, 4);
      console.log(`   PDF Header: ${pdfHeader}`);
      console.log(`   Is PDF: ${pdfHeader === '%PDF'}`);
      
      if (pdfHeader === '%PDF') {
        console.log('✅ PDF buffer appears to contain valid PDF data');
      } else {
        console.log('⚠️  PDF buffer may not contain valid PDF data');
      }
    }

    // Test new schema fields
    console.log('\n🔍 Schema Validation:');
    console.log(`   pdfBuffer exists: ${certificate.schema.paths.pdfBuffer ? 'Yes' : 'No'}`);
    console.log(`   pdfContentType exists: ${certificate.schema.paths.pdfContentType ? 'Yes' : 'No'}`);
    console.log(`   fileUrl required: ${certificate.schema.paths.fileUrl?.isRequired || 'No'}`);

    console.log('\n🎉 PDF endpoint test completed successfully!');
    console.log('💡 You can now test the endpoint: GET /api/certificates/' + certificate._id + '/pdf');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testPDFEndpoint();
}

module.exports = { testPDFEndpoint };
