<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let leaderboardData = [];
  let isLoading = true;
  let timeFilter = 'alltime'; // daily, weekly, monthly, alltime
  let gameTypeFilter = 'all'; // quickplay, tournament, all
  let currentUserRank = null;
  let userStats = null;

  // Sample leaderboard data - replace with Supabase data
  const sampleLeaderboard = [
    { rank: 1, name: "Sarah_K", score: 2450, games: 42, winRate: 85, isPremium: true, avatar: "👑" },
    { rank: 2, name: "MikeJ", score: 2310, games: 38, winRate: 79, isPremium: false, avatar: "⚡" },
    { rank: 3, name: "Tasha_KE", score: 2180, games: 35, winRate: 82, isPremium: true, avatar: "🌟" },
    { rank: 4, name: "Jamal", score: 2050, games: 40, winRate: 75, isPremium: false, avatar: "🚀" },
    { rank: 5, name: "Grace_W", score: 1980, games: 32, winRate: 88, isPremium: true, avatar: "💫" },
    { rank: 6, name: "David_M", score: 1850, games: 28, winRate: 80, isPremium: false, avatar: "🔥" },
    { rank: 7, name: "Lena_T", score: 1720, games: 35, winRate: 72, isPremium: false, avatar: "🎯" },
    { rank: 8, name: "Alex_K", score: 1680, games: 30, winRate: 78, isPremium: true, avatar: "⭐" },
    { rank: 9, name: "Moses_N", score: 1550, games: 25, winRate: 82, isPremium: false, avatar: "⚡" },
    { rank: 10, name: "Faith_W", score: 1420, games: 22, winRate: 75, isPremium: false, avatar: "🌟" }
  ];

  // Sample user stats - replace with actual user data
  const sampleUserStats = {
    rank: 15,
    score: 1250,
    games: 18,
    winRate: 70,
    bestScore: 480,
    averageScore: 320,
    totalPlayTime: "4h 30m",
    favoriteCategory: "Geography"
  };

  onMount(() => {
    loadLeaderboardData();
    loadUserStats();
  });

  function loadLeaderboardData() {
    // TODO: Fetch from Supabase based on filters
    leaderboardData = sampleLeaderboard;
    isLoading = false;
  }

  function loadUserStats() {
    // TODO: Fetch current user's stats from Supabase
    userStats = sampleUserStats;
    currentUserRank = sampleUserStats.rank;
  }

  function filterLeaderboard() {
    isLoading = true;
    // Simulate API call delay
    setTimeout(() => {
      loadLeaderboardData();
    }, 500);
  }

  function viewUserProfile(userName) {
    // TODO: Navigate to user profile
    console.log('View profile:', userName);
  }

  function playQuickGame() {
    goto('/nationwide/quick-play');
  }

  function viewNationwide() {
    goto('/nationwide');
  }

  function getRankBadge(rank) {
    if (rank === 1) return { emoji: "🥇", class: "gold" };
    if (rank === 2) return { emoji: "🥈", class: "silver" };
    if (rank === 3) return { emoji: "🥉", class: "bronze" };
    return { emoji: `#${rank}`, class: "normal" };
  }

  function getWinRateColor(winRate) {
    if (winRate >= 80) return "excellent";
    if (winRate >= 60) return "good";
    if (winRate >= 40) return "average";
    return "poor";
  }
</script>

<div class="leaderboard-page">
  <div class="container">
    
    <!-- Header -->
    <header class="header-section">
      <div class="header-nav">
        <button class="back-button" on:click={viewNationwide}>← Back</button>
        <h1 class="page-title">Leaderboard</h1>
        <button class="play-button" on:click={playQuickGame}>🎮 Play Now</button>
      </div>
      <p class="page-subtitle">Compete with players across Kenya and climb the ranks!</p>
    </header>

    <!-- User Stats Card -->
    {#if userStats}
      <section class="user-stats-section">
        <div class="user-stats-card">
          <div class="user-rank-badge">
            <span class="rank-number">#{userStats.rank}</span>
            <span class="rank-label">Your Rank</span>
          </div>
          <div class="user-stats-grid">
            <div class="user-stat">
              <div class="stat-value">{userStats.score}</div>
              <div class="stat-label">Total Score</div>
            </div>
            <div class="user-stat">
              <div class="stat-value">{userStats.games}</div>
              <div class="stat-label">Games Played</div>
            </div>
            <div class="user-stat">
              <div class="stat-value">{userStats.winRate}%</div>
              <div class="stat-label">Win Rate</div>
            </div>
            <div class="user-stat">
              <div class="stat-value">{userStats.bestScore}</div>
              <div class="stat-label">Best Score</div>
            </div>
          </div>
        </div>
      </section>
    {/if}

    <!-- Filters -->
    <section class="filters-section">
      <div class="filter-group">
        <label>Time Period:</label>
        <select bind:value={timeFilter} on:change={filterLeaderboard}>
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="alltime">All Time</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Game Type:</label>
        <select bind:value={gameTypeFilter} on:change={filterLeaderboard}>
          <option value="all">All Games</option>
          <option value="quickplay">Quick Play</option>
          <option value="tournament">Tournaments</option>
        </select>
      </div>

      <div class="stats-summary">
        <span class="total-players">{leaderboardData.length} players ranked</span>
      </div>
    </section>

    <!-- Leaderboard -->
    <section class="leaderboard-section">
      <div class="leaderboard-header">
        <h2>Top Players</h2>
        <div class="legend">
          <div class="legend-item">
            <span class="premium-indicator">⭐</span>
            <span>Premium Player</span>
          </div>
        </div>
      </div>

      {#if isLoading}
        <div class="loading-state">
          <div class="loading-spinner">⏳</div>
          <p>Loading leaderboard...</p>
        </div>
      {:else}
        <div class="leaderboard-list">
          <!-- Top 3 Podium -->
          <div class="podium-section">
            {#each leaderboardData.slice(0, 3) as player (player.rank)}
              <div class="podium-card {getRankBadge(player.rank).class}">
                <div class="podium-rank">{getRankBadge(player.rank).emoji}</div>
                <div class="podium-avatar">{player.avatar}</div>
                <div class="podium-info">
                  <div class="player-name">
                    {player.name}
                    {#if player.isPremium}
                      <span class="premium-badge">⭐</span>
                    {/if}
                  </div>
                  <div class="player-score">{player.score} pts</div>
                </div>
                <div class="podium-stats">
                  <div class="stat">{player.games} games</div>
                  <div class="stat {getWinRateColor(player.winRate)}">{player.winRate}% win</div>
                </div>
              </div>
            {/each}
          </div>

          <!-- Rest of Leaderboard -->
          <div class="rankings-list">
            {#each leaderboardData.slice(3) as player (player.rank)}
              <div class="ranking-row {player.rank === currentUserRank ? 'current-user' : ''}">
                <div class="rank-number {getRankBadge(player.rank).class}">
                  {getRankBadge(player.rank).emoji}
                </div>
                
                <div class="player-info" on:click={() => viewUserProfile(player.name)}>
                  <div class="player-avatar">{player.avatar}</div>
                  <div class="player-details">
                    <div class="player-name">
                      {player.name}
                      {#if player.isPremium}
                        <span class="premium-badge">⭐</span>
                      {/if}
                    </div>
                    <div class="player-meta">
                      <span class="games">{player.games} games</span>
                      <span class="win-rate {getWinRateColor(player.winRate)}">{player.winRate}% win</span>
                    </div>
                  </div>
                </div>

                <div class="player-score">
                  <span class="score-value">{player.score}</span>
                  <span class="score-label">points</span>
                </div>

                {#if player.rank === currentUserRank}
                  <div class="you-badge">YOU</div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </section>

    <!-- Categories Leaderboard -->
    <section class="categories-section">
      <h3>Top Categories</h3>
      <div class="categories-grid">
        <div class="category-card">
          <div class="category-icon">🌍</div>
          <div class="category-info">
            <h4>Geography</h4>
            <div class="top-player">
              <span class="player-name">Sarah_K</span>
              <span class="player-score">980 pts</span>
            </div>
          </div>
        </div>
        
        <div class="category-card">
          <div class="category-icon">📚</div>
          <div class="category-info">
            <h4>History</h4>
            <div class="top-player">
              <span class="player-name">MikeJ</span>
              <span class="player-score">850 pts</span>
            </div>
          </div>
        </div>
        
        <div class="category-card">
          <div class="category-icon">🎭</div>
          <div class="category-info">
            <h4>Culture</h4>
            <div class="top-player">
              <span class="player-name">Tasha_KE</span>
              <span class="player-score">920 pts</span>
            </div>
          </div>
        </div>
        
        <div class="category-card">
          <div class="category-icon">🔬</div>
          <div class="category-info">
            <h4>Science</h4>
            <div class="top-player">
              <span class="player-name">Jamal</span>
              <span class="player-score">780 pts</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievement Preview -->
    <section class="achievements-section">
      <h3>Top Achievements</h3>
      <div class="achievements-grid">
        <div class="achievement-card">
          <div class="achievement-icon">🏆</div>
          <div class="achievement-info">
            <h4>Trivia Master</h4>
            <p>Score 2000+ points in a single game</p>
            <div class="achievement-stats">
              <span class="completion">15% achieved</span>
            </div>
          </div>
        </div>
        
        <div class="achievement-card">
          <div class="achievement-icon">⚡</div>
          <div class="achievement-info">
            <h4>Speed Demon</h4>
            <p>Answer 10 questions in under 2 minutes</p>
            <div class="achievement-stats">
              <span class="completion">28% achieved</span>
            </div>
          </div>
        </div>
        
        <div class="achievement-card">
          <div class="achievement-icon">🎯</div>
          <div class="achievement-info">
            <h4>Perfect Score</h4>
            <p>Get 100% accuracy in a 20-question game</p>
            <div class="achievement-stats">
              <span class="completion">8% achieved</span>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</div>

<style>
  .leaderboard-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 2rem 0;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* Header */
  .header-section {
    text-align: center;
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
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .play-button {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .play-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  .page-subtitle {
    color: #64748b;
    font-size: 1.2rem;
    margin: 0;
  }

  /* User Stats */
  .user-stats-section {
    margin-bottom: 2rem;
  }

  .user-stats-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .user-rank-badge {
    text-align: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    border-radius: 12px;
    color: white;
    min-width: 120px;
  }

  .rank-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .rank-label {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.9;
  }

  .user-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    flex: 1;
  }

  .user-stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* Filters */
  .filters-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-group label {
    font-weight: 600;
    color: #374151;
  }

  .filter-group select {
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .filter-group select:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .stats-summary {
    color: #64748b;
    font-weight: 600;
  }

  /* Leaderboard */
  .leaderboard-section {
    margin-bottom: 3rem;
  }

  .leaderboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .leaderboard-header h2 {
    font-size: 2rem;
    color: #1e293b;
    margin: 0;
  }

  .legend {
    display: flex;
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.9rem;
  }

  .premium-indicator {
    font-size: 1rem;
  }

  /* Podium */
  .podium-section {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .podium-card {
    background: white;
    border-radius: 16px;
    padding: 2rem 1.5rem;
    text-align: center;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border: 3px solid transparent;
    transition: transform 0.3s ease;
  }

  .podium-card:hover {
    transform: translateY(-4px);
  }

  .podium-card.gold {
    border-color: #fbbf24;
    background: linear-gradient(135deg, #fef3c7, white);
  }

  .podium-card.silver {
    border-color: #9ca3af;
    background: linear-gradient(135deg, #f3f4f6, white);
  }

  .podium-card.bronze {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #fef3c7, white);
  }

  .podium-rank {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .podium-avatar {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .podium-info {
    margin-bottom: 1rem;
  }

  .player-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }

  .premium-badge {
    font-size: 0.8rem;
  }

  .player-score {
    font-size: 1.5rem;
    font-weight: 800;
    color: #3b82f6;
  }

  .podium-stats {
    display: flex;
    justify-content: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: #64748b;
  }

  .stat.excellent { color: #059669; font-weight: 600; }
  .stat.good { color: #0d9488; font-weight: 600; }
  .stat.average { color: #d97706; font-weight: 600; }
  .stat.poor { color: #dc2626; font-weight: 600; }

  /* Rankings List */
  .rankings-list {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .ranking-row {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.3s ease;
  }

  .ranking-row:hover {
    background: #f8fafc;
  }

  .ranking-row.current-user {
    background: #dbeafe;
    border-left: 4px solid #3b82f6;
  }

  .ranking-row:last-child {
    border-bottom: none;
  }

  .rank-number {
    font-size: 1.2rem;
    font-weight: 700;
    min-width: 50px;
  }

  .rank-number.gold { color: #fbbf24; }
  .rank-number.silver { color: #9ca3af; }
  .rank-number.bronze { color: #f59e0b; }
  .rank-number.normal { color: #64748b; }

  .player-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    cursor: pointer;
  }

  .player-avatar {
    font-size: 1.5rem;
  }

  .player-details {
    flex: 1;
  }

  .player-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .win-rate.excellent { color: #059669; font-weight: 600; }
  .win-rate.good { color: #0d9488; font-weight: 600; }
  .win-rate.average { color: #d97706; font-weight: 600; }
  .win-rate.poor { color: #dc2626; font-weight: 600; }

  .player-score {
    text-align: right;
    min-width: 100px;
  }

  .score-value {
    display: block;
    font-size: 1.2rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .score-label {
    display: block;
    font-size: 0.8rem;
    color: #64748b;
  }

  .you-badge {
    background: #3b82f6;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 700;
    margin-left: 1rem;
  }

  /* Categories */
  .categories-section {
    margin-bottom: 3rem;
  }

  .categories-section h3 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .category-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s ease;
  }

  .category-card:hover {
    transform: translateY(-2px);
  }

  .category-icon {
    font-size: 2rem;
  }

  .category-info {
    flex: 1;
  }

  .category-info h4 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }

  .top-player {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .player-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
  }

  .player-score {
    font-size: 0.9rem;
    font-weight: 700;
    color: #3b82f6;
  }

  /* Achievements */
  .achievements-section h3 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .achievement-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: start;
    gap: 1rem;
    transition: transform 0.3s ease;
  }

  .achievement-card:hover {
    transform: translateY(-2px);
  }

  .achievement-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .achievement-info {
    flex: 1;
  }

  .achievement-info h4 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }

  .achievement-info p {
    margin: 0 0 0.75rem 0;
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .achievement-stats {
    font-size: 0.8rem;
    color: #6b7280;
  }

  .completion {
    font-weight: 600;
  }

  /* Loading State */
  .loading-state {
    padding: 4rem 2rem;
    text-align: center;
    color: #64748b;
  }

  .loading-spinner {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
      font-size: 2.5rem;
    }

    .user-stats-card {
      flex-direction: column;
      text-align: center;
    }

    .user-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .filters-section {
      flex-direction: column;
      align-items: stretch;
    }

    .podium-section {
      grid-template-columns: 1fr;
    }

    .categories-grid {
      grid-template-columns: 1fr;
    }

    .achievements-grid {
      grid-template-columns: 1fr;
    }

    .ranking-row {
      padding: 0.75rem 1rem;
    }

    .player-meta {
      flex-direction: column;
      gap: 0.25rem;
    }
  }

  @media (max-width: 480px) {
    .page-title {
      font-size: 2rem;
    }

    .user-stats-grid {
      grid-template-columns: 1fr;
    }

    .podium-card {
      padding: 1.5rem 1rem;
    }
  }
</style>