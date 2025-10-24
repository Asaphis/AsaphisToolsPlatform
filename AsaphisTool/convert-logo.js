/**
 * Logo Conversion Helper Script
 * 
 * This script will help you convert your logo image to all required formats.
 * 
 * Steps to use:
 * 1. Save your logo image as 'logo-source.png' in the public directory (1024x1024 or larger recommended)
 * 2. Run: npm install sharp --save-dev
 * 3. Run: node convert-logo.js
 * 
 * This will generate:
 * - logo.png (for header)
 * - favicon.ico (16x16, 32x32, 48x48)
 * - favicon-16x16.png
 * - favicon-32x32.png
 * - icon-192.png (PWA)
 * - icon-512.png (PWA)
 * - icon-apple-180.png (Apple touch icon)
 */

const fs = require('fs');
const path = require('path');

async function convertLogo() {
  try {
    const sharp = require('sharp');
    const publicDir = path.join(__dirname, 'public');
    const sourcePath = path.join(publicDir, 'logo-source.png');

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error('❌ Error: logo-source.png not found in public directory');
      console.log('📝 Please save your logo as "logo-source.png" in the public directory');
      return;
    }

    console.log('🎨 Converting logo to required formats...\n');

    // Load source image
    const sourceImage = sharp(sourcePath);
    const metadata = await sourceImage.metadata();
    console.log(`✅ Source image loaded: ${metadata.width}x${metadata.height}`);

    // Generate logo.png (200x200 for header)
    await sourceImage
      .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'logo.png'));
    console.log('✅ Generated: logo.png (200x200)');

    // Generate favicon sizes
    await sourceImage
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✅ Generated: favicon-16x16.png');

    await sourceImage
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✅ Generated: favicon-32x32.png');

    // Generate PWA icons
    await sourceImage
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated: icon-192.png (PWA)');

    await sourceImage
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated: icon-512.png (PWA)');

    // Generate Apple touch icon
    await sourceImage
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'icon-apple-180.png'));
    console.log('✅ Generated: icon-apple-180.png (Apple)');

    // Generate favicon.ico (using 32x32)
    await sourceImage
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFormat('png')
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✅ Generated: favicon.ico');

    // Generate og-image and twitter-image for social sharing
    await sourceImage
      .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, 'og-image.png'));
    console.log('✅ Generated: og-image.png (1200x630)');

    await sourceImage
      .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, 'twitter-image.png'));
    console.log('✅ Generated: twitter-image.png (1200x630)');

    console.log('\n🎉 All logo files generated successfully!');
    console.log('\n📁 Generated files:');
    console.log('   - logo.png');
    console.log('   - favicon.ico');
    console.log('   - favicon-16x16.png');
    console.log('   - favicon-32x32.png');
    console.log('   - icon-192.png');
    console.log('   - icon-512.png');
    console.log('   - icon-apple-180.png');
    console.log('   - og-image.png');
    console.log('   - twitter-image.png');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Sharp module not found.');
      console.log('📦 Please install it by running: npm install sharp --save-dev');
    } else {
      console.error('❌ Error converting logo:', error.message);
    }
  }
}

convertLogo();
