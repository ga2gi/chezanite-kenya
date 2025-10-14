<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user = null;
  let isLoading = true;
  let quickPlayStats = null;
  let onlinePlayers = 0;
  let recentTopPlayers = [];
  let isStartingGame = false;

  // Quick play configuration
  const quickPlayConfig = {
    questions: 10,
    timePerQuestion: 20,
    totalPoints: 500,
    category: "General Knowledge"
  };

  onMount(async () => {
    await checkAuth();
    loadQuickPlayStats();
    loadOnlinePlayers();
    loadRecentTopPlayers();
  });

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
    isLoading = false;
  }

  function loadQuickPlayStats() {
    // TODO: Fetch from Supabase
    quickPlayStats = {
      rank: "Bronze",
      points: 450,
      gamesPlayed: 15,
      winStreak: 3,
      bestScore: 480,
      averageTime: 15.2
    };
  }

  function loadOnlinePlayers() {
    // TODO: Fetch real-time online players count
    onlinePlayers = Math.floor(Math.random() * 100) + 50;
    
    // Update every 30 seconds for demo
    setInterval(() => {
      onlinePlayers = Math.floor(Math.random() * 100) + 50;
    }, 30000);
  }

  function loadRecentTopPlayers() {
    // TODO: Fetch from Supabase
    recentTopPlayers = [
      { rank: 1, name: "Sarah_K", score: 480, isPremium: true },
      { rank: 2, name: "MikeJ", score: 465, isPremium: false },
      { rank: 3, name: "Tasha_KE", score: 450, isPremium: true },
      { rank: 4, name: "Jamal", score: 445, isPremium: false },
      { rank: 5, name: "Grace_W", score: 440, isPremium: true }
    ];
  }

  async function startQuickPlay() {
    if (!user) {
      goto('/auth/signin');
      return;
    }

    // Show loading state
    isStartingGame = true;

    try {
      // Simulate matchmaking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a unique session ID for this game
      const sessionId = generateSessionId();
      
      // Navigate to game session with quick play parameters
      goto(`/game?type=quickplay&session=${sessionId}`);
      
    } catch (error) {
      console.error('Error starting quick play:', error);
      alert('Failed to start quick play. Please try again.');
    } finally {
      isStartingGame = false;
    }
  }

  function generateSessionId() {
    return 'qp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function viewLeaderboard() {
    goto('/leaderboard');
  }

  function viewNationwide() {
    goto('/nationwide');
  }

  function viewGameHistory() {
    // TODO: Implement game history page
    alert('Game history coming soon!');
  }
</script>

<div class="quick-play-page">
  <div class="container">
    
    <!-- Header -->
    <section class="header-section">
      <div class="header-nav">
        <button class="back-button" on:click={viewNationwide}>← Back</button>
        <h1 class="page-title">Quick Play</h1>
        <div class="header-actions">
          <button class="history-btn" on:click={viewGameHistory}>History</button>
        </div>
      </div>
      <p class="page-subtitle">Jump in and play instantly with players across Kenya</p>
    </section>

    <!-- Quick Play Card -->
    <section class="game-section">
      <div class="game-card">
        <div class="game-header">
          <div class="game-icon">⚡</div>
          <div class="game-info">
            <h2>Quick Play Challenge</h2>
            <p class="game-description">
              {quickPlayConfig.questions} questions, {quickPlayConfig.timePerQuestion} seconds each.<br>
              Fast-paced trivia fun!
            </p>
          </div>
        </div>

        <!-- Game Stats -->
        <div class="game-stats">
          <div class="stat-item">
            <div class="stat-value">{quickPlayConfig.questions}</div>
            <div class="stat-label">Questions</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{quickPlayConfig.timePerQuestion}s</div>
            <div class="stat-label">Each</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{quickPlayConfig.totalPoints}</div>
            <div class="stat-label">Points</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{quickPlayConfig.category}</div>
            <div class="stat-label">Category</div>
          </div>
        </div>

        <!-- Online Players -->
        <div class="online-indicator">
          <span class="online-dot">🔥</span>
          <span class="online-text">{onlinePlayers} players online now</span>
        </div>

        <!-- Play Button -->
        <button 
          class="play-button {isStartingGame ? 'loading' : ''}" 
          on:click={startQuickPlay}
          disabled={isStartingGame}
        >
          {#if isStartingGame}
            <span class="loading-spinner">⏳</span>
            Finding opponents...
          {:else}
            🎮 PLAY NOW
          {/if}
        </button>

        <p class="game-note">
          Compete in real-time • Free to play • Instant matchmaking
        </p>
      </div>
    </section>

    <!-- User Stats (if logged in) -->
    {#if user && quickPlayStats}
      <section class="user-stats-section">
        <h3>Your Quick Play Stats</h3>
        <div class="user-stats-grid">
          <div class="user-stat-card">
            <div class="user-stat-value">{quickPlayStats.rank}</div>
            <div class="user-stat-label">Current Rank</div>
          </div>
          <div class="user-stat-card">
            <div class="user-stat-value">{quickPlayStats.points}</div>
            <div class="user-stat-label">Total Points</div>
          </div>
          <div class="user-stat-card">
            <div class="user-stat-value">{quickPlayStats.winStreak}</div>
            <div class="user-stat-label">Win Streak</div>
          </div>
          <div class="user-stat-card">
            <div class="user-stat-value">{quickPlayStats.bestScore}</div>
            <div class="user-stat-label">Best Score</div>
          </div>
        </div>
      </section>
    {:else if user}
      <div class="guest-message">
        <p>Play your first Quick Play game to unlock stats!</p>
      </div>
    {/if}

    <!-- Recent Top Players -->
    <section class="leaderboard-section">
      <div class="section-header">
        <h3>Today's Top Players</h3>
        <button class="view-all-btn" on:click={viewLeaderboard}>View All</button>
      </div>
      
      <div class="players-list">
        {#each recentTopPlayers as player}
          <div class="player-row">
            <div class="player-rank">#{player.rank}</div>
            <div class="player-info">
              <span class="player-name">
                {player.name}
                {#if player.isPremium}
                  <span class="premium-badge">⭐</span>
                {/if}
              </span>
            </div>
            <div class="player-score">{player.score} pts</div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Quick Tips -->
    <section class="tips-section">
      <h3>Quick Tips</h3>
      <div class="tips-grid">
        <div class="tip-item">
          <div class="tip-icon">📶</div>
          <div class="tip-content">
            <strong>Stable Connection</strong>
            <p>Find a quiet spot with good internet</p>
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">⚡</div>
          <div class="tip-content">
            <strong>Quick Thinking</strong>
            <p>Trust your first instinct on answers</p>
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">😊</div>
          <div class="tip-content">
            <strong>Have Fun</strong>
            <p>It's a game after all - enjoy!</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</div>

<style>
  .quick-play-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 1rem 0;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* Header Section */
  .header-section {
    margin-bottom: 2rem;
  }

  .header-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .back-button {
    background: white;
    border: 2px solid #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .history-btn {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .history-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .page-subtitle {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0;
    text-align: center;
  }

  /* Game Section */
  .game-section {
    margin-bottom: 3rem;
  }

  .game-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    border: 2px solid #e2e8f0;
    text-align: center;
  }

  .game-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .game-icon {
    font-size: 4rem;
  }

  .game-info h2 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    color: #1e293b;
  }

  .game-description {
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  .game-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-item {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .online-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f0fdf4;
    border-radius: 50px;
    border: 1px solid #bbf7d0;
  }

  .online-dot {
    font-size: 1.2rem;
  }

  .online-text {
    color: #065f46;
    font-weight: 600;
  }

  .play-button {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    border: none;
    padding: 1.5rem 3rem;
    border-radius: 50px;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-bottom: 1rem;
  }

  .play-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  .play-button.loading {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .game-note {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0;
  }

  /* User Stats Section */
  .user-stats-section {
    margin-bottom: 3rem;
  }

  .user-stats-section h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #1e293b;
    text-align: center;
  }

  .user-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .user-stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .user-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.5rem;
  }

  .user-stat-label {
    color: #64748b;
    font-size: 0.9rem;
  }

  .guest-message {
    text-align: center;
    color: #64748b;
    font-style: italic;
    margin-bottom: 2rem;
  }

  /* Leaderboard Section */
  .leaderboard-section {
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h3 {
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0;
  }

  .view-all-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .view-all-btn:hover {
    background: #2563eb;
  }

  .players-list {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .player-row {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.3s;
  }

  .player-row:hover {
    background: #f8fafc;
  }

  .player-row:last-child {
    border-bottom: none;
  }

  .player-rank {
    font-weight: 700;
    color: #3b82f6;
    min-width: 40px;
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    font-weight: 600;
    color: #1e293b;
  }

  .premium-badge {
    margin-left: 0.25rem;
    font-size: 0.8rem;
  }

  .player-score {
    font-weight: 700;
    color: #059669;
  }

  /* Tips Section */
  .tips-section h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #1e293b;
    text-align: center;
  }

  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .tip-item {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: start;
    gap: 1rem;
  }

  .tip-icon {
    font-size: 1.5rem;
  }

  .tip-content strong {
    display: block;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .tip-content p {
    color: #64748b;
    margin: 0;
    font-size: 0.9rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .header-nav {
      flex-direction: column;
      gap: 1rem;
    }

    .page-title {
      font-size: 2rem;
    }

    .game-header {
      flex-direction: column;
      text-align: center;
    }

    .game-stats {
      grid-template-columns: 1fr;
    }

    .user-stats-grid {
      grid-template-columns: 1fr;
    }

    .tips-grid {
      grid-template-columns: 1fr;
    }

    .game-card {
      padding: 1.5rem;
    }

    .header-actions {
      justify-content: center;
    }
  }
</style>