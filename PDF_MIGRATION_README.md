# PDF Migration to MongoDB - ChainCred

## Overview

This document explains the migration of PDF storage from local file system to MongoDB in ChainCred. This change makes deployment much easier since you no longer need to worry about file storage on the server.

## What Changed

### Before (Local File Storage)
- PDFs were stored in `backend/uploads/` directory
- Files were served via static route `/files/` in Express
- Certificate model stored `fileUrl` pointing to local file paths
- PDFViewer component displayed PDFs from local URLs

### After (MongoDB Storage)
- PDFs are now stored directly in MongoDB as Buffer data
- Files are served via API endpoint `/api/certificates/:id/pdf`
- Certificate model now includes `pdfBuffer` and `pdfContentType` fields
- PDFViewer component uses new MongoDB-based endpoints

## New Database Schema

The `Certificate` model has been updated with new fields:

```javascript
{
  // ... existing fields ...
  pdfBuffer: {
    type: Buffer,
    required: true, // NEW: Store PDF data directly in MongoDB
  },
  pdfContentType: {
    type: String,
    default: 'application/pdf', // NEW: Store content type
  },
  fileUrl: {
    type: String,
    required: false, // Made optional since we now store PDFs in MongoDB
  },
  // ... existing fields ...
}
```

## New API Endpoints

### GET `/api/certificates/:id/pdf`
- **Purpose**: Serve PDF content directly from MongoDB
- **Response**: PDF file with proper headers
- **Headers**: Content-Type, Content-Length, Content-Disposition, Cache-Control
- **Benefits**: No local file dependencies, easier deployment

## Migration Process

### 1. Run Migration Script
If you have existing certificates with local PDFs, run the migration script:

```bash
cd backend
node migrate-pdfs-to-mongodb.js
```

This script will:
- Find all existing certificates
- Read their local PDF files
- Store the PDF data as Buffer in MongoDB
- Update the certificate records

### 2. Verify Migration
Check that all certificates now have `pdfBuffer` field populated:

```javascript
// In MongoDB shell or your preferred tool
db.certificates.find({ pdfBuffer: { $exists: true } }).count()
```

### 3. Test New Endpoints
Verify that PDFs are now served from MongoDB:

```bash
curl http://localhost:5000/api/certificates/{certificate_id}/pdf
```

## Frontend Changes

The frontend has been updated to use the new MongoDB-based PDF endpoints:

### Before
```javascript
const handleViewPDF = (url) => {
  setCurrentPDFUrl(url); // url was local file path
  setShowPDFViewer(true);
};
```

### After
```javascript
const handleViewPDF = (certificateId) => {
  // NEW: Use MongoDB-based PDF endpoint
  const pdfUrl = `/api/certificates/${certificateId}/pdf`;
  setCurrentPDFUrl(pdfUrl);
  setShowPDFViewer(true);
};
```

## Benefits of MongoDB Storage

1. **Easier Deployment**: No need to manage local file storage on servers
2. **Scalability**: MongoDB can handle large numbers of PDFs efficiently
3. **Backup**: PDFs are included in database backups automatically
4. **Consistency**: All data (including PDFs) stored in one place
5. **No File System Dependencies**: Works consistently across different hosting environments

## Performance Considerations

- **Memory Usage**: PDFs are loaded into memory when served
- **Database Size**: MongoDB documents will be larger due to PDF buffers
- **Caching**: Consider implementing Redis caching for frequently accessed PDFs
- **CDN**: For production, consider serving PDFs through a CDN

## Security

- PDFs are served with proper Content-Type headers
- Access control can be implemented at the API level
- No direct file system access from web requests

## Cleanup

After successful migration, you can:

1. **Remove local uploads directory**:
   ```bash
   rm -rf backend/uploads/
   ```

2. **Remove static file serving** (already commented out in app.js):
   ```javascript
   // app.use('/files', express.static(...));
   ```

3. **Update .gitignore** to exclude uploads directory if not already done

## Troubleshooting

### PDF Not Loading
- Check that `pdfBuffer` field exists in MongoDB
- Verify the certificate ID in the URL
- Check browser console for errors

### Migration Errors
- Ensure MongoDB connection is working
- Check file permissions for local PDFs
- Verify file paths in existing certificates

### Performance Issues
- Consider implementing PDF compression
- Add Redis caching layer
- Monitor MongoDB memory usage

## Future Enhancements

1. **PDF Compression**: Implement PDF compression before storing in MongoDB
2. **Streaming**: Serve large PDFs as streams instead of loading entire buffer
3. **CDN Integration**: Serve PDFs through CDN for better performance
4. **Access Control**: Implement role-based access control for PDF viewing

## Support

If you encounter issues during migration:
1. Check the migration script logs
2. Verify MongoDB connection and permissions
3. Ensure all dependencies are installed
4. Check that the new API endpoints are working

---

**Note**: This migration maintains backward compatibility while providing a more robust and deployable solution for PDF storage.
