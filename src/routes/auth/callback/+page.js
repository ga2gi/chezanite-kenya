import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
  // Supabase magic link callbacks include the token in the URL hash
  // We need to handle this client-side, so we'll redirect to a client-side page
  
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') || '/nationwide';

  if (token_hash && type === 'magiclink') {
    // We'll handle the actual authentication in the client
    // Pass the token to the client component
    return {
      token_hash,
      type,
      next
    };
  }

  // If no valid token parameters, redirect to auth page
  throw redirect(303, '/auth');
};