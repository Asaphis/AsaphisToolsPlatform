/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-env node */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const logoPath = path.join(publicDir, 'AsaphistoolLogo.png');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons at different sizes
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-apple-180.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 }
];

async function generateIcons() {
  console.log('🎨 Generating icons from AsaphistoolLogo.png...\n');
  
  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: AsaphistoolLogo.png not found in public directory!');
    process.exit(1);
  }
  
  for (const { name, size } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }
  
  // Generate favicon.ico from 32x32 PNG
  try {
    const faviconPath = path.join(publicDir, 'favicon.ico');
    
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(faviconPath);
    
    console.log(`✅ Generated favicon.ico (32x32)`);
  } catch (error) {
    console.error(`❌ Error generating favicon.ico:`, error.message);
  }
  
  console.log('\n✨ All icons generated successfully from your brand logo!');
}

generateIcons().catch(console.error);
