const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
const fs = require('fs');
const path = require('path');

/**
 * Script to fix certificate filename mismatches
 * Updates certificate URLs to match actual filenames in the uploads directory
 */

async function fixCertificateFilenames() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaincred';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('Uploads directory does not exist. Creating it...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const availableFiles = fs.readdirSync(uploadsDir);
    console.log(`Found ${availableFiles.length} files in uploads directory`);

    if (availableFiles.length === 0) {
      console.log('No files found in uploads directory. Nothing to fix.');
      return;
    }

    // Find all certificates
    const certificates = await Certificate.find({});
    console.log(`Found ${certificates.length} certificates in database`);

    let updatedCount = 0;
    let errorCount = 0;
    let noMatchCount = 0;

    for (const cert of certificates) {
      try {
        console.log(`\nProcessing certificate: ${cert.certificateID}`);
        
        // Look for matching files
        let matchingPdf = null;
        let matchingJson = null;

        // First try exact match
        const exactPdf = `${cert.certificateID}.pdf`;
        const exactJson = `${cert.certificateID}.json`;
        
        if (availableFiles.includes(exactPdf)) {
          matchingPdf = exactPdf;
          console.log(`  ✓ Found exact PDF match: ${exactPdf}`);
        }
        if (availableFiles.includes(exactJson)) {
          matchingJson = exactJson;
          console.log(`  ✓ Found exact JSON match: ${exactJson}`);
        }

        // If no exact matches, try timestamp-based matching
        if (!matchingPdf || !matchingJson) {
          if (cert.certificateID.includes('-')) {
            const timestamp = cert.certificateID.split('-')[0];
            const timestampFiles = availableFiles.filter(file => file.startsWith(timestamp));
            
            if (timestampFiles.length > 0) {
              console.log(`  Looking for timestamp-based matches: ${timestampFiles.join(', ')}`);
              
              // Find PDF
              if (!matchingPdf) {
                const pdfFiles = timestampFiles.filter(file => file.endsWith('.pdf'));
                if (pdfFiles.length > 0) {
                  matchingPdf = pdfFiles[0];
                  console.log(`  ✓ Found timestamp-based PDF: ${matchingPdf}`);
                }
              }
              
              // Find JSON
              if (!matchingJson) {
                const jsonFiles = timestampFiles.filter(file => file.endsWith('.json'));
                if (jsonFiles.length > 0) {
                  matchingJson = jsonFiles[0];
                  console.log(`  ✓ Found timestamp-based JSON: ${matchingJson}`);
                }
              }
            }
          }
        }

        // Update certificate if we found matches
        if (matchingPdf || matchingJson) {
          const updates = {};
          
          if (matchingPdf) {
            updates.fileUrl = `http://localhost:3000/files/${matchingPdf}`;
            console.log(`  Updated fileUrl to: ${updates.fileUrl}`);
          }
          
          if (matchingJson) {
            updates.metadataUrl = `http://localhost:3000/files/${matchingJson}`;
            console.log(`  Updated metadataUrl to: ${updates.metadataUrl}`);
          }

          // Update the certificate
          await Certificate.findByIdAndUpdate(cert._id, updates);
          updatedCount++;
          console.log(`  ✓ Certificate updated successfully`);
        } else {
          console.log(`  ✗ No matching files found for certificate ${cert.certificateID}`);
          noMatchCount++;
        }

      } catch (error) {
        console.error(`Error processing certificate ${cert.certificateID}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n=== Fix Complete ===`);
    console.log(`- Updated: ${updatedCount} certificates`);
    console.log(`- No match: ${noMatchCount} certificates`);
    console.log(`- Errors: ${errorCount} certificates`);
    console.log(`- Total: ${certificates.length} certificates`);

    if (noMatchCount > 0) {
      console.log(`\nNote: ${noMatchCount} certificates could not be matched to files.`);
      console.log('This might be because:');
      console.log('1. The files were never uploaded');
      console.log('2. The certificate IDs were generated differently');
      console.log('3. The files were stored with different naming conventions');
    }

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  fixCertificateFilenames();
}

module.exports = { fixCertificateFilenames };
