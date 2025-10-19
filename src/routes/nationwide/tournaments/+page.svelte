<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';

  let user = null;
  let loading = true;
  let tournaments = [];
  let categories = [];
  let userParticipations = [];

  // TEST MODE: Changed start date to current time for immediate testing
  const firstTournament = {
    name: "Friday Game Night Mega Tournament",
    description: "Kick off ChezaNite with our first mega tournament featuring multiple categories!",
    startDate: new Date(), // CHANGED: Set to current time for testing
    duration: 60,
    prizePool: 15000,
    entryFee: 0,
    maxPlayers: 200,
    isPremium: false,
    categories: ['General Knowledge', 'Kenyan History', 'Pop Culture', 'Geography', 'Science & Technology'],
    segments: [
      { category: 'General Knowledge', questions: 5, timePerQuestion: 25 },
      { category: 'Kenyan History', questions: 5, timePerQuestion: 30 },
      { category: 'Pop Culture', questions: 5, timePerQuestion: 20 },
      { category: 'Geography', questions: 5, timePerQuestion: 25 },
      { category: 'Science & Technology', questions: 5, timePerQuestion: 30 }
    ]
  };

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
    
    if (user) {
      await loadTournaments();
      await loadUserParticipations();
    }
    
    loading = false;
  });

  async function loadTournaments() {
    tournaments = [
      {
        id: '1',
        name: firstTournament.name,
        description: firstTournament.description,
        start_date: firstTournament.startDate.toISOString(),
        duration_minutes: firstTournament.duration,
        prize_pool: firstTournament.prizePool,
        entry_fee: firstTournament.entryFee,
        max_players: firstTournament.maxPlayers,
        status: 'upcoming',
        is_premium: firstTournament.isPremium,
        categories: firstTournament.categories,
        current_participants: 45,
        segments: firstTournament.segments
      },
      {
        id: '2',
        name: "Midweek Knowledge Challenge",
        description: "Test your general knowledge across various topics",
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration_minutes: 45,
        prize_pool: 8000,
        entry_fee: 0,
        max_players: 150,
        status: 'upcoming',
        is_premium: true,
        categories: ['General Knowledge', 'Science & Technology', 'Geography'],
        current_participants: 23
      }
    ];
  }

  async function loadUserParticipations() {
    userParticipations = []; // Start with empty for testing
  }

  function joinTournament(tournamentId) {
    if (!user) {
      goto('/auth');
      return;
    }
    
    userParticipations.push(tournamentId);
    
    // FIXED: Use the correct route path - tournaments/[id] (plural)
    setTimeout(() => {
      goto('/tournaments/' + tournamentId);
    }, 1000);
    
    // Show confirmation
    alert('Successfully joined the tournament! Redirecting to gameplay...');
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getTimeUntil(startDate) {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start - now;
    
    if (diff <= 0) return 'Starting now!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    return `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  function hasUserJoined(tournamentId) {
    return userParticipations.includes(tournamentId);
  }

  function canJoin(tournament) {
    return user && 
           !hasUserJoined(tournament.id) && 
           tournament.status === 'upcoming' &&
           tournament.current_participants < tournament.max_players;
  }

  // Test function to immediately start tournament
  function startTestTournament() {
    goto('/tournaments/1');
  }
</script>

<svelte:head>
  <title>Tournaments - ChezaNite</title>
</svelte:head>

<div class="tournaments-container">
  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading Tournaments...</p>
    </div>
  {:else}
    <div class="tournaments-header">
      <h1>Featured Tournaments</h1>
      <p>Join scheduled events with players across Kenya</p>
      
      <!-- Test Notice Banner -->
      <div class="test-notice">
        🧪 TEST MODE: Tournament dates modified for immediate testing
      </div>
    </div>

    <div class="tournaments-grid">
      {#each tournaments as tournament}
        <div class="tournament-card {tournament.is_premium ? 'premium' : ''}">
          <div class="tournament-header">
            <h3>{tournament.name}</h3>
            {#if tournament.is_premium}
              <span class="premium-badge">Premium</span>
            {/if}
          </div>

          <p class="tournament-description">{tournament.description}</p>

          <div class="tournament-details">
            <div class="detail-item">
              <span class="icon">🕐</span>
              <span>{formatDate(tournament.start_date)}</span>
            </div>
            <div class="detail-item">
              <span class="icon">⏱️</span>
              <span>{tournament.duration_minutes} mins</span>
            </div>
            <div class="detail-item">
              <span class="icon">👥</span>
              <span>{tournament.current_participants} players joined</span>
            </div>
            <div class="detail-item">
              <span class="icon">💰</span>
              <span>Prize: KSH {tournament.prize_pool.toLocaleString()}</span>
            </div>
          </div>

          {#if tournament.segments}
            <div class="segments-section">
              <h4>Tournament Segments:</h4>
              <div class="segments-grid">
                {#each tournament.segments as segment}
                  <div class="segment-tag">
                    <span class="segment-category">{segment.category}</span>
                    <span class="segment-info">{segment.questions} Qs, {segment.timePerQuestion}s each</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <div class="tournament-status">
            <span class="time-until">{getTimeUntil(tournament.start_date)}</span>
            <span class="player-count">{tournament.current_participants}/{tournament.max_players}</span>
          </div>

          <div class="tournament-actions">
            {#if hasUserJoined(tournament.id)}
              <button class="joined-button" on:click={() => goto('/tournaments/' + tournament.id)}>
                ✓ Enter Tournament
              </button>
            {:else if canJoin(tournament)}
              <button class="join-button" on:click={() => joinTournament(tournament.id)}>
                Join Tournament
              </button>
            {:else if !user}
              <button class="login-button" on:click={() => goto('/auth')}>
                Login to Join
              </button>
            {:else if tournament.current_participants >= tournament.max_players}
              <button class="full-button" disabled>
                Tournament Full
              </button>
            {:else}
              <button class="upcoming-button" disabled>
                Coming Soon
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Developer Testing Section -->
    {#if user}
      <div class="dev-test-section">
        <h3>🧪 Developer Testing Panel</h3>
        <p>Quick access for testing tournament gameplay</p>
        <div class="test-buttons">
          <button class="test-button primary" on:click={startTestTournament}>
            🚀 Start Tournament Now
          </button>
          <button class="test-button" on:click={() => goto('/quick-play')}>
            🎯 Test Quick Play
          </button>
          <button class="test-button" on:click={() => goto('/')}>
            🏠 Back to Home
          </button>
        </div>
      </div>
    {/if}

    <!-- Upcoming Tournaments Section -->
    <div class="upcoming-section">
      <h2>Coming Soon</h2>
      <div class="upcoming-list">
        <div class="upcoming-item">
          <h4>Sports Trivia Showdown</h4>
          <p>Test your sports knowledge</p>
          <span class="coming-soon">COMING SOON</span>
        </div>
        <div class="upcoming-item">
          <h4>Music & Entertainment Quiz</h4>
          <p>Latest hits and entertainment news</p>
          <span class="coming-soon">UPCOMING</span>
        </div>
        <div class="upcoming-item">
          <h4>Kenyan History Challenge</h4>
          <p>Deep dive into Kenyan heritage</p>
          <span class="coming-soon">SEARCH</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .tournaments-container {
    min-height: calc(100vh - 70px);
    background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    color: white;
    padding: 20px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .tournaments-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .tournaments-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .tournaments-header p {
    opacity: 0.8;
    font-size: 1.1rem;
    margin-bottom: 15px;
  }

  .test-notice {
    background: #ffd700;
    color: #1a237e;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    display: inline-block;
    margin-top: 10px;
  }

  .tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 30px;
    margin-bottom: 50px;
  }

  .tournament-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .tournament-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  }

  .tournament-card.premium {
    border-color: #ffd700;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
  }

  .tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .tournament-header h3 {
    font-size: 1.4rem;
    margin-right: 15px;
    flex: 1;
  }

  .premium-badge {
    background: #ffd700;
    color: #1a237e;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .tournament-description {
    opacity: 0.9;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .tournament-details {
    margin-bottom: 20px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .detail-item .icon {
    margin-right: 10px;
    width: 20px;
    text-align: center;
  }

  .segments-section {
    margin-bottom: 20px;
  }

  .segments-section h4 {
    margin-bottom: 10px;
    color: #ffd700;
    font-size: 1rem;
  }

  .segments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  .segment-tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 12px;
    border-radius: 10px;
    text-align: center;
  }

  .segment-category {
    display: block;
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 2px;
  }

  .segment-info {
    display: block;
    font-size: 0.7rem;
    opacity: 0.8;
  }

  .tournament-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .time-until {
    color: #ffd700;
    font-weight: 600;
  }

  .player-count {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .tournament-actions {
    display: flex;
    gap: 10px;
  }

  .join-button, .joined-button, .login-button, .full-button, .upcoming-button {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .join-button {
    background: #ffd700;
    color: #1a237e;
  }

  .join-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
  }

  .joined-button {
    background: #4caf50;
    color: white;
  }

  .joined-button:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  .login-button {
    background: #2196f3;
    color: white;
  }

  .login-button:hover {
    background: #1976d2;
  }

  .full-button, .upcoming-button {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.6);
    cursor: not-allowed;
  }

  /* Developer Testing Section */
  .dev-test-section {
    background: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    margin: 40px 0;
    border: 2px dashed #ffd700;
  }

  .dev-test-section h3 {
    color: #ffd700;
    margin-bottom: 10px;
    font-size: 1.5rem;
  }

  .dev-test-section p {
    opacity: 0.8;
    margin-bottom: 20px;
  }

  .test-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .test-button {
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .test-button.primary {
    background: #ff6b6b;
    color: white;
  }

  .test-button {
    background: #ffd700;
    color: #1a237e;
  }

  .test-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }

  /* Upcoming Section */
  .upcoming-section {
    margin-top: 50px;
  }

  .upcoming-section h2 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 2rem;
    color: #ffd700;
  }

  .upcoming-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .upcoming-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .upcoming-item h4 {
    margin-bottom: 10px;
    font-size: 1.2rem;
  }

  .upcoming-item p {
    opacity: 0.8;
    margin-bottom: 15px;
    font-size: 0.9rem;
  }

  .coming-soon {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
    padding: 5px 15px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .tournaments-grid {
      grid-template-columns: 1fr;
    }

    .tournament-card {
      padding: 20px;
    }

    .segments-grid {
      grid-template-columns: 1fr;
    }

    .upcoming-list {
      grid-template-columns: 1fr;
    }

    .test-buttons {
      flex-direction: column;
    }

    .test-button {
      width: 100%;
    }
  }
</style>