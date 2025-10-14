import { supabase } from '$lib/supabase';

// Handle auth state changes - make it non-blocking
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);

  if (event === 'SIGNED_IN' && session) {
    console.log('User signed in, scheduling profile creation...');
    // Don't await this - let it run in background
    ensureUserProfile(session.user).catch(error => {
      console.error('Background profile creation failed:', error);
    });
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

async function ensureUserProfile(user) {
  try {
    console.log('Ensuring profile for user:', user.id);
    
    // Quick check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create one
    if (checkError && checkError.code === 'PGRST116') {
      console.log('Creating profile in background...');
      
      const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.display_name || 
                         user.user_metadata?.name ||
                         username;
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username,
          display_name: displayName,
          country: 'Kenya'
        });

      if (insertError) {
        console.error('Background profile creation error:', insertError);
        
        // If it's a duplicate username error, try with a different username
        if (insertError.code === '23505' && insertError.message.includes('username')) {
          const uniqueUsername = `${username}_${Math.random().toString(36).substring(2, 8)}`;
          console.log('Username taken, trying:', uniqueUsername);
          
          const { error: retryError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: uniqueUsername,
              display_name: displayName,
              country: 'Kenya'
            });

          if (retryError) {
            console.error('Error creating profile with unique username:', retryError);
          } else {
            console.log('Profile created successfully with unique username');
          }
        }
      } else {
        console.log('Background profile creation successful');
      }
    } else if (checkError) {
      console.error('Background profile check error:', checkError);
    } else {
      console.log('Profile already exists');
    }
  } catch (error) {
    console.error('Unexpected error in background profile creation:', error);
  }
}

// Initialize existing user in background
async function initializeExistingUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('Existing session found, ensuring profile in background...');
      ensureUserProfile(session.user).catch(error => {
        console.error('Background profile init failed:', error);
      });
    }
  } catch (error) {
    console.error('Error initializing existing user:', error);
  }
}

// Call this on app start - non-blocking
initializeExistingUser();