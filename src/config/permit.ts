import { Permit } from 'permitio';
import dotenv from 'dotenv';

dotenv.config();

export const permit = new Permit({
  pdp: process.env.PERMIT_PDP_URL,
  token: process.env.PERMIT_API_KEY,
});

export async function testPermitConnection() {
  try {
    if (!process.env.PERMIT_API_KEY || process.env.PERMIT_API_KEY === 'permit_key_xxxxx') {
      console.log('⚠️  Permit.io not configured - using MOCK MODE');
      console.log('💡 Set PERMIT_API_KEY in .env to enable real authorization');
      return;
    }
    const resources = await permit.api.resources.list();
    console.log('✅ Permit.io connected:', resources.length, 'resources');
  } catch (error: any) {
    console.error('⚠️  Permit.io connection failed:', error.message);
    console.log('📝 Running in MOCK MODE - all permission checks will pass');
    console.log('💡 To use real authorization, ensure PERMIT_API_KEY is correct');
    // Don't exit - allow app to continue in mock mode
  }
}
