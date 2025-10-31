import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';

const exec = promisify(_exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test utility function
async function testEndpoint(endpoint, file, options = {}) {
  const cmd = `curl -X POST -F "file=@${file}" http://localhost:4000/api/v1/${endpoint}`;
  try {
    const { stdout, stderr } = await exec(cmd);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Create test files
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  // Create a test image
  const testImage = path.join(testDir, 'test.png');
  if (!fs.existsSync(testImage)) {
    const size = 100;
    const cmd = `magick convert -size ${size}x${size} xc:white -draw "text ${size/4},${size/2} 'Test'" ${testImage}`;
    await exec(cmd);
  }
  
  // Create a test PDF
  const testPdf = path.join(testDir, 'test.pdf');
  if (!fs.existsSync(testPdf)) {
    const cmd = `magick convert ${testImage} ${testPdf}`;
    await exec(cmd);
  }
  
  // Test cases
  const tests = [
    { name: 'Image Compression', endpoint: 'image/compress', file: testImage },
    { name: 'Image Conversion', endpoint: 'image/convert?format=jpg', file: testImage },
    { name: 'PDF Compression', endpoint: 'pdf/compress', file: testPdf },
    { name: 'Icon Generation', endpoint: 'icon/to-ico', file: testImage },
  ];
  
  // Run tests
  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    const result = await testEndpoint(test.endpoint, test.file);
    console.log(result.success ? '✓ Success' : `✗ Failed: ${result.error}`);
    console.log();
  }
  
  // Cleanup
  console.log('Cleaning up test files...');
  fs.rmSync(testDir, { recursive: true, force: true });
  
  console.log('Tests completed!');
}

// Run tests if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runTests().catch(console.error);
}