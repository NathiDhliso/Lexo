/**
 * OneDrive Configuration Test
 * 
 * Run this to verify your OneDrive OAuth setup is correct
 * 
 * Usage: npx tsx test-onedrive-config.ts
 */

// Check if environment variables are set
const clientId = process.env.VITE_ONEDRIVE_CLIENT_ID;
const clientSecret = process.env.VITE_ONEDRIVE_CLIENT_SECRET;
const authority = process.env.VITE_ONEDRIVE_AUTHORITY;

console.log('🔍 OneDrive Configuration Check\n');
console.log('================================\n');

let hasErrors = false;

// Check Client ID
if (!clientId || clientId.trim() === '') {
  console.log('❌ VITE_ONEDRIVE_CLIENT_ID is not set');
  hasErrors = true;
} else {
  console.log('✅ VITE_ONEDRIVE_CLIENT_ID is set');
  console.log(`   Value: ${clientId.substring(0, 8)}...${clientId.substring(clientId.length - 4)}`);
}

// Check Client Secret
if (!clientSecret || clientSecret.trim() === '') {
  console.log('❌ VITE_ONEDRIVE_CLIENT_SECRET is not set');
  hasErrors = true;
} else {
  console.log('✅ VITE_ONEDRIVE_CLIENT_SECRET is set');
  console.log(`   Value: ${clientSecret.substring(0, 4)}...${clientSecret.substring(clientSecret.length - 4)}`);
}

// Check Authority
if (!authority || authority.trim() === '') {
  console.log('⚠️  VITE_ONEDRIVE_AUTHORITY is not set (will use default)');
  console.log('   Default: https://login.microsoftonline.com/common');
} else {
  console.log('✅ VITE_ONEDRIVE_AUTHORITY is set');
  console.log(`   Value: ${authority}`);
}

console.log('\n================================\n');

if (hasErrors) {
  console.log('❌ Configuration incomplete!');
  console.log('\nNext steps:');
  console.log('1. Follow ONEDRIVE_QUICK_START.md to get your credentials');
  console.log('2. Add them to your .env file');
  console.log('3. Restart your dev server');
  console.log('4. Run this test again\n');
  process.exit(1);
} else {
  console.log('✅ Configuration looks good!');
  console.log('\nNext steps:');
  console.log('1. Make sure your dev server is running: npm run dev');
  console.log('2. Go to: http://localhost:5173/settings');
  console.log('3. Navigate to Cloud Storage');
  console.log('4. Click "Connect" on OneDrive');
  console.log('5. Sign in with your Microsoft account\n');
  process.exit(0);
}
