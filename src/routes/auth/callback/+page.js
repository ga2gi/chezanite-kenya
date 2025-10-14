import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
  const code = url.searchParams.get('code');
  
  if (code) {
    // This route is for OAuth callbacks
    // The actual authentication is handled by Supabase automatically
    throw redirect(303, '/');
  }
  
  throw redirect(303, '/auth/signin');
}