const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Smart upload utility that stores files locally but structures metadata
 * for easy future integration with Greenfield or other blockchain storage
 */
const smartUpload = async (fileBuffer, fileName, metadata = {}, options = {}) => {
  try {
    const { forceLocal = true, enableGreenfield = false } = options;
    
    console.log('Starting smart upload...');
    console.log('File size:', fileBuffer.length, 'bytes');
    console.log('Force local:', forceLocal);
    console.log('Enable Greenfield:', enableGreenfield);
    
    // Generate unique identifiers
    const timestamp = Date.now();
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const uniqueName = `${timestamp}-${fileHash}`;
    
    // Determine file extension
    const isMetadata = fileName.endsWith('.json');
    const extension = isMetadata ? '.json' : '.pdf';
    const finalFileName = `${uniqueName}${extension}`;
    
    // Setup local storage paths
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, finalFileName);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Store file locally
    console.log('Storing file locally:', finalFileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    // Generate URLs and hashes
    const localUrl = `${process.env.PUBLIC_BASE_URL}/files/${finalFileName}`;
    const contentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Create comprehensive metadata
    const fileMetadata = {
      // File information
      originalName: fileName,
      uniqueName: finalFileName,
      size: fileBuffer.length,
      contentType: isMetadata ? 'application/json' : 'application/pdf',
      hash: contentHash,
      
      // Storage information
      storage: {
        local: {
          url: localUrl,
          path: filePath,
          available: true
        },
        greenfield: {
          url: null,
          available: false,
          error: 'Not implemented yet'
        }
      },
      
      // Timestamps
      createdAt: new Date().toISOString(),
      uploadedAt: timestamp,
      
      // Custom metadata
      metadata: metadata || {}
    };
    
    // Save metadata file alongside the main file
    const metadataFileName = `${uniqueName}.json`;
    const metadataPath = path.join(uploadDir, metadataFileName);
    const metadataUrl = `${process.env.PUBLIC_BASE_URL}/files/${metadataFileName}`;
    
    fs.writeFileSync(metadataPath, JSON.stringify(fileMetadata, null, 2));
    
    console.log('✅ File stored successfully');
    console.log('File URL:', localUrl);
    console.log('Metadata URL:', metadataUrl);
    
    // Future: Add Greenfield upload here when SDK is working
    if (enableGreenfield && !forceLocal) {
      console.log('🔄 Greenfield upload would happen here (when SDK is fixed)');
      // TODO: Implement Greenfield upload when SDK is stable
      // try {
      //   const greenfieldResult = await uploadToGreenfield(fileBuffer, finalFileName);
      //   fileMetadata.storage.greenfield.url = greenfieldResult.url;
      //   fileMetadata.storage.greenfield.available = true;
      //   fileMetadata.storage.greenfield.error = null;
      // } catch (error) {
      //   fileMetadata.storage.greenfield.error = error.message;
      // }
    }
    
    return {
      // Main response
      url: localUrl,
      hash: contentHash,
      method: 'SMART_LOCAL_STORAGE',
      
      // Detailed information
      file: {
        name: finalFileName,
        originalName: fileName,
        size: fileBuffer.length,
        type: isMetadata ? 'metadata' : 'pdf'
      },
      
      // Storage locations
      storage: {
        local: {
          url: localUrl,
          available: true
        },
        metadata: {
          url: metadataUrl,
          available: true
        },
        greenfield: {
          url: null,
          available: false,
          reason: 'SDK not working - will implement when fixed'
        }
      },
      
      // Blockchain ready
      blockchain: {
        hash: contentHash,
        timestamp: timestamp,
        metadata: fileMetadata
      }
    };
    
  } catch (error) {
    console.error('Smart upload error:', error);
    throw new Error(`Smart upload failed: ${error.message}`);
  }
};

module.exports = { smartUpload };
