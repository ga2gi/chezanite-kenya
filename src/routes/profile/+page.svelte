<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  let user = null;
  let profile = null;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;

    if (!user) {
      goto('/auth/signin');
      return;
    }

    // Load profile
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    profile = data;
  });
</script>

<div class="profile-test">
  <div class="container">
    <h1>Profile Page</h1>
    
    {#if profile}
      <div class="profile-info">
        <h2>Welcome, {profile.display_name}!</h2>
        <p>Username: @{profile.username}</p>
        <p>Email: {user.email}</p>
        <p>Score: {profile.score} points</p>
        <p>Games Played: {profile.games_played}</p>
      </div>
    {:else}
      <p>Loading profile...</p>
    {/if}

    <div class="navigation">
      <a href="/" class="btn">Go Home</a>
      <a href="/my-games" class="btn">My Games</a>
    </div>
  </div>
</div>

<style>
  .profile-test {
    padding: 40px 20px;
    min-height: 100vh;
    background: #f8fafc;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }

  h1 {
    color: #7c3aed;
    margin-bottom: 30px;
    text-align: center;
  }

  .profile-info {
    background: #f8fafc;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
  }

  .profile-info h2 {
    color: #1a1a1a;
    margin-bottom: 15px;
  }

  .profile-info p {
    margin: 8px 0;
    color: #666;
  }

  .navigation {
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .btn {
    background: #7c3aed;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.3s;
  }

  .btn:hover {
    background: #6d28d9;
  }
</style>