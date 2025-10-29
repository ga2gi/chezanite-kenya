<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  // Mock user data - replace with actual auth
  let user: any = null;
  let isSubscribed = false;
  let isLoading = true;

  // Tournament data
  let upcomingTournaments: Tournament[] = [];
  let activeTournaments: Tournament[] = [];
  let completedTournaments: Tournament[] = [];
  let selectedFilter: 'upcoming' | 'active' | 'completed' = 'upcoming';

  // Subscription info
  const subscriptionTier = {
    name: 'Premium',
    price: 299,
    firstMonthPrice: 100,
    period: 'month'
  };

  interface Tournament {
    id: string;
    name: string;
    theme: TournamentTheme;
    schedule: TournamentSchedule;
    status: TournamentStatus;
    registeredPlayers: number;
    maxPlayers: number;
    prizePool: number;
    entryFee: number;
    timeUntilStart?: string;
    isRegistered: boolean;
  }

  interface TournamentTheme {
    name: string;
    category: string;
    color: string;
    icon: string;
    description: string;
  }

  interface TournamentSchedule {
    date: string;
    day: string;
    time: string;
    duration: string;
  }

  type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'registration';

  onMount(() => {
    if (!browser) return;
    
    // Mock user data
    user = {
      id: '1',
      username: 'demo_user',
      subscription: { status: 'active', tier: 'premium' }
    };
    
    isSubscribed = user?.subscription?.status === 'active';
    loadTournaments();
    isLoading = false;
  });

  function loadTournaments(): void {
    // Mock tournament data
    upcomingTournaments = [
      {
        id: '1',
        name: 'Mega Monday Championship',
        theme: {
          name: 'General Knowledge',
          category: 'general',
          color: '#4f46e5',
          icon: '🌍',
          description: 'Test your knowledge across all categories'
        },
        schedule: {
          date: '2024-01-15',
          day: 'Monday',
          time: '19:00',
          duration: '45 mins'
        },
        status: 'registration',
        registeredPlayers: 67,
        maxPlayers: 100,
        prizePool: 2500,
        entryFee: 0, // Free for subscribers
        timeUntilStart: '2 days 3 hours',
        isRegistered: false
      },
      {
        id: '2',
        name: 'Wisdom Wednesday Showdown',
        theme: {
          name: 'Science & Tech',
          category: 'science',
          color: '#059669',
          icon: '🔬',
          description: 'Explore the world of science and technology'
        },
        schedule: {
          date: '2024-01-17',
          day: 'Wednesday',
          time: '19:00',
          duration: '45 mins'
        },
        status: 'upcoming',
        registeredPlayers: 45,
        maxPlayers: 80,
        prizePool: 2000,
        entryFee: 0,
        timeUntilStart: '4 days 3 hours',
        isRegistered: true
      },
      {
        id: '3',
        name: 'Friday Night Thriller',
        theme: {
          name: 'Entertainment',
          category: 'entertainment',
          color: '#dc2626',
          icon: '🎬',
          description: 'Movies, music, TV and pop culture'
        },
        schedule: {
          date: '2024-01-19',
          day: 'Friday',
          time: '21:00',
          duration: '60 mins'
        },
        status: 'registration',
        registeredPlayers: 89,
        maxPlayers: 150,
        prizePool: 3000,
        entryFee: 0,
        timeUntilStart: '6 days 5 hours',
        isRegistered: false
      }
    ];

    activeTournaments = [
      {
        id: '4',
        name: 'Monday Quick Fire',
        theme: {
          name: 'Current Events',
          category: 'news',
          color: '#7c3aed',
          icon: '📰',
          description: 'Stay updated with current affairs'
        },
        schedule: {
          date: '2024-01-08',
          day: 'Monday',
          time: '19:00',
          duration: '30 mins'
        },
        status: 'active',
        registeredPlayers: 95,
        maxPlayers: 100,
        prizePool: 1500,
        entryFee: 0,
        isRegistered: true
      }
    ];

    completedTournaments = [
      {
        id: '5',
        name: 'Friday Mega Tournament',
        theme: {
          name: 'Sports',
          category: 'sports',
          color: '#ea580c',
          icon: '⚽',
          description: 'All things sports and athletics'
        },
        schedule: {
          date: '2024-01-05',
          day: 'Friday',
          time: '19:00',
          duration: '45 mins'
        },
        status: 'completed',
        registeredPlayers: 120,
        maxPlayers: 150,
        prizePool: 2500,
        entryFee: 0,
        isRegistered: true
      }
    ];
  }

  function getTournamentsByFilter(): Tournament[] {
    switch (selectedFilter) {
      case 'upcoming': return upcomingTournaments;
      case 'active': return activeTournaments;
      case 'completed': return completedTournaments;
      default: return upcomingTournaments;
    }
  }

  function handleTournamentAction(tournament: Tournament): void {
    if (!user) {
      goto('/auth/login');
      return;
    }

    if (!isSubscribed) {
      goto('/subscribe');
      return;
    }

    switch (tournament.status) {
      case 'registration':
      case 'upcoming':
        if (tournament.isRegistered) {
          goto(`/nationwide/tournaments/${tournament.id}/lobby`);
        } else {
          goto(`/nationwide/tournaments/${tournament.id}/register`);
        }
        break;
      case 'active':
        goto(`/nationwide/tournaments/${tournament.id}/play`);
        break;
      case 'completed':
        goto(`/nationwide/tournaments/${tournament.id}/results`);
        break;
    }
  }

  function getActionButtonText(tournament: Tournament): string {
    if (!user) return 'Sign In to Join';
    if (!isSubscribed) return 'Subscribe to Join';

    switch (tournament.status) {
      case 'registration':
        return tournament.isRegistered ? 'Registered - Join Lobby' : 'Register Now';
      case 'upcoming':
        return tournament.isRegistered ? 'Join Lobby' : 'Register Now';
      case 'active':
        return 'Join Tournament';
      case 'completed':
        return 'View Results';
      default:
        return 'Join Tournament';
    }
  }

  function getButtonVariant(tournament: Tournament): string {
    if (!user || !isSubscribed) return 'secondary';
    
    switch (tournament.status) {
      case 'registration':
      case 'upcoming':
        return tournament.isRegistered ? 'success' : 'primary';
      case 'active':
        return 'warning';
      case 'completed':
        return 'outline';
      default:
        return 'primary';
    }
  }

  function getStatusBadge(tournament: Tournament): { text: string, color: string } {
    switch (tournament.status) {
      case 'registration':
        return { text: 'Registration Open', color: '#10b981' };
      case 'upcoming':
        return { text: 'Upcoming', color: '#f59e0b' };
      case 'active':
        return { text: 'Live Now', color: '#ef4444' };
      case 'completed':
        return { text: 'Completed', color: '#6b7280' };
      default:
        return { text: 'Upcoming', color: '#f59e0b' };
    }
  }

  function navigateToSubscribe(): void {
    goto('/subscribe');
  }

  function navigateToQuickPlay(): void {
    goto('/nationwide/quick-play');
  }
</script>

<svelte:head>
  <title>Tournaments - ChezaNite</title>
</svelte:head>

<div class="tournaments-container">
  <!-- Header Section -->
  <header class="tournaments-header">
    <div class="header-content">
      <div class="header-text">
        <h1>🏆 Weekly Tournaments</h1>
        <p class="subtitle">Compete in scheduled tournaments with bigger prize pools</p>
        <p class="schedule-info">Every Monday, Wednesday & Friday at 7:00 PM & 9:00 PM</p>
      </div>
      
      {#if !user}
        <div class="auth-cta">
          <p>Sign in to join tournaments and win amazing prizes!</p>
          <button class="sign-in-btn" on:click={() => goto('/auth/login')}>
            Sign In to Play
          </button>
        </div>
      {:else if !isSubscribed}
        <div class="subscription-cta">
          <div class="price-badge">
            <span class="original-price">KSH {subscriptionTier.price}</span>
            <span class="discount-price">KSH {subscriptionTier.firstMonthPrice} first month</span>
          </div>
          <p>Subscribe to join all tournaments for FREE!</p>
          <button class="subscribe-btn" on:click={navigateToSubscribe}>
            Subscribe Now - KSH {subscriptionTier.firstMonthPrice}
          </button>
        </div>
      {:else}
        <div class="subscriber-status">
          <div class="status-badge">
            <span class="badge-icon">⭐</span>
            PREMIUM SUBSCRIBER
          </div>
          <p>Unlimited tournament access • Zero entry fees</p>
        </div>
      {/if}
    </div>
  </header>

  <!-- Quick Stats -->
  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-number">3</div>
          <div class="stat-label">Tournaments Weekly</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-number">KSH 75K+</div>
          <div class="stat-label">Weekly Prize Pool</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">500+</div>
          <div class="stat-label">Weekly Players</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-number">45min</div>
          <div class="stat-label">Average Duration</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tournament Filters -->
  <section class="filters-section">
    <div class="filters-header">
      <h2>Available Tournaments</h2>
      <div class="filter-tabs">
        <button 
          class="filter-tab {selectedFilter === 'upcoming' ? 'active' : ''}"
          on:click={() => selectedFilter = 'upcoming'}
        >
          <span class="tab-icon">📅</span>
          Upcoming
          {#if upcomingTournaments.length > 0}
            <span class="tab-badge">{upcomingTournaments.length}</span>
          {/if}
        </button>
        <button 
          class="filter-tab {selectedFilter === 'active' ? 'active' : ''}"
          on:click={() => selectedFilter = 'active'}
        >
          <span class="tab-icon">🔴</span>
          Live Now
          {#if activeTournaments.length > 0}
            <span class="tab-badge">{activeTournaments.length}</span>
          {/if}
        </button>
        <button 
          class="filter-tab {selectedFilter === 'completed' ? 'active' : ''}"
          on:click={() => selectedFilter = 'completed'}
        >
          <span class="tab-icon">✅</span>
          Completed
          {#if completedTournaments.length > 0}
            <span class="tab-badge">{completedTournaments.length}</span>
          {/if}
        </button>
      </div>
    </div>
  </section>

  <!-- Tournaments Grid -->
  <section class="tournaments-section">
    {#if isLoading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading tournaments...</p>
      </div>
    {:else if getTournamentsByFilter().length === 0}
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No tournaments available</h3>
        <p>Check back later for upcoming tournaments</p>
        <button class="quick-play-btn" on:click={navigateToQuickPlay}>
          Play Quick Game Instead
        </button>
      </div>
    {:else}
      <div class="tournaments-grid">
        {#each getTournamentsByFilter() as tournament}
          <div class="tournament-card" style="border-left-color: {tournament.theme.color}">
            <!-- Tournament Header -->
            <div class="tournament-header">
              <div class="theme-badge" style="background: {tournament.theme.color}">
                <span class="theme-icon">{tournament.theme.icon}</span>
                <span class="theme-name">{tournament.theme.name}</span>
              </div>
              <div class="status-badge" style="background: {getStatusBadge(tournament).color}">
                {getStatusBadge(tournament).text}
              </div>
            </div>

            <!-- Tournament Info -->
            <div class="tournament-info">
              <h3 class="tournament-name">{tournament.name}</h3>
              <p class="tournament-description">{tournament.theme.description}</p>
              
              <div class="tournament-schedule">
                <div class="schedule-item">
                  <span class="schedule-icon">📅</span>
                  <span class="schedule-text">
                    {tournament.schedule.day}, {tournament.schedule.date} at {tournament.schedule.time}
                  </span>
                </div>
                <div class="schedule-item">
                  <span class="schedule-icon">⏱️</span>
                  <span class="schedule-text">{tournament.schedule.duration}</span>
                </div>
              </div>

              {#if tournament.timeUntilStart && tournament.status !== 'completed'}
                <div class="countdown-banner">
                  <span class="countdown-icon">⏰</span>
                  Starts in {tournament.timeUntilStart}
                </div>
              {/if}
            </div>

            <!-- Tournament Stats -->
            <div class="tournament-stats">
              <div class="stat">
                <div class="stat-value">KSH {tournament.prizePool.toLocaleString()}</div>
                <div class="stat-label">Prize Pool</div>
              </div>
              <div class="stat">
                <div class="stat-value">{tournament.registeredPlayers}/{tournament.maxPlayers}</div>
                <div class="stat-label">Players</div>
              </div>
              <div class="stat">
                <div class="stat-value {tournament.entryFee === 0 ? 'free' : 'paid'}">
                  {tournament.entryFee === 0 ? 'FREE' : `KSH ${tournament.entryFee}`}
                </div>
                <div class="stat-label">Entry</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="registration-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  style="width: {(tournament.registeredPlayers / tournament.maxPlayers) * 100}%"
                ></div>
              </div>
              <div class="progress-text">
                {tournament.registeredPlayers} of {tournament.maxPlayers} spots filled
                {#if tournament.registeredPlayers >= tournament.maxPlayers * 0.8}
                  <span class="warning-text"> • Almost Full!</span>
                {/if}
              </div>
            </div>

            <!-- Action Button -->
            <div class="tournament-actions">
              <button 
                class="action-btn {getButtonVariant(tournament)}"
                on:click={() => handleTournamentAction(tournament)}
              >
                {getActionButtonText(tournament)}
              </button>
              
              {#if tournament.isRegistered && tournament.status !== 'completed'}
                <div class="registered-badge">
                  <span class="badge-icon">✓</span>
                  Registered
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- How It Works -->
  <section class="how-it-works">
    <h2>How Tournament Play Works</h2>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Register Early</h3>
        <p>Secure your spot in upcoming tournaments. Limited seats available!</p>
      </div>
      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Join on Time</h3>
        <p>Be in the tournament lobby 15 minutes before start time</p>
      </div>
      <div class="step-card">
        <div class="step-number">3</div>
        <h3>Compete Live</h3>
        <p>Answer questions in real-time against other players</p>
      </div>
      <div class="step-card">
        <div class="step-number">4</div>
        <h3>Win Prizes</h3>
        <p>Top performers share the prize pool based on ranking</p>
      </div>
    </div>
  </section>

  <!-- Subscription CTA -->
  {#if user && !isSubscribed}
    <section class="subscription-section">
      <div class="subscription-cta-card">
        <div class="cta-content">
          <h2>Ready to Join Tournaments?</h2>
          <p>Get unlimited access to all tournaments with ChezaNite Premium</p>
          <div class="price-display">
            <div class="current-price">KSH {subscriptionTier.firstMonthPrice}</div>
            <div class="price-details">first month, then KSH {subscriptionTier.price}/{subscriptionTier.period}</div>
          </div>
          <ul class="benefits-list">
            <li>✅ Unlimited tournament access</li>
            <li>✅ Zero entry fees</li>
            <li>✅ Bigger prize pools</li>
            <li>✅ Weekly tournaments</li>
            <li>✅ Priority registration</li>
          </ul>
        </div>
        <div class="cta-action">
          <button class="cta-subscribe-btn" on:click={navigateToSubscribe}>
            Subscribe Now - KSH {subscriptionTier.firstMonthPrice}
          </button>
          <p class="cta-note">Cancel anytime • First month special offer</p>
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .tournaments-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0;
  }

  /* Header Styles */
  .tournaments-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 40px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 40px;
    align-items: center;
  }

  .header-text h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #fff, #ff7b00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin-bottom: 5px;
  }

  .schedule-info {
    opacity: 0.8;
    font-size: 1rem;
  }

  .auth-cta, .subscription-cta, .subscriber-status {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .price-badge {
    background: #ffd700;
    color: #1a237e;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: 700;
    margin-bottom: 10px;
    display: inline-block;
  }

  .original-price {
    text-decoration: line-through;
    opacity: 0.7;
    margin-right: 8px;
  }

  .discount-price {
    font-weight: 700;
  }

  .sign-in-btn, .subscribe-btn {
    background: #ffd700;
    color: #1a237e;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
  }

  .sign-in-btn:hover, .subscribe-btn:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ffd700;
    color: #1a237e;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .badge-icon {
    font-size: 1.1rem;
  }

  /* Stats Section */
  .stats-section {
    padding: 40px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-content {
    text-align: left;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 5px;
  }

  .stat-label {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  /* Filters Section */
  .filters-section {
    padding: 0 20px 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .filters-header h2 {
    font-size: 2rem;
    color: #ffd700;
  }

  .filter-tabs {
    display: flex;
    gap: 10px;
    background: rgba(255, 255, 255, 0.1);
    padding: 5px;
    border-radius: 12px;
  }

  .filter-tab {
    background: transparent;
    border: none;
    color: rgb(225, 230, 233);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .filter-tab.active {
    background: #ffd700;
    color: #1a237e;
  }

  .filter-tab:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-badge {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  .filter-tab.active .tab-badge {
    background: rgba(0, 0, 0, 0.3);
  }

  /* Tournaments Grid */
  .tournaments-section {
    padding: 0 20px 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #ffd700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #ffd700;
  }

  .quick-play-btn {
    background: #ffd700;
    color: #1a237e;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
  }

  .quick-play-btn:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 25px;
  }

  .tournament-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-left: 4px solid;
    transition: all 0.3s ease;
  }

  .tournament-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }

  .tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .status-badge {
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 700;
    color: white;
  }

  .tournament-info {
    margin-bottom: 20px;
  }

  .tournament-name {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  .tournament-description {
    opacity: 0.8;
    margin-bottom: 15px;
    line-height: 1.4;
  }

  .tournament-schedule {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
  }

  .schedule-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }

  .schedule-icon {
    opacity: 0.7;
  }

  .countdown-banner {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid #ffd700;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tournament-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 4px;
  }

  .stat-value.free {
    color: #4caf50;
  }

  .stat-value.paid {
    color: #ffd700;
  }

  .stat-label {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .registration-progress {
    margin-bottom: 20px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffd700, #ffed4a);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .warning-text {
    color: #ff6b6b;
    font-weight: 600;
  }

  .tournament-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .action-btn {
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-btn.primary {
    background: #ffd700;
    color: #1a237e;
  }

  .action-btn.primary:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .action-btn.secondary:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.2);
  }

  .action-btn.warning {
    background: #ef4444;
    color: white;
  }

  .action-btn.warning:hover {
    background: #dc2626;
    transform: translateY(-2px);
  }

  .action-btn.success {
    background: #10b981;
    color: white;
  }

  .action-btn.outline {
    background: transparent;
    color: rgb(28, 8, 8);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .action-btn.outline:hover {
    border-color: #ffd700;
    color: #ffd700;
  }

  .registered-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid #10b981;
    padding: 8px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* How It Works */
  .how-it-works {
    padding: 60px 20px;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .how-it-works h2 {
    font-size: 2.5rem;
    margin-bottom: 40px;
    color: #ffd700;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }

  .step-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .step-number {
    width: 50px;
    height: 50px;
    background: #ffd700;
    color: #1a237e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 auto 20px;
  }

  .step-card h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #ffd700;
  }

  .step-card p {
    opacity: 0.8;
    line-height: 1.5;
  }

  /* Subscription CTA */
  .subscription-section {
    padding: 0 20px 60px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .subscription-cta-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 40px;
    align-items: center;
  }

  .cta-content h2 {
    font-size: 2rem;
    margin-bottom: 10px;
    color: #ffd700;
  }

  .cta-content p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 20px;
  }

  .price-display {
    margin-bottom: 20px;
  }

  .current-price {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 5px;
  }

  .price-details {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .benefits-list {
    list-style: none;
    padding: 0;
  }

  .benefits-list li {
    padding: 5px 0;
    font-size: 0.9rem;
  }

  .cta-action {
    text-align: center;
  }

  .cta-subscribe-btn {
    background: #ffd700;
    color: #404ab2;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 10px;
  }

  .cta-subscribe-btn:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .cta-note {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 968px) {
    .header-content {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 20px;
    }

    .header-text h1 {
      font-size: 2.5rem;
    }

    .filters-header {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .filter-tabs {
      width: 100%;
      justify-content: center;
    }

    .tournaments-grid {
      grid-template-columns: 1fr;
    }

    .subscription-cta-card {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 30px;
    }

    .steps-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .tournaments-header {
      padding: 30px 15px;
    }

    .header-text h1 {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .filter-tabs {
      flex-direction: column;
    }

    .tournament-stats {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .subscription-cta-card {
      padding: 30px 20px;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .tournament-card {
      padding: 20px;
    }

    .tournament-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .status-badge {
      align-self: flex-start;
    }
  }
</style>