<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let tournament: any = null;
  let isLoading = true;
  let finalResults: any = null;
  let playerStats: any = null;
  let prizeDistribution: any[] = [];
  let showDetailedStats = false;

  // Current user
  const currentUser = {
    id: 'user-123',
    username: 'GamePlayer',
    avatar: '😎'
  };

  onMount(() => {
    if (!browser) return;
    loadTournamentResults();
  });

  function loadTournamentResults(): void {
    const tournamentId = $page.params.id;
    
    // Mock tournament data
    tournament = {
      id: tournamentId,
      name: 'Mega Monday Championship',
      theme: {
        name: 'General Knowledge',
        color: '#4f46e5',
        icon: '🌍'
      },
      schedule: {
        date: '2024-01-15',
        day: 'Monday',
        time: '19:00',
        duration: '45 mins'
      },
      details: {
        prizePool: 25000,
        totalPlayers: 87,
        totalQuestions: 20,
        completionTime: '38 minutes'
      }
    };

    // Mock final results
    finalResults = {
      players: [
        { id: '1', username: 'TriviaMaster', avatar: '👑', score: 245, correctAnswers: 18, averageTime: 12.3, rank: 1, prize: 7500 },
        { id: '2', username: 'QuizWhiz', avatar: '⭐', score: 228, correctAnswers: 17, averageTime: 13.1, rank: 2, prize: 5000 },
        { id: '3', username: 'BrainBox', avatar: '💡', score: 215, correctAnswers: 16, averageTime: 11.8, rank: 3, prize: 3750 },
        { id: '4', username: 'SuperPlayer', avatar: '🚀', score: 198, correctAnswers: 15, averageTime: 14.2, rank: 4, prize: 2500 },
        { id: '5', username: 'GameExpert', avatar: '🎮', score: 185, correctAnswers: 14, averageTime: 13.7, rank: 5, prize: 2000 },
        { id: '6', username: 'KnowledgeKing', avatar: '🤴', score: 172, correctAnswers: 13, averageTime: 15.1, rank: 6, prize: 1750 },
        { id: '7', username: 'QuickMind', avatar: '⚡', score: 168, correctAnswers: 13, averageTime: 10.9, rank: 7, prize: 1250 },
        { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar, score: 156, correctAnswers: 12, averageTime: 14.8, rank: 8, prize: 750 },
        { id: '9', username: 'SmartCookie', avatar: '🍪', score: 142, correctAnswers: 11, averageTime: 16.2, rank: 9, prize: 500 },
        { id: '10', username: 'AnswerAce', avatar: '🎯', score: 135, correctAnswers: 10, averageTime: 17.1, rank: 10, prize: 0 }
      ],
      tournamentStats: {
        averageScore: 158,
        highestScore: 245,
        completionRate: '94%',
        averageAccuracy: '72%',
        fastestAverageTime: 10.9
      }
    };

    // Player-specific stats
    playerStats = {
      rank: 8,
      score: 156,
      correctAnswers: 12,
      totalQuestions: 20,
      accuracy: '60%',
      averageTime: 14.8,
      bestStreak: 4,
      prizeWon: 750,
      performance: 'Good',
      improvement: '+2 ranks from last tournament',
      categoryBreakdown: [
        { category: 'Science', correct: 3, total: 4, accuracy: '75%' },
        { category: 'History', correct: 2, total: 4, accuracy: '50%' },
        { category: 'Geography', correct: 4, total: 5, accuracy: '80%' },
        { category: 'Entertainment', correct: 3, total: 4, accuracy: '75%' },
        { category: 'Sports', correct: 0, total: 3, accuracy: '0%' }
      ]
    };

    // Prize distribution
    prizeDistribution = [
      { rank: 1, amount: 7500, percentage: '30%', player: 'TriviaMaster' },
      { rank: 2, amount: 5000, percentage: '20%', player: 'QuizWhiz' },
      { rank: 3, amount: 3750, percentage: '15%', player: 'BrainBox' },
      { rank: 4, amount: 2500, percentage: '10%', player: 'SuperPlayer' },
      { rank: 5, amount: 2000, percentage: '8%', player: 'GameExpert' },
      { rank: 6, amount: 1750, percentage: '7%', player: 'KnowledgeKing' },
      { rank: 7, amount: 1250, percentage: '5%', player: 'QuickMind' },
      { rank: 8, amount: 750, percentage: '3%', player: currentUser.username },
      { rank: 9, amount: 500, percentage: '2%', player: 'SmartCookie' }
    ];

    isLoading = false;
  }

  function getPlayerPosition(): any {
    return finalResults.players.find((player: any) => player.id === currentUser.id);
  }

  function getRankSuffix(rank: number): string {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  }

  function getPerformanceColor(performance: string): string {
    const colors: { [key: string]: string } = {
      'Excellent': '#10b981',
      'Great': '#059669',
      'Good': '#f59e0b',
      'Average': '#f97316',
      'Needs Improvement': '#ef4444'
    };
    return colors[performance] || '#6b7280';
  }

  function formatTime(seconds: number): string {
    return seconds.toFixed(1) + 's';
  }

  function shareResults(): void {
    const shareText = `I finished ${playerStats.rank}${getRankSuffix(playerStats.rank)} in the ${tournament.name} tournament on ChezaNite! 🏆 Score: ${playerStats.score} points.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Tournament Results',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  }

  function playAgain(): void {
    goto('/nationwide/tournaments');
  }

  function viewLeaderboard(): void {
    // Scroll to leaderboard section
    const leaderboard = document.getElementById('final-leaderboard');
    if (leaderboard) {
      leaderboard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Science': '#4f46e5',
      'History': '#dc2626',
      'Geography': '#059669',
      'Entertainment': '#ea580c',
      'Sports': '#7c3aed'
    };
    return colors[category] || '#6b7280';
  }
</script>

<svelte:head>
  <title>Results - {tournament?.name} - ChezaNite</title>
</svelte:head>

<div class="results-container">
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading tournament results...</p>
    </div>

  {:else}
    <!-- Header Section -->
    <header class="results-header">
      <div class="header-content">
        <button class="back-button" on:click={() => goto('/nationwide/tournaments')}>
          ← Back to Tournaments
        </button>
        <div class="tournament-title">
          <h1>Tournament Results</h1>
          <div class="tournament-info">
            <span class="tournament-name">{tournament.name}</span>
            <span class="tournament-date">{tournament.schedule.day}, {tournament.schedule.date}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="results-content">
      <!-- Main Results Card -->
      <div class="main-results-card">
        <!-- Performance Summary -->
        <div class="performance-summary">
          <div class="rank-section">
            <div class="rank-badge {playerStats.rank <= 3 ? 'podium' : ''}">
              <span class="rank-number">{playerStats.rank}</span>
              <span class="rank-label">{getRankSuffix(playerStats.rank)} Place</span>
            </div>
            <p class="rank-out-of">Out of {tournament.details.totalPlayers} players</p>
          </div>

          <div class="score-section">
            <div class="score-display">
              <span class="score-value">{playerStats.score}</span>
              <span class="score-label">Total Points</span>
            </div>
            
            {#if playerStats.prizeWon > 0}
              <div class="prize-earned">
                <span class="prize-icon">💰</span>
                <span class="prize-amount">KSH {playerStats.prizeWon.toLocaleString()} Won</span>
              </div>
            {/if}
          </div>

          <div class="performance-rating">
            <div class="rating-badge" style="background: {getPerformanceColor(playerStats.performance)}">
              {playerStats.performance} Performance
            </div>
            <p class="improvement-text">{playerStats.improvement}</p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">{playerStats.correctAnswers}/{playerStats.totalQuestions}</div>
              <div class="stat-label">Correct Answers</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{playerStats.accuracy}</div>
              <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{formatTime(playerStats.averageTime)}</div>
              <div class="stat-label">Avg. Time</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{playerStats.bestStreak}</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="results-actions">
          <button class="action-btn primary" on:click={shareResults}>
            <span class="btn-icon">📤</span>
            Share Results
          </button>
          <button class="action-btn secondary" on:click={viewLeaderboard}>
            <span class="btn-icon">🏆</span>
            View Leaderboard
          </button>
          <button class="action-btn outline" on:click={playAgain}>
            <span class="btn-icon">🔄</span>
            Play Another Tournament
          </button>
        </div>
      </div>

      <div class="results-grid">
        <!-- Left Column: Detailed Stats -->
        <div class="left-column">
          <!-- Category Performance -->
          <div class="stats-card">
            <h3>📊 Category Performance</h3>
            <div class="category-stats">
              {#each playerStats.categoryBreakdown as category}
                <div class="category-item">
                  <div class="category-header">
                    <span class="category-name" style="color: {getCategoryColor(category.category)}">
                      {category.category}
                    </span>
                    <span class="category-accuracy">{category.accuracy}</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      style="width: {category.accuracy}; background: {getCategoryColor(category.category)}"
                    ></div>
                  </div>
                  <div class="category-details">
                    {category.correct} of {category.total} correct
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Tournament Statistics -->
          <div class="stats-card">
            <h3>📈 Tournament Statistics</h3>
            <div class="tournament-stats-grid">
              <div class="tournament-stat">
                <div class="stat-value">{finalResults.tournamentStats.averageScore}</div>
                <div class="stat-label">Average Score</div>
              </div>
              <div class="tournament-stat">
                <div class="stat-value">{finalResults.tournamentStats.highestScore}</div>
                <div class="stat-label">Highest Score</div>
              </div>
              <div class="tournament-stat">
                <div class="stat-value">{finalResults.tournamentStats.completionRate}</div>
                <div class="stat-label">Completion Rate</div>
              </div>
              <div class="tournament-stat">
                <div class="stat-value">{finalResults.tournamentStats.averageAccuracy}</div>
                <div class="stat-label">Average Accuracy</div>
              </div>
              <div class="tournament-stat">
                <div class="stat-value">{formatTime(finalResults.tournamentStats.fastestAverageTime)}</div>
                <div class="stat-label">Fastest Avg. Time</div>
              </div>
              <div class="tournament-stat">
                <div class="stat-value">{tournament.details.completionTime}</div>
                <div class="stat-label">Tournament Duration</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Prizes & Leaderboard -->
        <div class="right-column">
          <!-- Prize Distribution -->
          <div class="prize-card">
            <h3>💰 Prize Distribution</h3>
            <div class="prize-pool-info">
              <div class="total-prize">
                <span class="prize-label">Total Prize Pool:</span>
                <span class="prize-amount">KSH {tournament.details.prizePool.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="prize-list">
              {#each prizeDistribution as prize}
                <div class="prize-item {prize.player === currentUser.username ? 'your-prize' : ''}">
                  <div class="prize-rank {prize.rank <= 3 ? `rank-${prize.rank}` : ''}">
                    {#if prize.rank <= 3}
                      {#if prize.rank === 1}🥇
                      {:else if prize.rank === 2}🥈
                      {:else if prize.rank === 3}🥉
                      {/if}
                    {:else}
                      #{prize.rank}
                    {/if}
                  </div>
                  
                  <div class="prize-details">
                    <div class="prize-position">
                      {prize.rank}{getRankSuffix(prize.rank)} Place
                      {#if prize.player === currentUser.username}
                        <span class="you-badge">YOU</span>
                      {/if}
                    </div>
                    <div class="prize-player">{prize.player}</div>
                  </div>
                  
                  <div class="prize-amount-section">
                    <div class="prize-money">KSH {prize.amount.toLocaleString()}</div>
                    <div class="prize-percentage">{prize.percentage}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Final Leaderboard -->
          <div class="leaderboard-card" id="final-leaderboard">
            <div class="card-header">
              <h3>🏆 Final Leaderboard</h3>
              <div class="leaderboard-info">
                <span>{finalResults.players.length} Players</span>
              </div>
            </div>

            <div class="leaderboard-list">
              {#each finalResults.players as player}
                <div class="leaderboard-item {player.id === currentUser.id ? 'current-player' : ''} {player.rank <= 3 ? 'podium' : ''}">
                  <div class="player-rank {player.rank <= 3 ? `rank-${player.rank}` : ''}">
                    {#if player.rank <= 3}
                      {#if player.rank === 1}🥇
                      {:else if player.rank === 2}🥈
                      {:else if player.rank === 3}🥉
                      {/if}
                    {:else}
                      #{player.rank}
                    {/if}
                  </div>

                  <div class="player-info">
                    <span class="player-avatar">{player.avatar}</span>
                    <span class="player-name">{player.username}</span>
                    {#if player.id === currentUser.id}
                      <span class="you-badge">YOU</span>
                    {/if}
                  </div>

                  <div class="player-stats">
                    <div class="player-score">{player.score}</div>
                    <div class="player-details">
                      <span>{player.correctAnswers}/20</span>
                      <span>{formatTime(player.averageTime)}</span>
                    </div>
                  </div>

                  {#if player.prize > 0}
                    <div class="prize-badge">
                      KSH {player.prize.toLocaleString()}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Improvement Tips -->
      <div class="tips-card">
        <h3>💡 Tips for Improvement</h3>
        <div class="tips-grid">
          <div class="tip-item">
            <div class="tip-icon">🎯</div>
            <div class="tip-content">
              <h4>Focus on Weaker Categories</h4>
              <p>Practice more in categories where you scored lower to improve overall performance.</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">⏱️</div>
            <div class="tip-content">
              <h4>Improve Response Time</h4>
              <p>Work on answering faster while maintaining accuracy to earn more time bonuses.</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">🔥</div>
            <div class="tip-content">
              <h4>Build Longer Streaks</h4>
              <p>Maintain focus to build consecutive correct answers for streak bonuses.</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">📚</div>
            <div class="tip-content">
              <h4>Practice Regularly</h4>
              <p>Play quick games daily to improve your knowledge and reaction time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .results-container {
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

  /* Header */
  .results-header {
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
    margin-bottom: 5px;
    background: linear-gradient(45deg, #fff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tournament-info {
    display: flex;
    gap: 20px;
    opacity: 0.8;
  }

  /* Main Content */
  .results-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;
  }

  /* Main Results Card */
  .main-results-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
  }

  .performance-summary {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
    align-items: center;
    margin-bottom: 30px;
  }

  .rank-badge {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.1);
    border: 4px solid rgba(255, 255, 255, 0.3);
  }

  .rank-badge.podium {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
  }

  .rank-number {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .rank-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .rank-out-of {
    opacity: 0.7;
    margin-top: 10px;
  }

  .score-display {
    margin-bottom: 15px;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 700;
    color: #ffd700;
    display: block;
  }

  .score-label {
    opacity: 0.8;
  }

  .prize-earned {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
    padding: 10px 15px;
    border-radius: 20px;
    font-weight: 600;
  }

  .prize-icon {
    font-size: 1.2rem;
  }

  .rating-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .improvement-text {
    opacity: 0.8;
    margin: 0;
  }

  .quick-stats {
    margin-bottom: 30px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    max-width: 500px;
    margin: 0 auto;
  }

  .stat-item {
    text-align: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 5px;
  }

  .stat-label {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .results-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
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

  .action-btn.outline {
    background: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .action-btn.outline:hover {
    border-color: #ffd700;
    color: #ffd700;
  }

  .btn-icon {
    font-size: 1.1rem;
  }

  /* Results Grid */
  .results-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 25px;
    margin-bottom: 30px;
  }

  /* Stats Cards */
  .stats-card, .prize-card, .leaderboard-card, .tips-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 25px;
  }

  .stats-card h3, .prize-card h3, .leaderboard-card h3, .tips-card h3 {
    margin-bottom: 20px;
    color: #ffd700;
  }

  /* Category Stats */
  .category-stats {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .category-item {
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .category-name {
    font-weight: 600;
  }

  .category-accuracy {
    font-weight: 700;
    color: #ffd700;
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
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .category-details {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  /* Tournament Stats */
  .tournament-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .tournament-stat {
    text-align: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  /* Prize Distribution */
  .prize-pool-info {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .total-prize {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .prize-amount {
    font-size: 1.2rem;
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
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .prize-item.your-prize {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
  }

  .prize-rank {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  .prize-rank.rank-1 {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
  }

  .prize-rank.rank-2 {
    background: linear-gradient(45deg, #c0c0c0, #e0e0e0);
    color: #1a237e;
  }

  .prize-rank.rank-3 {
    background: linear-gradient(45deg, #cd7f32, #e3964a);
    color: white;
  }

  .prize-details {
    flex: 1;
  }

  .prize-position {
    font-weight: 600;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .you-badge {
    background: #ffd700;
    color: #1a237e;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .prize-player {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .prize-amount-section {
    text-align: right;
  }

  .prize-money {
    font-weight: 700;
    color: #ffd700;
  }

  .prize-percentage {
    font-size: 0.7rem;
    opacity: 0.7;
  }

  /* Leaderboard */
  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 500px;
    overflow-y: auto;
  }

  .leaderboard-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .leaderboard-item.current-player {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
  }

  .leaderboard-item.podium {
    background: rgba(255, 215, 0, 0.1);
  }

  .player-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .player-avatar {
    font-size: 1rem;
  }

  .player-name {
    font-weight: 600;
  }

  .player-stats {
    text-align: right;
  }

  .player-score {
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 2px;
  }

  .player-details {
    font-size: 0.7rem;
    opacity: 0.7;
    display: flex;
    gap: 8px;
  }

  .prize-badge {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  /* Tips Section */
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .tip-item {
    display: flex;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .tip-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .tip-content h4 {
    margin-bottom: 8px;
    color: #ffd700;
  }

  .tip-content p {
    opacity: 0.8;
    line-height: 1.4;
    margin: 0;
    font-size: 0.9rem;
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 968px) {
    .results-grid {
      grid-template-columns: 1fr;
    }

    .performance-summary {
      grid-template-columns: 1fr;
      gap: 30px;
      text-align: center;
    }

    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .tournament-stats-grid {
      grid-template-columns: 1fr;
    }

    .results-actions {
      flex-direction: column;
    }

    .header-content {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .tournament-info {
      flex-direction: column;
      gap: 5px;
    }
  }
</style>