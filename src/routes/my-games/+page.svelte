<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  let user = null;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;

    if (!user) {
      goto('/auth/signin');
      return;
    }
  });
</script>

<div class="my-games-test">
  <div class="container">
    <h1>My Games Page</h1>
    
    <div class="content">
      <p>This is the My Games page. Game history and active games will be displayed here.</p>
      
      {#if user}
        <div class="user-info">
          <p>Logged in as: {user.email}</p>
        </div>
      {/if}
    </div>

    <div class="navigation">
      <a href="/" class="btn">Go Home</a>
      <a href="/profile" class="btn">My Profile</a>
    </div>
  </div>
</div>

<style>
  .my-games-test {
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

  .content {
    background: #f8fafc;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    text-align: center;
  }

  .user-info {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eaeaea;
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