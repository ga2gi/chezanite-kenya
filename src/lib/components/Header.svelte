<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';

  let user = null;
  let menuOpen = false;

  onMount(async () => {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      user = session?.user;
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', user?.email);
        menuOpen = false; // Close menu on sign in
      }
    });

    return () => subscription.unsubscribe();
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    user = null;
    menuOpen = false;
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function navigateTo(path) {
    goto(path);
    closeMenu();
  }
</script>

<header class="header">
  <div class="header-container">
    <!-- Logo -->
    <div class="logo-section">
      <a href="/" class="logo-link" on:click|preventDefault={() => navigateTo('/')}>
        <span class="logo">ChezaNite</span>
      </a>
    </div>

    <!-- Desktop Navigation -->
    <nav class="desktop-nav">
      <div class="nav-links">
        <a href="/" class="nav-link" on:click|preventDefault={() => navigateTo('/')}>Home</a>
        <a href="/nationwide" class="nav-link" on:click|preventDefault={() => navigateTo('/nationwide')}>Nationwide</a>
        <a href="/rooms" class="nav-link" on:click|preventDefault={() => navigateTo('/rooms')}>Rooms</a>
      </div>

      <div class="auth-section">
        {#if user}
          <div class="user-menu">
            <button class="user-button" on:click={toggleMenu}>
              <span class="user-avatar">
                {#if user.user_metadata?.avatar_url}
                  <img src={user.user_metadata.avatar_url} alt={user.email} />
                {:else}
                  {user.email?.charAt(0).toUpperCase()}
                {/if}
              </span>
              <span class="user-email">{user.email}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            {#if menuOpen}
              <div class="dropdown-menu">
                <a href="/profile" class="dropdown-item" on:click|preventDefault={() => navigateTo('/profile')}>
                  <span class="dropdown-icon">👤</span>
                  My Profile
                </a>
                <a href="/settings" class="dropdown-item" on:click|preventDefault={() => navigateTo('/settings')}>
                  <span class="dropdown-icon">⚙️</span>
                  Settings
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item sign-out" on:click={handleSignOut}>
                  <span class="dropdown-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <a href="/auth" class="signin-button" on:click|preventDefault={() => navigateTo('/auth')}>
            Sign In
          </a>
        {/if}
      </div>
    </nav>

    <!-- Mobile Menu Button -->
    <button class="mobile-menu-button" on:click={toggleMenu}>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>

  <!-- Mobile Navigation -->
  {#if menuOpen}
    <div class="mobile-nav">
      <div class="mobile-nav-content">
        <div class="mobile-nav-links">
          <a href="/" class="mobile-nav-link" on:click|preventDefault={() => navigateTo('/')}>
            <span class="nav-icon">🏠</span>
            Home
          </a>
          <a href="/nationwide" class="mobile-nav-link" on:click|preventDefault={() => navigateTo('/nationwide')}>
            <span class="nav-icon">🌍</span>
            Nationwide
          </a>
          <a href="/leaderboard" class="mobile-nav-link" on:click|preventDefault={() => navigateTo('/leaderboard')}>
            <span class="nav-icon">🏆</span>
            Leaderboard
          </a>
        </div>

        <div class="mobile-auth-section">
          {#if user}
            <div class="mobile-user-info">
              <div class="mobile-user-avatar">
                {#if user.user_metadata?.avatar_url}
                  <img src={user.user_metadata.avatar_url} alt={user.email} />
                {:else}
                  {user.email?.charAt(0).toUpperCase()}
                {/if}
              </div>
              <div class="mobile-user-details">
                <div class="mobile-user-email">{user.email}</div>
                <div class="mobile-user-status">Online</div>
              </div>
            </div>
            
            <div class="mobile-user-links">
              <a href="/profile" class="mobile-nav-link" on:click|preventDefault={() => navigateTo('/profile')}>
                <span class="nav-icon">👤</span>
                My Profile
              </a>
              <a href="/settings" class="mobile-nav-link" on:click|preventDefault={() => navigateTo('/settings')}>
                <span class="nav-icon">⚙️</span>
                Settings
              </a>
              <button class="mobile-nav-link sign-out" on:click={handleSignOut}>
                <span class="nav-icon">🚪</span>
                Sign Out
              </button>
            </div>
          {:else}
            <a href="/auth" class="mobile-signin-button" on:click|preventDefault={() => navigateTo('/auth')}>
              <span class="nav-icon">🔑</span>
              Sign In
            </a>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Overlay -->
  {#if menuOpen}
    <div class="overlay" on:click={closeMenu}></div>
  {/if}
</header>

<style>
  .header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 70px;
  }

  /* Logo */
  .logo-section {
    flex-shrink: 0;
  }

  .logo-link {
    text-decoration: none;
    color: inherit;
  }

  .logo {
    font-size: 1.8rem;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Desktop Navigation */
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 40px;
  }

  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }
  }

  .nav-links {
    display: flex;
    gap: 30px;
  }

  .nav-link {
    color: #4a5568;
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    transition: color 0.2s ease;
    padding: 8px 0;
    position: relative;
  }

  .nav-link:hover {
    color: #667eea;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #667eea;
    transition: width 0.2s ease;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  /* Auth Section */
  .auth-section {
    display: flex;
    align-items: center;
  }

  .signin-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
  }

  .signin-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  /* User Menu */
  .user-menu {
    position: relative;
  }

  .user-button {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #4a5568;
  }

  .user-button:hover {
    border-color: #667eea;
    background: #f7fafc;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-email {
    font-size: 0.9rem;
    font-weight: 500;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-arrow {
    font-size: 0.7rem;
    color: #718096;
    transition: transform 0.2s ease;
  }

  .user-menu:hover .dropdown-arrow {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    z-index: 1001;
    overflow: hidden;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    text-decoration: none;
    color: #4a5568;
    font-size: 0.9rem;
    transition: background 0.2s ease;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .dropdown-item:hover {
    background: #f7fafc;
  }

  .dropdown-item.sign-out {
    color: #e53e3e;
  }

  .dropdown-item.sign-out:hover {
    background: #fed7d7;
  }

  .dropdown-icon {
    font-size: 1rem;
    width: 20px;
    text-align: center;
  }

  .dropdown-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 4px 0;
  }

  /* Mobile Menu Button */
  .mobile-menu-button {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }

  @media (max-width: 768px) {
    .mobile-menu-button {
      display: flex;
    }
  }

  .hamburger-line {
    width: 24px;
    height: 2px;
    background: #4a5568;
    transition: all 0.3s ease;
  }

  .menu-open .hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }

  .menu-open .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .menu-open .hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }

  /* Mobile Navigation */
  .mobile-nav {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 999;
    transform: translateX(-100%);
    animation: slideIn 0.3s ease forwards;
  }

  @keyframes slideIn {
    to {
      transform: translateX(0);
    }
  }

  .mobile-nav-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .mobile-nav-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 30px;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    text-decoration: none;
    color: #4a5568;
    font-weight: 500;
    border-radius: 8px;
    transition: background 0.2s ease;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-size: 1rem;
  }

  .mobile-nav-link:hover {
    background: #f7fafc;
  }

  .mobile-nav-link.sign-out {
    color: #e53e3e;
  }

  .mobile-nav-link.sign-out:hover {
    background: #fed7d7;
  }

  .nav-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
  }

  /* Mobile Auth Section */
  .mobile-auth-section {
    margin-top: auto;
    border-top: 1px solid #e2e8f0;
    padding-top: 20px;
  }

  .mobile-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f7fafc;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .mobile-user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1rem;
  }

  .mobile-user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .mobile-user-details {
    flex: 1;
  }

  .mobile-user-email {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
  }

  .mobile-user-status {
    font-size: 0.8rem;
    color: #48bb78;
  }

  .mobile-user-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mobile-signin-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .mobile-signin-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  /* Overlay */
  .overlay {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>