const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
const fs = require('fs');
const path = require('path');

/**
 * Script to fix existing certificates with old Greenfield URLs
 * Updates them to use local file URLs for proper file serving
 */

async function fixCertificateUrls() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaincred';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all certificates
    const certificates = await Certificate.find({});
    console.log(`Found ${certificates.length} certificates`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const cert of certificates) {
      try {
        let needsUpdate = false;
        const updates = {};

        // Check if fileUrl needs updating
        if (cert.fileUrl && cert.fileUrl.includes('gnfd-testnet-sp1.bnbchain.org')) {
          const fileName = `${cert.certificateID}.pdf`;
          const filePath = path.join(__dirname, 'uploads', fileName);
          
          if (fs.existsSync(filePath)) {
            updates.fileUrl = `http://localhost:3000/files/${fileName}`;
            needsUpdate = true;
            console.log(`Updated fileUrl for ${cert.certificateID}: ${updates.fileUrl}`);
          } else {
            console.log(`File not found for ${cert.certificateID}: ${filePath}`);
          }
        }

        // Check if metadataUrl needs updating
        if (cert.metadataUrl && cert.metadataUrl.includes('gnfd-testnet-sp1.bnbchain.org')) {
          const fileName = `${cert.certificateID}.json`;
          const metadataPath = path.join(__dirname, 'uploads', fileName);
          
          if (fs.existsSync(metadataPath)) {
            updates.metadataUrl = `http://localhost:3000/files/${fileName}`;
            needsUpdate = true;
            console.log(`Updated metadataUrl for ${cert.certificateID}: ${updates.metadataUrl}`);
          } else {
            console.log(`Metadata file not found for ${cert.certificateID}: ${metadataPath}`);
          }
        }

        // Update if needed
        if (needsUpdate) {
          await Certificate.findByIdAndUpdate(cert._id, updates);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating certificate ${cert.certificateID}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nUpdate complete:`);
    console.log(`- Updated: ${updatedCount} certificates`);
    console.log(`- Errors: ${errorCount} certificates`);
    console.log(`- Total: ${certificates.length} certificates`);

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  fixCertificateUrls();
}

module.exports = { fixCertificateUrls };
