<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let tournament: any = null;
  let isLoading = true;
  let isRegistering = false;
  let registrationSuccess = false;
  let user: any = null;
  let isSubscribed = false;

  // Mock user data
  const currentUser = {
    id: 'user-123',
    username: 'GamePlayer',
    avatar: '😎',
    level: 15,
    tournamentsPlayed: 23,
    averageRank: 8.5
  };

  onMount(() => {
    if (!browser) return;
    
    // Mock user subscription status
    user = { subscription: { status: 'active' } };
    isSubscribed = user?.subscription?.status === 'active';
    
    loadTournamentData();
  });

  function loadTournamentData(): void {
    const tournamentId = $page.params.id;
    
    // Mock tournament data based on ID
    tournament = {
      id: tournamentId,
      name: 'Mega Monday Championship',
      theme: {
        name: 'General Knowledge',
        category: 'general',
        color: '#4f46e5',
        icon: '🌍',
        description: 'Test your knowledge across all categories including history, science, geography, and pop culture.'
      },
      schedule: {
        date: '2024-01-15',
        day: 'Monday',
        time: '19:00',
        duration: '45 mins',
        timeUntilStart: '2 days 3 hours 45 minutes'
      },
      details: {
        prizePool: 2500,
        maxPlayers: 100,
        registeredPlayers: 67,
        entryFee: 0,
        questions: 20,
        timePerQuestion: 20,
        difficulty: 'Mixed'
      },
      rules: [
        '20 questions across various categories',
        '20 seconds per question',
        'Points based on speed and accuracy',
        'Tie-breaker: fastest average answer time',
        'Top 5 players win prizes'
      ],
      prizeDistribution: [
        { rank: 1, amount: 750, percentage: '30%' },
        { rank: 2, amount: 500, percentage: '20%' },
        { rank: 3, amount: 375, percentage: '15%' },
        { rank: 4, amount: 250, percentage: '10%' },
        { rank: 5, amount: 200, percentage: '8%' }
      ]
    };

    isLoading = false;
  }

  async function registerForTournament(): Promise<void> {
    if (!isSubscribed) {
      goto('/subscribe');
      return;
    }

    isRegistering = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful registration
    registrationSuccess = true;
    isRegistering = false;

    // Redirect to lobby after 2 seconds
    setTimeout(() => {
      goto(`/nationwide/tournaments/${tournament.id}/lobby`);
    }, 2000);
  }

  function calculateProgress(): number {
    return (tournament.details.registeredPlayers / tournament.details.maxPlayers) * 100;
  }

  function getRemainingSpots(): number {
    return tournament.details.maxPlayers - tournament.details.registeredPlayers;
  }

  function isTournamentFull(): boolean {
    return tournament.details.registeredPlayers >= tournament.details.maxPlayers;
  }

  function formatCountdown(timeStr: string): string {
    return timeStr; // In real app, you'd parse and format this
  }
</script>

<svelte:head>
  <title>Register for {tournament?.name} - ChezaNite</title>
</svelte:head>

<div class="registration-container">
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading tournament details...</p>
    </div>

  {:else if registrationSuccess}
    <div class="success-state">
      <div class="success-animation">
        <div class="success-icon">🎉</div>
        <div class="confetti"></div>
      </div>
      <h1>Registration Successful!</h1>
      <p>You're all set for the <strong>{tournament.name}</strong></p>
      <div class="success-details">
        <div class="detail-item">
          <span class="label">Tournament Date:</span>
          <span class="value">{tournament.schedule.day}, {tournament.schedule.date} at {tournament.schedule.time}</span>
        </div>
        <div class="detail-item">
          <span class="label">Your Spot:</span>
          <span class="value">#{tournament.details.registeredPlayers + 1} of {tournament.details.maxPlayers}</span>
        </div>
      </div>
      <p class="redirect-message">Redirecting to tournament lobby...</p>
    </div>

  {:else}
    <!-- Header Section -->
    <div class="registration-header">
      <div class="header-content">
        <button class="back-button" on:click={() => goto('/nationwide/tournaments')}>
          ← Back to Tournaments
        </button>
        <div class="tournament-title">
          <h1>{tournament.name}</h1>
          <div class="theme-badge" style="background: {tournament.theme.color}">
            <span class="theme-icon">{tournament.theme.icon}</span>
            <span class="theme-name">{tournament.theme.name}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="registration-content">
      <div class="registration-grid">
        <!-- Left Column: Tournament Details -->
        <div class="details-column">
          <!-- Tournament Info Card -->
          <div class="info-card">
            <h3>📋 Tournament Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Date & Time</span>
                <span class="info-value">{tournament.schedule.day}, {tournament.schedule.date} at {tournament.schedule.time}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Duration</span>
                <span class="info-value">{tournament.schedule.duration}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Questions</span>
                <span class="info-value">{tournament.details.questions} questions</span>
              </div>
              <div class="info-item">
                <span class="info-label">Time per Question</span>
                <span class="info-value">{tournament.details.timePerQuestion} seconds</span>
              </div>
              <div class="info-item">
                <span class="info-label">Difficulty</span>
                <span class="info-value">{tournament.details.difficulty}</span>
              </div>
            </div>
          </div>

          <!-- Rules Card -->
          <div class="rules-card">
            <h3>📜 Tournament Rules</h3>
            <ul class="rules-list">
              {#each tournament.rules as rule}
                <li>{rule}</li>
              {/each}
            </ul>
          </div>

          <!-- Prize Distribution Card -->
          <div class="prizes-card">
            <h3>💰 Prize Distribution</h3>
            <div class="prize-pool">
              <span class="pool-label">Total Prize Pool:</span>
              <span class="pool-amount">KSH {tournament.details.prizePool.toLocaleString()}</span>
            </div>
            <div class="prize-list">
              {#each tournament.prizeDistribution as prize}
                <div class="prize-item">
                  <span class="prize-rank">{prize.rank}{#if prize.rank === 1}st
                    {:else if prize.rank === 2}nd
                    {:else if prize.rank === 3}rd
                    {:else}th{/if} Place</span>
                  <span class="prize-amount">KSH {prize.amount.toLocaleString()}</span>
                  <span class="prize-percentage">({prize.percentage})</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Right Column: Registration -->
        <div class="registration-column">
          <!-- Registration Card -->
          <div class="registration-card">
            <div class="card-header">
              <h2>Register for Tournament</h2>
              <div class="countdown-timer">
                <span class="timer-icon">⏰</span>
                Starts in {formatCountdown(tournament.schedule.timeUntilStart)}
              </div>
            </div>

            <!-- Progress Section -->
            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">Registration Progress</span>
                <span class="progress-count">{tournament.details.registeredPlayers}/{tournament.details.maxPlayers}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: {calculateProgress()}%"></div>
              </div>
              <div class="progress-text">
                {#if isTournamentFull()}
                  <span class="full-warning">❌ Tournament Full - Join Waitlist</span>
                {:else}
                  <span class="spots-remaining">{getRemainingSpots()} spots remaining</span>
                  {#if calculateProgress() > 80}
                    <span class="almost-full"> • Almost Full!</span>
                  {/if}
                {/if}
              </div>
            </div>

            <!-- User Info Section -->
            <div class="user-info-section">
              <h3>Your Registration Details</h3>
              <div class="user-details">
                <div class="user-avatar">{currentUser.avatar}</div>
                <div class="user-stats">
                  <div class="user-name">{currentUser.username}</div>
                  <div class="user-meta">
                    <span class="meta-item">Level {currentUser.level}</span>
                    <span class="meta-item">{currentUser.tournamentsPlayed} tournaments</span>
                    <span class="meta-item">Avg. Rank: {currentUser.averageRank}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subscription Status -->
            <div class="subscription-status {isSubscribed ? 'subscribed' : 'not-subscribed'}">
              <div class="status-icon">
                {#if isSubscribed}✅{:else}❌{/if}
              </div>
              <div class="status-content">
                <div class="status-title">
                  {#if isSubscribed}
                    Premium Subscription Active
                  {:else}
                    Subscription Required
                  {/if}
                </div>
                <div class="status-description">
                  {#if isSubscribed}
                    You have unlimited access to all tournaments
                  {:else}
                    Subscribe to join tournaments for FREE
                  {/if}
                </div>
              </div>
            </div>

            <!-- Cost Summary -->
            <div class="cost-summary">
              <div class="cost-item">
                <span class="cost-label">Tournament Entry Fee</span>
                <span class="cost-value {tournament.details.entryFee === 0 ? 'free' : ''}">
                  {#if tournament.details.entryFee === 0}
                    FREE
                  {:else}
                    KSH {tournament.details.entryFee}
                  {/if}
                </span>
              </div>
              <div class="cost-item total">
                <span class="cost-label">Total Cost</span>
                <span class="cost-value {tournament.details.entryFee === 0 ? 'free' : ''}">
                  {#if tournament.details.entryFee === 0}
                    FREE
                  {:else}
                    KSH {tournament.details.entryFee}
                  {/if}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              {#if isTournamentFull()}
                <button class="register-btn waitlist" disabled={isRegistering}>
                  {#if isRegistering}
                    <div class="button-spinner"></div>
                    Joining Waitlist...
                  {:else}
                    Join Waitlist
                  {/if}
                </button>
                <p class="waitlist-info">
                  You'll be notified if a spot becomes available
                </p>
              {:else}
                <button 
                  class="register-btn {isSubscribed ? 'primary' : 'secondary'}"
                  on:click={registerForTournament}
                  disabled={isRegistering || !isSubscribed}
                >
                  {#if isRegistering}
                    <div class="button-spinner"></div>
                    Registering...
                  {:else if isSubscribed}
                    Confirm Registration
                  {:else}
                    Subscribe to Register
                  {/if}
                </button>
              {/if}

              <button class="cancel-btn" on:click={() => goto('/nationwide/tournaments')}>
                Cancel
              </button>
            </div>

            <!-- Important Notes -->
            <div class="important-notes">
              <h4>📝 Important Notes</h4>
              <ul>
                <li>Join the tournament lobby 15 minutes before start time</li>
                <li>Late entries may not be accepted once tournament begins</li>
                <li>Stable internet connection required</li>
                <li>Prizes are distributed within 24 hours after tournament completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .registration-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    color: white;
    padding: 0;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
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

  /* Success State */
  .success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
    padding: 40px;
  }

  .success-animation {
    position: relative;
    margin-bottom: 30px;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .confetti {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.5rem;
    animation: confetti-fall 2s ease-in-out;
  }

  .success-details {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
    backdrop-filter: blur(10px);
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .detail-item:last-child {
    margin-bottom: 0;
  }

  .label {
    opacity: 0.8;
  }

  .value {
    font-weight: 600;
    color: #ffd700;
  }

  .redirect-message {
    opacity: 0.8;
    margin-top: 20px;
  }

  /* Header */
  .registration-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .back-button {
    background: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .tournament-title {
    flex: 1;
  }

  .tournament-title h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* Main Content */
  .registration-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .registration-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 30px;
  }

  /* Left Column Styles */
  .details-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .info-card, .rules-card, .prizes-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .info-card h3, .rules-card h3, .prizes-card h3 {
    margin-bottom: 20px;
    color: #ffd700;
    font-size: 1.2rem;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .info-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .info-label {
    opacity: 0.8;
  }

  .info-value {
    font-weight: 600;
  }

  .rules-list {
    list-style: none;
    padding: 0;
  }

  .rules-list li {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    padding-left: 20px;
  }

  .rules-list li:before {
    content: '•';
    color: #ffd700;
    position: absolute;
    left: 0;
  }

  .rules-list li:last-child {
    border-bottom: none;
  }

  .prize-pool {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .pool-label {
    opacity: 0.8;
  }

  .pool-amount {
    font-size: 1.3rem;
    font-weight: 700;
    color: #ffd700;
  }

  .prize-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .prize-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }

  .prize-rank {
    font-weight: 600;
  }

  .prize-amount {
    color: #ffd700;
    font-weight: 600;
  }

  .prize-percentage {
    opacity: 0.7;
    font-size: 0.9rem;
  }

  /* Right Column Styles */
  .registration-column {
    position: sticky;
    top: 20px;
    height: fit-content;
  }

  .registration-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }

  .card-header h2 {
    margin: 0;
    color: #ffd700;
  }

  .countdown-timer {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .timer-icon {
    margin-right: 5px;
  }

  /* Progress Section */
  .progress-section {
    margin-bottom: 25px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .progress-label {
    opacity: 0.8;
  }

  .progress-count {
    font-weight: 600;
    color: #ffd700;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffd700, #ffed4a);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.9rem;
  }

  .spots-remaining {
    color: #4caf50;
  }

  .almost-full {
    color: #ff9800;
  }

  .full-warning {
    color: #f44336;
  }

  /* User Info */
  .user-info-section {
    margin-bottom: 20px;
  }

  .user-info-section h3 {
    margin-bottom: 15px;
    font-size: 1.1rem;
  }

  .user-details {
    display: flex;
    align-items: center;
    gap: 15px;
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 10px;
  }

  .user-avatar {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .user-stats {
    flex: 1;
  }

  .user-name {
    font-weight: 600;
    margin-bottom: 5px;
  }

  .user-meta {
    display: flex;
    gap: 10px;
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .meta-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
  }

  /* Subscription Status */
  .subscription-status {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
  }

  .subscription-status.subscribed {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid #4caf50;
  }

  .subscription-status.not-subscribed {
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid #f44336;
  }

  .status-icon {
    font-size: 1.5rem;
  }

  .status-title {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .status-description {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  /* Cost Summary */
  .cost-summary {
    margin-bottom: 25px;
  }

  .cost-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .cost-item.total {
    border-bottom: none;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    margin-top: 5px;
    padding-top: 15px;
    font-weight: 600;
  }

  .cost-value.free {
    color: #4caf50;
    font-weight: 700;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 25px;
  }

  .register-btn {
    padding: 15px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .register-btn.primary {
    background: #ffd700;
    color: #1a237e;
  }

  .register-btn.primary:hover:not(:disabled) {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .register-btn.secondary {
    background: #f44336;
    color: white;
  }

  .register-btn.waitlist {
    background: #6b7280;
    color: white;
  }

  .register-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .button-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .cancel-btn {
    background: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .waitlist-info {
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
  }

  /* Important Notes */
  .important-notes h4 {
    margin-bottom: 15px;
    color: #ffd700;
  }

  .important-notes ul {
    list-style: none;
    padding: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .important-notes li {
    padding: 5px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    padding-left: 20px;
  }

  .important-notes li:before {
    content: '•';
    color: #ffd700;
    position: absolute;
    left: 0;
  }

  .important-notes li:last-child {
    border-bottom: none;
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes confetti-fall {
    0% { transform: translateX(-50%) translateY(-20px) rotate(0deg); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(-50%) translateY(100px) rotate(360deg); opacity: 0; }
  }

  /* Responsive Design */
  @media (max-width: 968px) {
    .registration-grid {
      grid-template-columns: 1fr;
    }

    .registration-column {
      position: static;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .tournament-title h1 {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .registration-content {
      padding: 20px 15px;
    }

    .info-card, .rules-card, .prizes-card, .registration-card {
      padding: 20px;
    }

    .user-meta {
      flex-direction: column;
      gap: 5px;
    }
  }
</style>