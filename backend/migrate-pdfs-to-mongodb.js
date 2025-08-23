const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Certificate = require('./src/models/Certificate');
require('dotenv').config();

/**
 * Migration script to move existing PDFs from local file storage to MongoDB
 * This script will:
 * 1. Find all existing certificates
 * 2. Read their local PDF files
 * 3. Store the PDF data as Buffer in MongoDB
 * 4. Update the certificate records
 */

async function migratePDFsToMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all certificates that don't have pdfBuffer
    const certificates = await Certificate.find({ pdfBuffer: { $exists: false } });
    console.log(`📋 Found ${certificates.length} certificates to migrate`);

    if (certificates.length === 0) {
      console.log('🎉 No certificates need migration - all PDFs are already in MongoDB!');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const cert of certificates) {
      try {
        console.log(`🔄 Processing certificate: ${cert.certificateID}`);
        
        // Extract filename from fileUrl (assuming format: /files/filename.pdf)
        const fileUrl = cert.fileUrl;
        if (!fileUrl || !fileUrl.includes('/files/')) {
          console.log(`⚠️  Skipping certificate ${cert.certificateID} - no valid fileUrl`);
          continue;
        }

        const fileName = fileUrl.split('/files/')[1];
        if (!fileName) {
          console.log(`⚠️  Skipping certificate ${cert.certificateID} - could not extract filename`);
          continue;
        }

        // Construct local file path
        const uploadsDir = path.join(__dirname, 'uploads');
        const filePath = path.join(uploadsDir, fileName);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${filePath}`);
          continue;
        }

        // Read file and convert to buffer
        const fileBuffer = fs.readFileSync(filePath);
        console.log(`📄 Read PDF file: ${fileName} (${fileBuffer.length} bytes)`);

        // Update certificate with PDF buffer
        await Certificate.findByIdAndUpdate(cert._id, {
          pdfBuffer: fileBuffer,
          pdfContentType: 'application/pdf'
        });

        console.log(`✅ Successfully migrated certificate: ${cert.certificateID}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating certificate ${cert.certificateID}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📋 Total processed: ${certificates.length}`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('💡 You can now safely remove the local uploads directory');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migratePDFsToMongoDB();
}

module.exports = { migratePDFsToMongoDB };
