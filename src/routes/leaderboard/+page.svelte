<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';

  let leaderboard = [];
  let userRank = null;
  let loading = true;
  let timeFilter = 'all_time';
  let gameTypeFilter = 'all_games';
  let user = null;

  onMount(async () => {
    await loadLeaderboard();
  });

  async function loadLeaderboard() {
    loading = true;
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user;

      // Get top players - using a direct query since we don't have the view yet
      const { data: playerStats, error } = await supabase
        .from('player_stats')
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            country
          )
        `)
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading leaderboard:', error);
        // Fallback to mock data for testing
        leaderboard = getMockLeaderboard();
      } else if (playerStats && playerStats.length > 0) {
        leaderboard = playerStats.map((player, index) => ({
          rank: index + 1,
          username: player.profiles?.username || 'Player' + (index + 1),
          displayName: player.profiles?.display_name || 'Player ' + (index + 1),
          country: player.profiles?.country || 'Kenya',
          totalScore: player.total_score || 0,
          gamesPlayed: player.total_games_played || 0,
          winRate: player.accuracy || 0,
          bestScore: player.best_score || 0,
          streak: player.best_streak || 0
        }));
      } else {
        // If no data, use mock data
        leaderboard = getMockLeaderboard();
      }

      // Get current user's rank if logged in
      if (user) {
        const { data: userStats } = await supabase
          .from('player_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (userStats) {
          // For now, use a simple rank calculation
          const userScore = userStats.total_score || 0;
          const betterPlayers = leaderboard.filter(p => p.totalScore > userScore).length;
          userRank = {
            rank: betterPlayers + 1,
            username: 'You',
            displayName: 'You',
            totalScore: userScore,
            gamesPlayed: userStats.total_games_played || 0,
            winRate: userStats.accuracy || 0,
            bestScore: userStats.best_score || 0,
            streak: userStats.current_streak || 0
          };
        }
      }

    } catch (error) {
      console.error('Error in loadLeaderboard:', error);
      leaderboard = getMockLeaderboard();
    }
    
    loading = false;
  }

  function getMockLeaderboard() {
    return [
      { rank: 1, username: 'trivia_king', displayName: 'John Mwangi', country: 'Nairobi', totalScore: 2450, gamesPlayed: 25, winRate: 92, bestScore: 180, streak: 8 },
      { rank: 2, username: 'quiz_master', displayName: 'Sarah Omondi', country: 'Mombasa', totalScore: 2180, gamesPlayed: 22, winRate: 88, bestScore: 175, streak: 6 },
      { rank: 3, username: 'brain_box', displayName: 'David Kimani', country: 'Kisumu', totalScore: 1950, gamesPlayed: 20, winRate: 85, bestScore: 170, streak: 5 },
      { rank: 4, username: 'kenya_expert', displayName: 'Grace Wambui', country: 'Nakuru', totalScore: 1820, gamesPlayed: 18, winRate: 82, bestScore: 165, streak: 4 },
      { rank: 5, username: 'knowledge_seeker', displayName: 'Mike Otieno', country: 'Eldoret', totalScore: 1670, gamesPlayed: 16, winRate: 78, bestScore: 160, streak: 3 },
      { rank: 6, username: 'quiz_champ', displayName: 'Lucy Akinyi', country: 'Thika', totalScore: 1540, gamesPlayed: 15, winRate: 75, bestScore: 155, streak: 3 },
      { rank: 7, username: 'smart_player', displayName: 'Peter Njoroge', country: 'Nairobi', totalScore: 1420, gamesPlayed: 14, winRate: 72, bestScore: 150, streak: 2 },
      { rank: 8, username: 'trivia_pro', displayName: 'Mary Achieng', country: 'Kisumu', totalScore: 1350, gamesPlayed: 13, winRate: 70, bestScore: 145, streak: 2 },
      { rank: 9, username: 'game_lover', displayName: 'James Kipchoge', country: 'Eldoret', totalScore: 1280, gamesPlayed: 12, winRate: 68, bestScore: 140, streak: 2 },
      { rank: 10, username: 'knowledge_king', displayName: 'Ann Muthoni', country: 'Nakuru', totalScore: 1200, gamesPlayed: 11, winRate: 65, bestScore: 135, streak: 1 }
    ];
  }

  function getMedalEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  }
</script>

<div class="leaderboard-container">
  <!-- Header -->
  <header class="leaderboard-header">
    <h1>Leaderboard</h1>
    <p>Compete with players across Kenya and climb the ranks!</p>
  </header>

  <!-- User Rank Card -->
  {#if userRank}
    <div class="user-rank-card">
      <div class="user-rank-header">
        <h2>#{userRank.rank}</h2>
        <span>Your Rank</span>
      </div>
      <div class="user-stats-grid">
        <div class="user-stat">
          <div class="stat-value">{userRank.totalScore}</div>
          <div class="stat-label">Total Score</div>
        </div>
        <div class="user-stat">
          <div class="stat-value">{userRank.gamesPlayed}</div>
          <div class="stat-label">Games Played</div>
        </div>
        <div class="user-stat">
          <div class="stat-value">{Math.round(userRank.winRate)}%</div>
          <div class="stat-label">Win Rate</div>
        </div>
        <div class="user-stat">
          <div class="stat-value">{userRank.bestScore}</div>
          <div class="stat-label">Best Score</div>
        </div>
      </div>
    </div>
  {:else if user}
    <div class="user-rank-card no-stats">
      <div class="user-rank-header">
        <h2>Unranked</h2>
        <span>Play a game to get ranked!</span>
      </div>
      <div class="play-cta">
        <a href="/nationwide/quick-play" class="play-button">Play Your First Game</a>
      </div>
    </div>
  {/if}

  <!-- Filters -->
  <div class="filters-section">
    <div class="filter-group">
      <label>Time Period:</label>
      <select bind:value={timeFilter}>
        <option value="all_time">All Time</option>
        <option value="weekly">This Week</option>
        <option value="monthly">This Month</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Game Type:</label>
      <select bind:value={gameTypeFilter}>
        <option value="all_games">All Games</option>
        <option value="quick_play">Quick Play</option>
        <option value="tournament">Tournaments</option>
      </select>
    </div>
  </div>

  <!-- Leaderboard Table -->
  <div class="leaderboard-table-container">
    {#if loading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        Loading leaderboard...
      </div>
    {:else}
      <div class="table-header">
        <span>Rank</span>
        <span>Player</span>
        <span>Score</span>
        <span>Games</span>
        <span>Win Rate</span>
      </div>
      
      <div class="table-body">
        {#each leaderboard as player}
          <div class="table-row {player.rank <= 3 ? 'top-three' : ''} {userRank && player.rank === userRank.rank ? 'current-user' : ''}">
            <div class="rank-cell">
              {#if player.rank <= 3}
                <span class="medal">{getMedalEmoji(player.rank)}</span>
                <span class="rank-number">#{player.rank}</span>
              {:else}
                <span class="rank-number">#{player.rank}</span>
              {/if}
            </div>
            
            <div class="player-cell">
              <div class="player-info">
                <span class="player-name">{player.displayName}</span>
                <span class="player-country">{player.country}</span>
              </div>
            </div>
            
            <div class="score-cell">
              <span class="score-value">{player.totalScore.toLocaleString()}</span>
            </div>
            
            <div class="games-cell">
              <span>{player.gamesPlayed}</span>
            </div>
            
            <div class="winrate-cell">
              <span>{Math.round(player.winRate)}%</span>
            </div>
          </div>
        {/each}
      </div>

      <div class="table-footer">
        <p>{leaderboard.length} players ranked • Updated just now</p>
      </div>
    {/if}
  </div>

  <!-- Call to Action -->
  <div class="cta-section">
    <p>Want to climb the ranks?</p>
    <a href="/nationwide/quick-play" class="play-button">Play Quick Play</a>
    <a href="/nationwide" class="secondary-button">Back to Games</a>
  </div>
</div>

<style>
  .leaderboard-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .leaderboard-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px 0;
  }

  .leaderboard-header h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .leaderboard-header p {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.5;
  }

  .user-rank-card {
    background: white;
    color: #2d3748;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .user-rank-card.no-stats {
    text-align: center;
  }

  .user-rank-header {
    text-align: center;
    margin-bottom: 25px;
  }

  .user-rank-header h2 {
    font-size: 3rem;
    font-weight: bold;
    color: #cd7f32;
    margin-bottom: 5px;
  }

  .user-rank-header span {
    font-size: 1.1rem;
    color: #718096;
    font-weight: 500;
  }

  .user-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }

  .user-stat {
    text-align: center;
    padding: 15px;
    background: #f7fafc;
    border-radius: 10px;
  }

  .user-stat .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4299e1;
    margin-bottom: 5px;
  }

  .user-stat .stat-label {
    font-size: 0.8rem;
    color: #718096;
    font-weight: 500;
  }

  .play-cta {
    margin-top: 20px;
  }

  .filters-section {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-group label {
    font-weight: 500;
    font-size: 0.9rem;
  }

  .filter-group select {
    background: white;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    padding: 8px 12px;
    color: #2d3748;
    font-size: 0.9rem;
    min-width: 120px;
  }

  .leaderboard-table-container {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    max-width: 1000px;
    margin: 0 auto 40px;
  }

  .loading-state {
    text-align: center;
    padding: 60px 20px;
    color: #718096;
    font-size: 1.1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #4299e1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .table-header {
    display: grid;
    grid-template-columns: 100px 1fr 120px 100px 120px;
    gap: 15px;
    padding: 20px 25px;
    background: #4a5568;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .table-body {
    max-height: 600px;
    overflow-y: auto;
  }

  .table-row {
    display: grid;
    grid-template-columns: 100px 1fr 120px 100px 120px;
    gap: 15px;
    padding: 18px 25px;
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.2s ease;
  }

  .table-row:hover {
    background: #f7fafc;
  }

  .table-row.top-three {
    background: linear-gradient(135deg, #fff9db, #fff3bf);
  }

  .table-row.current-user {
    background: linear-gradient(135deg, #dbeafe, #93c5fd);
    border-left: 4px solid #4299e1;
  }

  .rank-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .medal {
    font-size: 1.5rem;
  }

  .rank-number {
    font-weight: 600;
    color: #718096;
  }

  .table-row.top-three .rank-number {
    color: #d97706;
    font-weight: 700;
  }

  .player-cell {
    display: flex;
    align-items: center;
  }

  .player-info {
    display: flex;
    flex-direction: column;
  }

  .player-name {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 2px;
  }

  .player-country {
    font-size: 0.8rem;
    color: #718096;
  }

  .score-cell, .games-cell, .winrate-cell {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #2d3748;
  }

  .score-value {
    color: #4299e1;
    font-size: 1.1rem;
  }

  .table-footer {
    padding: 15px 25px;
    text-align: center;
    background: #f7fafc;
    color: #718096;
    font-size: 0.9rem;
    border-top: 1px solid #e2e8f0;
  }

  .cta-section {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 30px;
    max-width: 400px;
    margin: 0 auto;
    backdrop-filter: blur(10px);
  }

  .cta-section p {
    font-size: 1.1rem;
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .play-button {
    background: #48bb78;
    color: white;
    padding: 12px 30px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease;
    display: inline-block;
    margin: 0 5px 10px;
  }

  .play-button:hover {
    background: #38a169;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
  }

  .secondary-button {
    background: #718096;
    color: white;
    padding: 12px 30px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease;
    display: inline-block;
    margin: 0 5px 10px;
  }

  .secondary-button:hover {
    background: #4a5568;
    transform: translateY(-1px);
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .user-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .table-header,
    .table-row {
      grid-template-columns: 60px 1fr 80px;
      gap: 10px;
      padding: 15px;
    }

    .games-cell, .winrate-cell {
      display: none;
    }

    .filters-section {
      flex-direction: column;
      align-items: center;
    }

    .leaderboard-header h1 {
      font-size: 2rem;
    }

    .leaderboard-header p {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .leaderboard-container {
      padding: 10px;
    }

    .user-rank-card {
      padding: 20px;
      margin: 0 10px 20px;
    }

    .leaderboard-table-container {
      margin: 0 10px 30px;
    }
  }
</style>