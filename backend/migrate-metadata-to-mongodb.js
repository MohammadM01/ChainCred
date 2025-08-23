const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import the Certificate model
const Certificate = require('./src/models/Certificate');

async function migrateMetadataToMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find certificates that don't have metadataBuffer
    const certificates = await Certificate.find({ metadataBuffer: { $exists: false } });
    console.log(`Found ${certificates.length} certificates without metadataBuffer`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const certificate of certificates) {
      try {
        // Try to read metadata from the old metadataUrl if it exists and points to local files
        if (certificate.metadataUrl && certificate.metadataUrl.includes('/files/')) {
          const filePath = path.join(__dirname, '..', 'uploads', path.basename(certificate.metadataUrl));
          
          try {
            const metadataContent = await fs.readFile(filePath, 'utf8');
            const metadataBuffer = Buffer.from(metadataContent);
            
            // Update the certificate with metadataBuffer
            await Certificate.findByIdAndUpdate(certificate._id, {
              metadataBuffer,
              metadataContentType: 'application/json'
            });
            
            console.log(`✅ Migrated metadata for certificate ${certificate.certificateID}`);
            migratedCount++;
          } catch (fileError) {
            console.log(`⚠️ Could not read metadata file for ${certificate.certificateID}: ${fileError.message}`);
            // Create a basic metadata buffer with available data
            const basicMetadata = {
              certificateID: certificate.certificateID,
              studentWallet: certificate.studentWallet,
              issuerWallet: certificate.issuerWallet,
              fileHash: certificate.fileHash,
              issuedDate: certificate.issuedDate,
              note: 'Metadata migrated from database fields'
            };
            
            const metadataBuffer = Buffer.from(JSON.stringify(basicMetadata, null, 2));
            await Certificate.findByIdAndUpdate(certificate._id, {
              metadataBuffer,
              metadataContentType: 'application/json'
            });
            
            console.log(`✅ Created basic metadata for certificate ${certificate.certificateID}`);
            migratedCount++;
          }
        } else {
          // No metadataUrl or not a local file, create basic metadata
          const basicMetadata = {
            certificateID: certificate.certificateID,
            studentWallet: certificate.studentWallet,
            issuerWallet: certificate.issuerWallet,
            fileHash: certificate.fileHash,
            issuedDate: certificate.issuedDate,
            note: 'Metadata created from database fields'
          };
          
          const metadataBuffer = Buffer.from(JSON.stringify(basicMetadata, null, 2));
          await Certificate.findByIdAndUpdate(certificate._id, {
            metadataBuffer,
            metadataContentType: 'application/json'
          });
          
          console.log(`✅ Created basic metadata for certificate ${certificate.certificateID}`);
          migratedCount++;
        }
      } catch (error) {
        console.error(`❌ Error migrating certificate ${certificate.certificateID}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${certificates.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateMetadataToMongoDB();
