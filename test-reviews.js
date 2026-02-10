// Test script for review APIs
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

// Load .env.local manually (handling multi-line quoted values)
const envContent = fs.readFileSync('.env.local', 'utf-8');
const lines = envContent.split('\n');
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    // Handle multi-line quoted values
    if ((value.startsWith('"') && !value.endsWith('"')) || (value.startsWith("'") && !value.endsWith("'"))) {
      const quote = value[0];
      value = value.slice(1); // Remove opening quote
      i++;
      // Continue reading lines until we find the closing quote
      while (i < lines.length) {
        const nextLine = lines[i];
        value += '\n' + nextLine;
        if (nextLine.endsWith(quote)) {
          value = value.slice(0, -1); // Remove closing quote
          break;
        }
        i++;
      }
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    process.env[key] = value;
  }
  i++;
}

async function testAppStore() {
  console.log('\n🍎 Testing App Store Connect API...\n');
  
  try {
    const keyId = process.env.APPSTORE_KEY_ID;
    const issuerId = process.env.APPSTORE_ISSUER_ID;
    const privateKey = process.env.APPSTORE_PRIVATE_KEY;
    
    console.log('Key ID:', keyId);
    console.log('Issuer ID:', issuerId);
    console.log('Private Key:', privateKey ? 'Present' : 'Missing');
    console.log('Private Key (first 100 chars):', privateKey?.substring(0, 100));
    console.log('Private Key (last 50 chars):', privateKey?.substring(privateKey.length - 50));
    
    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '20m',
      audience: 'appstoreconnect-v1',
      issuer: issuerId,
      header: {
        alg: 'ES256',
        kid: keyId,
        typ: 'JWT',
      },
    });
    
    console.log('\n✅ JWT generated successfully');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    const appId = '6479197432';
    const url = `https://api.appstoreconnect.apple.com/v1/apps/${appId}/customerReviews?sort=-createdDate&limit=5`;
    
    console.log('\n📡 Fetching reviews from:', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.log('❌ Error response:', text.substring(0, 500));
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ Success! Reviews fetched:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      const review = data.data[0];
      console.log('\nSample review:');
      console.log('- Rating:', review.attributes.rating);
      console.log('- Title:', review.attributes.title || '(no title)');
      console.log('- Body:', review.attributes.body?.substring(0, 100) || '(no body)');
    }
    
  } catch (error) {
    console.error('❌ App Store test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function testGooglePlay() {
  console.log('\n\n🤖 Testing Google Play API...\n');
  
  try {
    const packageName = process.env.GOOGLE_PLAY_PACKAGE;
    console.log('Package:', packageName);
    
    const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
    if (!credentialsBase64) {
      console.log('❌ GOOGLE_APPLICATION_CREDENTIALS_BASE64 not found');
      return;
    }
    
    const credentials = JSON.parse(
      Buffer.from(credentialsBase64, 'base64').toString('utf-8')
    );
    
    console.log('Project ID:', credentials.project_id);
    console.log('Client Email:', credentials.client_email);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    
    const androidpublisher = google.androidpublisher({
      version: 'v3',
      auth,
    });
    
    console.log('\n📡 Fetching reviews...');
    
    const response = await androidpublisher.reviews.list({
      packageName,
      maxResults: 5,
    });
    
    console.log('\n✅ Success! Reviews fetched:', response.data.reviews?.length || 0);
    
    if (response.data.reviews && response.data.reviews.length > 0) {
      const review = response.data.reviews[0];
      const comment = review.comments?.[0]?.userComment;
      console.log('\nSample review:');
      console.log('- Rating:', comment?.starRating);
      console.log('- Text:', comment?.text?.substring(0, 100) || '(no text)');
      console.log('- Author:', review.authorName);
    }
    
  } catch (error) {
    console.error('❌ Google Play test failed:', error.message);
    if (error.errors) {
      console.error('API Errors:', JSON.stringify(error.errors, null, 2));
    }
    console.error('Stack:', error.stack);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 SHINOBI DASHBOARD - REVIEW API TEST');
  console.log('='.repeat(60));
  
  await testAppStore();
  await testGooglePlay();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test complete');
  console.log('='.repeat(60) + '\n');
}

main();
