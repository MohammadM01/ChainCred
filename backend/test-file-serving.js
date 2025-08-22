const fs = require('fs');
const path = require('path');

/**
 * Simple test script to verify file serving setup
 */

function testFileServing() {
  console.log('Testing file serving setup...\n');

  // Test 1: Check if uploads directory exists
  const uploadsDir = path.join(__dirname, 'uploads');
  console.log('1. Checking uploads directory...');
  if (fs.existsSync(uploadsDir)) {
    console.log(`   ✓ Uploads directory exists: ${uploadsDir}`);
    
    // List files in uploads directory
    const files = fs.readdirSync(uploadsDir);
    console.log(`   ✓ Found ${files.length} files in uploads directory`);
    
    if (files.length > 0) {
      console.log('   Files:');
      files.slice(0, 10).forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`     - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
      
      if (files.length > 10) {
        console.log(`     ... and ${files.length - 10} more files`);
      }
    }
  } else {
    console.log(`   ✗ Uploads directory does not exist: ${uploadsDir}`);
    console.log('   Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('   ✓ Uploads directory created');
  }

  // Test 2: Check if we can create a test file
  console.log('\n2. Testing file creation...');
  const testFile = path.join(uploadsDir, 'test.txt');
  const testContent = 'This is a test file for ChainCred file serving';
  
  try {
    fs.writeFileSync(testFile, testContent);
    console.log('   ✓ Test file created successfully');
    
    // Verify file content
    const readContent = fs.readFileSync(testFile, 'utf8');
    if (readContent === testContent) {
      console.log('   ✓ Test file content verified');
    } else {
      console.log('   ✗ Test file content mismatch');
    }
    
    // Clean up test file
    fs.unlinkSync(testFile);
    console.log('   ✓ Test file cleaned up');
  } catch (error) {
    console.log(`   ✗ Error creating test file: ${error.message}`);
  }

  // Test 3: Check file paths for the specific file mentioned in the error
  console.log('\n3. Checking specific file path...');
  const specificFile = '1755859309924-21dbb21ab397fde64d5bcad160eb7c05023f9a91638891ddfaac7ff84f2c49e3.json';
  const specificFilePath = path.join(uploadsDir, specificFile);
  
  if (fs.existsSync(specificFilePath)) {
    console.log(`   ✓ Specific file exists: ${specificFile}`);
    const stats = fs.statSync(specificFilePath);
    console.log(`   ✓ File size: ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log(`   ✗ Specific file not found: ${specificFile}`);
    console.log(`   Expected path: ${specificFilePath}`);
  }

  console.log('\nFile serving test complete!');
  console.log('\nTo test the backend endpoints:');
  console.log('1. Start the backend server');
  console.log('2. Visit: http://localhost:3000/test/files');
  console.log('3. Try to access: http://localhost:3000/files/[filename]');
}

// Run the test
testFileServing();
