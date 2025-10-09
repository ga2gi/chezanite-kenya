<script>
  import { page } from '$app/stores';
</script>

<header class="header">
  <div class="header-content">
    <!-- Logo -->
    <div class="logo-section">
      <a href="/" class="logo-link">
        <h1 class="logo">ChezaNite</h1>
      </a>
      <p class="tagline">Where Kenya plays together! 🎮</p>
    </div>

    <!-- Navigation -->
    <nav class="navigation">
      <a href="/nationwide" class="nav-link {($page.url.pathname === '/nationwide' ? 'active' : '')}">
        <span class="nav-icon">🏆</span>
        Nationwide
      </a>
      <a href="/rooms" class="nav-link {($page.url.pathname === '/rooms' ? 'active' : '')}">
        <span class="nav-icon">👥</span>
        Rooms
      </a>
    </nav>

    <!-- User Section (placeholder for now) -->
    <div class="user-section">
      <button class="user-btn">
        <span class="user-avatar">👤</span>
        <span class="user-text">Profile</span>
      </button>
    </div>
  </div>
</header>

<style>
  .header {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: white;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .logo-link {
    text-decoration: none;
    color: white;
  }

  .logo {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: white;
  }

  .tagline {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.9;
    color: white;
  }

  .navigation {
    display: flex;
    gap: var(--space-md);
    align-items: center;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    color: white;
    text-decoration: none;
    border-radius: var(--radius-lg);
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .nav-link.active {
    background: rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }

  .nav-icon {
    font-size: 1.2rem;
  }

  .user-section {
    display: flex;
    align-items: center;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .user-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .user-avatar {
    font-size: 1.2rem;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: var(--space-md);
      text-align: center;
    }

    .logo-section {
      align-items: center;
    }

    .user-text {
      display: none;
    }

    .nav-link {
      padding: var(--space-sm);
    }
  }
</style>