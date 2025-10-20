<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  // Mock user data - replace with your actual auth store
  let user: any = null;
  let isSubscribed = false;
  let userSubscription: any = null;

  onMount(() => {
    // Check if user is logged in and subscribed
    // This would typically come from your auth store
    if (browser) {
      // Mock user data for demonstration
      user = {
        id: '1',
        username: 'demo_user',
        subscription: null // Change to active subscription to test subscribed state
      };
      
      userSubscription = user?.subscription;
      isSubscribed = userSubscription?.status === 'active';
    }
  });

  // Mock data for tournaments
  const featuredTournaments = [
    {
      id: '1',
      name: 'Friday Game Night Mega Tournament',
      prizePool: 15000,
      players: 87,
      maxPlayers: 100,
      startTime: 'Today, 8:00 PM',
      requiresSubscription: true,
      subscriptionTier: 'basic',
      description: 'Weekly mega tournament for all subscribers'
    },
    {
      id: '2',
      name: 'Premium Championship',
      prizePool: 50000,
      players: 45,
      maxPlayers: 50,
      startTime: 'Tomorrow, 7:00 PM',
      requiresSubscription: true,
      subscriptionTier: 'premium',
      description: 'Exclusive high-stakes tournament for premium members'
    },
    {
      id: '3',
      name: 'Quick Fire Daily',
      prizePool: 5000,
      players: 23,
      maxPlayers: 200,
      startTime: 'Ongoing',
      requiresSubscription: true,
      subscriptionTier: 'basic',
      description: 'Fast-paced daily tournament'
    }
  ];

  const subscriptionBenefits = [
    {
      icon: '🎮',
      title: 'Unlimited Tournament Access',
      description: 'Join any tournament for free once subscribed'
    },
    {
      icon: '💰',
      title: 'Zero Entry Fees',
      description: 'No additional costs to join premium tournaments'
    },
    {
      icon: '🏆',
      title: 'Bigger Prize Pools',
      description: 'Access tournaments with larger cash prizes'
    },
    {
      icon: '⚡',
      title: 'Priority Registration',
      description: 'Early access to popular tournaments'
    }
  ];

  function navigateToQuickPlay(): void {
    if (!isSubscribed) {
      goto('/subscribe');
      return;
    }
    goto('/nationwide/quick-play');
  }

  function navigateToTournaments(): void {
    goto('/nationwide/tournaments');
  }

  function navigateToTournament(id: string): void {
    if (!isSubscribed) {
      goto('/subscribe');
      return;
    }
    goto(`/nationwide/tournaments/${id}`);
  }

  function handleJoinTournament(tournament: any): void {
    if (!isSubscribed) {
      goto('/subscribe');
      return;
    }
    
    if (userSubscription?.tier === 'basic' && tournament.subscriptionTier === 'premium') {
      goto('/upgrade');
      return;
    }
    
    navigateToTournament(tournament.id);
  }

  function navigateToSubscribe(): void {
    goto('/subscribe');
  }

  function navigateToLogin(): void {
    goto('/auth/login');
  }
</script>

<svelte:head>
  <title>Nationwide - ChezaNite</title>
</svelte:head>

<div class="nationwide-container">
  <!-- Header Section -->
  <header class="nationwide-header">
    <div class="header-content">
      <h1 class="main-title">Nationwide Games</h1>
      <p class="subtitle">Unlimited tournament access with subscription!</p>
      
      {#if !user}
        <div class="auth-cta">
          <p>Join thousands of players competing nationwide</p>
          <div class="auth-buttons">
            <button class="login-button" on:click={navigateToLogin}>
              Sign In
            </button>
            <button class="subscribe-button" on:click={navigateToSubscribe}>
              Get Started Free
            </button>
          </div>
        </div>
      {:else if !isSubscribed}
        <div class="subscription-cta">
          <p>Subscribe now to join all tournaments for FREE!</p>
          <button class="subscribe-button" on:click={navigateToSubscribe}>
            Get Subscription - KSH 299/month
          </button>
        </div>
      {:else}
        <div class="subscription-status">
          <div class="status-badge {userSubscription.tier}">
            {userSubscription.tier.toUpperCase()} SUBSCRIBER
          </div>
          <p>Welcome back! Enjoy unlimited tournament access.</p>
        </div>
      {/if}
    </div>
  </header>

  <!-- Subscription Benefits -->
  {#if !isSubscribed}
    <section class="benefits-section">
      <h2 class="section-title">Why Subscribe?</h2>
      <div class="benefits-grid">
        {#each subscriptionBenefits as benefit}
          <div class="benefit-card">
            <div class="benefit-icon">{benefit.icon}</div>
            <h3 class="benefit-title">{benefit.title}</h3>
            <p class="benefit-description">{benefit.description}</p>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Quick Actions Section -->
  <section class="quick-actions-section">
    <h2 class="section-title">Get Started</h2>
    <div class="actions-grid">
      <button type="button" class="action-card quick-play-card" on:click={navigateToQuickPlay} aria-label="Quick Play">
        <div class="action-icon">6A1</div>
        <h3 class="action-title">Quick Play</h3>
        <p class="action-description">Jump into an instant game against random opponents</p>
        <div class="action-features">
          <span class="feature-tag">Instant Match</span>
          <span class="feature-tag">{#if isSubscribed}Free{:else}Subscription{/if}</span>
          <span class="feature-tag">Quick Prizes</span>
        </div>
        <span class="action-button {isSubscribed ? 'primary' : 'secondary'}">
          {#if !user}
            Sign In to Play
          {:else if isSubscribed}
            Play Now
          {:else}
            Subscribe to Play
          {/if}
        </span>
      </button>

      <button type="button" class="action-card tournaments-card" on:click={navigateToTournaments} aria-label="Tournaments">
        <div class="action-icon">3C6</div>
        <h3 class="action-title">Tournaments</h3>
        <p class="action-description">Join scheduled tournaments with bigger prize pools</p>
        <div class="action-features">
          <span class="feature-tag">Scheduled</span>
          <span class="feature-tag">{#if isSubscribed}Free{:else}Subscription{/if}</span>
          <span class="feature-tag">Big Prizes</span>
        </div>
        <span class="action-button {isSubscribed ? 'primary' : 'secondary'}">
          {#if !user}
            Sign In to View
          {:else if isSubscribed}
            View Tournaments
          {:else}
            Subscribe to Join
          {/if}
        </span>
      </button>
    </div>
  </section>

  <!-- Featured Tournaments Section -->
  <section class="tournaments-section">
    <div class="section-header">
      <h2 class="section-title">Featured Tournaments</h2>
      <button class="view-all-button" on:click={navigateToTournaments}>
        View All
      </button>
    </div>

    <div class="tournaments-grid">
      {#each featuredTournaments as tournament}
        <div class="tournament-card">
          <div class="tournament-header">
            <h3 class="tournament-name">{tournament.name}</h3>
            <div class="tournament-prize">KSH {tournament.prizePool.toLocaleString()}</div>
          </div>
          
          <div class="tournament-description">
            {tournament.description}
          </div>
          
          <div class="tournament-details">
            <div class="detail-item">
              <span class="detail-label">Players:</span>
              <span class="detail-value">{tournament.players}/{tournament.maxPlayers}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Starts:</span>
              <span class="detail-value">{tournament.startTime}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Access:</span>
              <span class="detail-value subscription-tier {tournament.subscriptionTier}">
                {tournament.subscriptionTier.toUpperCase()} SUBSCRIBERS
              </span>
            </div>
          </div>

          <div class="tournament-actions">
            {#if !user}
              <button class="join-button signin-required" on:click={navigateToLogin}>
                Sign In to Join
              </button>
            {:else if !isSubscribed}
              <button class="join-button subscribe-required" on:click={() => handleJoinTournament(tournament)}>
                Subscribe to Join
              </button>
            {:else if userSubscription.tier === 'basic' && tournament.subscriptionTier === 'premium'}
              <button class="join-button upgrade-required" on:click={() => handleJoinTournament(tournament)}>
                Upgrade to Premium
              </button>
            {:else}
              <button class="join-button free" on:click={() => handleJoinTournament(tournament)}>
                Join Free
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Subscription Tiers Comparison -->
  {#if user && !isSubscribed}
    <section class="tiers-section">
      <h2 class="section-title">Choose Your Plan</h2>
      <div class="tiers-grid">
        <div class="tier-card basic">
          <div class="tier-header">
            <h3 class="tier-name">Basic</h3>
            <div class="tier-price">KSH 299<span class="period">/month</span></div>
          </div>
          <ul class="tier-features">
            <li>✅ Access to Basic tournaments</li>
            <li>✅ Unlimited Quick Play</li>
            <li>✅ Daily tournaments</li>
            <li>✅ Prize pools up to KSH 50,000</li>
            <li>❌ Premium tournaments</li>
            <li>❌ Early access</li>
          </ul>
          <button class="tier-button" on:click={navigateToSubscribe}>
            Subscribe Now
          </button>
        </div>

        <div class="tier-card premium featured">
          <div class="tier-badge">MOST POPULAR</div>
          <div class="tier-header">
            <h3 class="tier-name">Premium</h3>
            <div class="tier-price">KSH 599<span class="period">/month</span></div>
          </div>
          <ul class="tier-features">
            <li>✅ Access to ALL tournaments</li>
            <li>✅ Unlimited Quick Play</li>
            <li>✅ Daily & Weekly tournaments</li>
            <li>✅ Prize pools up to KSH 200,000</li>
            <li>✅ Early tournament access</li>
            <li>✅ Priority support</li>
          </ul>
          <button class="tier-button primary" on:click={navigateToSubscribe}>
            Go Premium
          </button>
        </div>
      </div>
    </section>
  {:else if !user}
    <section class="signup-section">
      <div class="signup-cta">
        <h2>Ready to Start Playing?</h2>
        <p>Join thousands of players competing for amazing prizes</p>
        <div class="cta-buttons">
          <button class="cta-button secondary" on:click={navigateToLogin}>
            Sign In
          </button>
          <button class="cta-button primary" on:click={navigateToSubscribe}>
            Start Free Trial
          </button>
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .nationwide-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
  }

  .nationwide-header {
    text-align: center;
    padding: 40px 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    margin-bottom: 40px;
    backdrop-filter: blur(10px);
  }

  .main-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #fff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 500px;
    margin: 0 auto;
  }

  .auth-cta {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    padding: 20px;
    margin-top: 20px;
  }

  .auth-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 15px;
    flex-wrap: wrap;
  }

  .login-button {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 12px 25px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .login-button:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .subscription-cta {
    background: rgba(255, 215, 0, 0.1);
    border: 2px solid #ffd700;
    border-radius: 15px;
    padding: 20px;
    margin-top: 20px;
    text-align: center;
  }

  .subscribe-button {
    background: #ffd700;
    color: #1a237e;
    border: none;
    padding: 12px 25px;
    border-radius: 25px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .subscribe-button:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .subscription-status {
    text-align: center;
    margin-top: 20px;
  }

  .status-badge {
    display: inline-block;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }

  .status-badge.basic {
    background: #4caf50;
    color: white;
  }

  .status-badge.premium {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 30px;
    text-align: center;
  }

  .benefits-section {
    margin-bottom: 60px;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .benefit-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 25px;
    text-align: center;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .benefit-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }

  .benefit-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .benefit-description {
    opacity: 0.8;
    line-height: 1.5;
  }

  .quick-actions-section {
    margin-bottom: 60px;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 800px;
    margin: 0 auto;
  }

  .action-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .action-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .action-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .action-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .action-description {
    opacity: 0.8;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .action-features {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 25px;
    flex-wrap: wrap;
  }

  .feature-tag {
    background: rgba(255, 255, 255, 0.2);
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .action-button {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-button.primary {
    background: #ffd700;
    color: #1a237e;
  }

  .action-button.primary:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .action-button.secondary {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .action-button.secondary:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .tournaments-section {
    margin-bottom: 60px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }

  .view-all-button {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
  }

  .view-all-button:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .tournament-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 25px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .tournament-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    flex: 1;
    margin-right: 15px;
  }

  .tournament-prize {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .tournament-description {
    opacity: 0.8;
    margin-bottom: 15px;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .tournament-details {
    margin-bottom: 20px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .detail-label {
    opacity: 0.7;
    font-size: 0.9rem;
  }

  .detail-value {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .subscription-tier {
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .subscription-tier.basic {
    background: #4caf50;
    color: white;
  }

  .subscription-tier.premium {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
  }

  .tournament-actions {
    text-align: center;
  }

  .join-button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .join-button.free {
    background: #4caf50;
    color: white;
  }

  .join-button.free:hover {
    background: #45a049;
  }

  .join-button.signin-required {
    background: #2196f3;
    color: white;
  }

  .join-button.signin-required:hover {
    background: #1976d2;
  }

  .join-button.subscribe-required {
    background: #ff6b6b;
    color: white;
  }

  .join-button.subscribe-required:hover {
    background: #ff5252;
  }

  .join-button.upgrade-required {
    background: #ffa726;
    color: white;
  }

  .join-button.upgrade-required:hover {
    background: #ff9800;
  }

  .tiers-section {
    margin-bottom: 60px;
  }

  .tiers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 800px;
    margin: 0 auto;
  }

  .tier-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    position: relative;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .tier-card.featured {
    border: 2px solid #ffd700;
    transform: scale(1.05);
  }

  .tier-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffd700;
    color: #1a237e;
    padding: 5px 15px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .tier-header {
    text-align: center;
    margin-bottom: 25px;
  }

  .tier-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .tier-price {
    font-size: 2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .period {
    font-size: 1rem;
    opacity: 0.8;
  }

  .tier-features {
    list-style: none;
    padding: 0;
    margin-bottom: 25px;
  }

  .tier-features li {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tier-features li:last-child {
    border-bottom: none;
  }

  .tier-button {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .tier-button.primary {
    background: #ffd700;
    color: #1a237e;
  }

  .tier-button:hover {
    transform: translateY(-2px);
  }

  .signup-section {
    margin-bottom: 60px;
  }

  .signup-cta {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .signup-cta h2 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .signup-cta p {
    opacity: 0.8;
    margin-bottom: 25px;
  }

  .cta-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-button {
    padding: 12px 25px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cta-button.primary {
    background: #ffd700;
    color: #1a237e;
  }

  .cta-button.primary:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .cta-button.secondary {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .cta-button.secondary:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    .main-title {
      font-size: 2.5rem;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .tournaments-grid {
      grid-template-columns: 1fr;
    }

    .tiers-grid {
      grid-template-columns: 1fr;
    }

    .tier-card.featured {
      transform: none;
    }

    .section-header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .tournament-header {
      flex-direction: column;
      gap: 10px;
    }

    .tournament-name {
      margin-right: 0;
      text-align: center;
    }

    .auth-buttons {
      flex-direction: column;
      align-items: center;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
  }
</style>