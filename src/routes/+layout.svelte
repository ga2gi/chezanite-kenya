<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';

  let user = null;
  let profile = null;
  let showProfileDropdown = false;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user ?? null;

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      user = session?.user ?? null;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profile = data;
      } else {
        profile = null;
      }
    });

    return () => subscription.unsubscribe();
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    showProfileDropdown = false;
  }

  function toggleProfileDropdown() {
    showProfileDropdown = !showProfileDropdown;
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.user-profile')) {
      showProfileDropdown = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<svelte:head>
  <title>ChezaNite Kenya - Social Gaming Platform</title>
  <meta name="description" content="Kenya's favorite social gaming platform. Play with friends, make new ones, and have unforgettable game nights!" />
</svelte:head>

<div class="app">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="nav">
        <a href="/" class="logo">
          <div class="logo-icon">🎮</div>
          <span>ChezaNite</span>
        </a>
        
        <nav class="nav-links">
          <a href="/" class="nav-link">Home</a>
          <a href="/nationwide" class="nav-link">Nationwide</a>
          <a href="/rooms" class="nav-link">Rooms</a>
        </nav>

        <div class="user-section">
          {#if user && profile}
            <div class="user-profile">
              <div class="user-avatar" on:click={toggleProfileDropdown}>
                {profile.display_name?.[0]?.toUpperCase()}
              </div>
              {#if showProfileDropdown}
                <div class="profile-dropdown">
                  <div class="dropdown-item user-info">
                    <strong>{profile.display_name}</strong>
                    <span>@{profile.username}</span>
                    <div class="user-stats">
                      <span>{profile.score} pts</span>
                      <span>•</span>
                      <span>{profile.games_played} games</span>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a href="/profile" class="dropdown-item" on:click={() => showProfileDropdown = false}>
                    <div class="dropdown-icon">👤</div>
                    My Profile
                  </a>
                  <a href="/my-games" class="dropdown-item" on:click={() => showProfileDropdown = false}>
                    <div class="dropdown-icon">🎯</div>
                    My Games
                  </a>
                  <div class="dropdown-divider"></div>
                  <button on:click={handleSignOut} class="dropdown-item signout">
                    <div class="dropdown-icon">🚪</div>
                    Sign Out
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            <div class="auth-links">
              <a href="/auth/signin" class="btn-text">Sign In</a>
              <a href="/auth/signup" class="btn-primary">Sign Up</a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="main">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo">
            <div class="logo-icon">🎮</div>
            <span>ChezaNite</span>
          </div>
          <p>Kenya's favorite social gaming platform. Play with friends, make new ones, and have unforgettable game nights! 💤</p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/nationwide">Nationwide</a>
            <a href="/rooms">Rooms</a>
            <a href="/rooms/join">Join Room</a>
          </div>

          <div class="link-group">
            <h4>Games</h4>
            <a href="/games/trivia">Trivia Night</a>
            <a href="/games/charades">Charades</a>
            <a href="/games/broken-paragraph">Broken Paragraph</a>
            <a href="/games/imposter">Imposter Game</a>
          </div>

          <div class="link-group">
            <h4>Connect</h4>
            <a href="#" class="social-link">Facebook</a>
            <a href="#" class="social-link">Instagram</a>
            <a href="#" class="social-link">Twitter</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 ChezaNite Kenya. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #fff;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Header Styles */
  .header {
    background: #fff;
    border-bottom: 1px solid #eaeaea;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    font-weight: bold;
    font-size: 24px;
    color: #7c3aed;
  }

  .logo-icon {
    font-size: 28px;
  }

  .nav-links {
    display: flex;
    gap: 30px;
  }

  .nav-link {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    transition: color 0.3s;
  }

  .nav-link:hover {
    color: #7c3aed;
  }

  .user-section {
    display: flex;
    align-items: center;
  }

  .auth-links {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .btn-text {
    background: none;
    border: none;
    color: #666;
    text-decoration: none;
    cursor: pointer;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.3s;
  }

  .btn-text:hover {
    color: #7c3aed;
    background: #f8fafc;
  }

  .btn-primary {
    background: #7c3aed;
    color: white;
    padding: 8px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.3s;
  }

  .btn-primary:hover {
    background: #6d28d9;
  }

  /* User Profile Styles */
  .user-profile {
    position: relative;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    background: #7c3aed;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 16px;
  }

  .user-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }

  .profile-dropdown {
    position: absolute;
    top: 50px;
    right: 0;
    background: white;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    min-width: 220px;
    z-index: 1000;
    overflow: hidden;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    text-decoration: none;
    color: #333;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
  }

  .dropdown-item:hover {
    background: #f8fafc;
  }

  .dropdown-item.user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    background: #f8fafc;
  }

  .dropdown-item.user-info strong {
    font-size: 14px;
    color: #1a1a1a;
  }

  .dropdown-item.user-info span {
    font-size: 12px;
    color: #666;
  }

  .user-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 11px;
    color: #7c3aed;
    font-weight: 500;
  }

  .user-stats span:not(:nth-child(2)) {
    background: #ede9fe;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .dropdown-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .dropdown-divider {
    height: 1px;
    background: #eaeaea;
    margin: 0;
  }

  .dropdown-item.signout {
    color: #dc2626;
  }

  .dropdown-item.signout:hover {
    background: #fee2e2;
  }

  /* Main Content */
  .main {
    flex: 1;
  }

  /* Footer Styles */
  .footer {
    background: #1a1a1a;
    color: white;
    margin-top: auto;
  }

  .footer-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 60px;
    padding: 60px 0 40px;
  }

  .footer-brand {
    max-width: 300px;
  }

  .footer-brand .logo {
    color: white;
    margin-bottom: 20px;
  }

  .footer-brand p {
    color: #ccc;
    line-height: 1.6;
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }

  .link-group h4 {
    color: white;
    margin-bottom: 20px;
    font-size: 18px;
  }

  .link-group a {
    display: block;
    color: #ccc;
    text-decoration: none;
    margin-bottom: 12px;
    transition: color 0.3s;
  }

  .link-group a:hover {
    color: white;
  }

  .footer-bottom {
    border-top: 1px solid #333;
    padding: 20px 0;
    text-align: center;
    color: #999;
  }

  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }

    .footer-content {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .footer-links {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .profile-dropdown {
      right: -10px;
    }
  }

  @media (max-width: 480px) {
    .auth-links {
      gap: 10px;
    }

    .btn-text {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn-primary {
      padding: 6px 16px;
      font-size: 13px;
    }

    .profile-dropdown {
      min-width: 200px;
    }
  }
</style>