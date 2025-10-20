<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  // Game states
  let gameState: 'starting' | 'playing' | 'between' | 'finished' = 'starting';
  let currentQuestion: number = 0;
  let score: number = 0;
  let selectedAnswer: number | null = null;
  let timeLeft: number = 20;
  let timer: NodeJS.Timeout | null = null;
  
  // Tournament enhancements
  let streak: number = 0;
  let totalCorrect: number = 0;
  let averageTime: number = 0;
  let powerUps: any[] = [];
  let usedPowerUps: string[] = [];
  
  // Live tournament data
  let tournament: any = null;
  let livePlayers: any[] = [];
  let playerRank: number = 1;
  let questionHistory: any[] = [];

  // Current user
  const currentUser = {
    id: 'user-123',
    username: 'GamePlayer',
    avatar: '😎'
  };

  // Enhanced tournament questions with themes
  const tournamentQuestions = [
    {
      id: 't1',
      question: "Which planet has the most moons in our solar system?",
      options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 20,
      category: "Science",
      difficulty: "medium",
      explanation: "Saturn has over 140 moons, while Jupiter has about 95 confirmed moons."
    },
    {
      id: 't2',
      question: "What year did the Berlin Wall fall?",
      options: ["1987", "1989", "1991", "1985"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 20,
      category: "History",
      difficulty: "medium",
      explanation: "The Berlin Wall fell on November 9, 1989, marking a significant moment in the end of the Cold War."
    },
    {
      id: 't3',
      question: "Which element has the chemical symbol 'Au'?",
      options: ["Silver", "Gold", "Aluminum", "Argon"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 15,
      category: "Science",
      difficulty: "easy",
      explanation: "Au is the chemical symbol for Gold, from the Latin word 'aurum'."
    },
    {
      id: 't4',
      question: "Who directed the movie 'Inception'?",
      options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Quentin Tarantino"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 20,
      category: "Entertainment",
      difficulty: "medium",
      explanation: "Christopher Nolan directed Inception, released in 2010."
    },
    {
      id: 't5',
      question: "What is the largest organ in the human body?",
      options: ["Liver", "Brain", "Skin", "Heart"],
      correctAnswer: 2,
      points: 10,
      timeLimit: 15,
      category: "Science",
      difficulty: "easy",
      explanation: "The skin is the largest organ, with an average area of about 20 square feet."
    }
  ];

  // Power-ups available in tournaments
  const availablePowerUps = [
    {
      id: 'double-points',
      name: 'Double Points',
      icon: '⚡',
      description: 'Double points for next correct answer',
      cost: 0, // Free first use
      uses: 1
    },
    {
      id: 'time-freeze',
      name: 'Time Freeze',
      icon: '⏰',
      description: 'Freeze timer for 5 seconds',
      cost: 5, // Points cost
      uses: 1
    },
    {
      id: 'fifty-fifty',
      name: '50/50',
      icon: '🎯',
      description: 'Remove two wrong answers',
      cost: 3,
      uses: 1
    }
  ];

  onMount(() => {
    if (!browser) return;
    
    loadTournamentData();
    initializePowerUps();
    simulateTournamentStart();
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  function loadTournamentData(): void {
    const tournamentId = $page.params.id;
    
    tournament = {
      id: tournamentId,
      name: 'Mega Monday Championship',
      theme: {
        name: 'General Knowledge',
        color: '#4f46e5',
        icon: '🌍'
      },
      details: {
        prizePool: 25000,
        totalQuestions: tournamentQuestions.length,
        timePerQuestion: 20
      }
    };

    // Initialize live players
    initializeLivePlayers();
  }

  function initializeLivePlayers(): void {
    // Mock tournament players with enhanced stats
    livePlayers = [
      {
        ...currentUser,
        score: 0,
        streak: 0,
        correctAnswers: 0,
        averageTime: 0,
        powerUpsUsed: 0,
        isCurrentPlayer: true
      },
      { id: '2', username: 'TriviaMaster', avatar: '👑', score: 0, streak: 0, correctAnswers: 0, averageTime: 0, powerUpsUsed: 0 },
      { id: '3', username: 'QuizWhiz', avatar: '⭐', score: 0, streak: 0, correctAnswers: 0, averageTime: 0, powerUpsUsed: 0 },
      { id: '4', username: 'BrainBox', avatar: '💡', score: 0, streak: 0, correctAnswers: 0, averageTime: 0, powerUpsUsed: 0 },
      { id: '5', username: 'SuperPlayer', avatar: '🚀', score: 0, streak: 0, correctAnswers: 0, averageTime: 0, powerUpsUsed: 0 },
      { id: '6', username: 'GameExpert', avatar: '🎮', score: 0, streak: 0, correctAnswers: 0, averageTime: 0, powerUpsUsed: 0 },
      { id: '7', username: 'KnowledgeKing', avatar: '🤴', score: 0, streak: 0, correctAnswers: 0, averageTime: 0, powerUpsUsed: 0 },
      { id: '8', username: 'QuickMind', avatar: '⚡', score: 0, streak: 0, correctAnswers: 0, averageTime: 0, powerUpsUsed: 0 }
    ];
  }

  function initializePowerUps(): void {
    powerUps = availablePowerUps.map(powerUp => ({ ...powerUp, available: true }));
  }

  function simulateTournamentStart(): void {
    // 5-second countdown before first question
    gameState = 'starting';
    
    setTimeout(() => {
      startQuestion();
    }, 5000);
  }

  function startQuestion(): void {
    gameState = 'playing';
    selectedAnswer = null;
    timeLeft = tournamentQuestions[currentQuestion].timeLimit;
    startTimer();
  }

  function startTimer(): void {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
      timeLeft--;
      
      if (timeLeft <= 0) {
        handleTimeUp();
      }
    }, 1000);
  }

  function handleTimeUp(): void {
    if (timer) clearInterval(timer);
    
    if (selectedAnswer === null) {
      submitAnswer(-1); // -1 indicates no answer
    }
  }

  function selectAnswer(index: number): void {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = index;
    
    // Auto-submit after short delay
    setTimeout(() => {
      submitAnswer(index);
    }, 800);
  }

  function submitAnswer(answerIndex: number): void {
    if (timer) clearInterval(timer);
    
    const currentQ = tournamentQuestions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    const timeBonus = calculateTimeBonus(timeLeft, currentQ.timeLimit);
    
    // Calculate base points with difficulty multiplier
    const difficultyMultiplier = getDifficultyMultiplier(currentQ.difficulty);
    let pointsEarned = 0;
    
    if (isCorrect) {
      // Base points with difficulty bonus
      pointsEarned = Math.floor(currentQ.points * difficultyMultiplier) + timeBonus;
      
      // Streak bonus
      streak++;
      const streakBonus = calculateStreakBonus(streak);
      pointsEarned += streakBonus;
      
      totalCorrect++;
      
      // Update average time
      const timeUsed = currentQ.timeLimit - timeLeft;
      averageTime = ((averageTime * (currentQuestion)) + timeUsed) / (currentQuestion + 1);
      
      score += pointsEarned;
      
      // Update current player
      updatePlayerStats(pointsEarned, isCorrect, timeUsed);
    } else {
      streak = 0; // Reset streak on wrong answer
    }
    
    // Record question history
    questionHistory.push({
      question: currentQ.question,
      yourAnswer: answerIndex !== -1 ? currentQ.options[answerIndex] : 'No Answer',
      correctAnswer: currentQ.options[currentQ.correctAnswer],
      isCorrect,
      pointsEarned,
      timeUsed: currentQ.timeLimit - timeLeft
    });
    
    // Simulate other players answering
    simulateOtherPlayersAnswers(currentQ, pointsEarned);
    
    // Update rankings
    updateRankings();
    
    // Show results
    gameState = 'between';
    
    // Move to next question after delay
    setTimeout(() => {
      moveToNextQuestion();
    }, 3000);
  }

  function calculateTimeBonus(timeLeft: number, totalTime: number): number {
    const percentageLeft = timeLeft / totalTime;
    const maxBonus = 5;
    
    if (percentageLeft >= 0.8) return maxBonus;
    if (percentageLeft >= 0.6) return 4;
    if (percentageLeft >= 0.4) return 3;
    if (percentageLeft >= 0.2) return 2;
    return 1;
  }

  function getDifficultyMultiplier(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 1.0;
      case 'medium': return 1.2;
      case 'hard': return 1.5;
      default: return 1.0;
    }
  }

  function calculateStreakBonus(currentStreak: number): number {
    if (currentStreak < 3) return 0;
    return Math.min(currentStreak - 2, 5); // Max 5 bonus points
  }

  function updatePlayerStats(pointsEarned: number, isCorrect: boolean, timeUsed: number): void {
    const player = livePlayers.find(p => p.isCurrentPlayer);
    if (player) {
      player.score = score;
      player.streak = streak;
      player.correctAnswers = totalCorrect;
      player.averageTime = averageTime;
    }
  }

  function simulateOtherPlayersAnswers(currentQ: any, playerPoints: number): void {
    livePlayers.forEach(player => {
      if (!player.isCurrentPlayer) {
        // Simulate AI answering
        const aiCorrect = Math.random() > 0.3; // 70% chance correct
        const aiTimeUsed = Math.random() * currentQ.timeLimit * 0.8; // Faster than max time
        
        if (aiCorrect) {
          const aiTimeBonus = calculateTimeBonus(currentQ.timeLimit - aiTimeUsed, currentQ.timeLimit);
          const aiDifficultyMultiplier = getDifficultyMultiplier(currentQ.difficulty);
          let aiPoints = Math.floor(currentQ.points * aiDifficultyMultiplier) + aiTimeBonus;
          
          // Add some randomness to AI scores
          aiPoints += Math.floor(Math.random() * 3);
          
          player.score += aiPoints;
          player.correctAnswers++;
          player.streak = player.streak + 1;
          player.averageTime = ((player.averageTime * currentQuestion) + aiTimeUsed) / (currentQuestion + 1);
        } else {
          player.streak = 0;
        }
      }
    });
  }

  function updateRankings(): void {
    // Sort by score (descending), then by average time (ascending)
    livePlayers.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.averageTime - b.averageTime;
    });
    
    // Update ranks
    livePlayers.forEach((player, index) => {
      player.rank = index + 1;
      if (player.isCurrentPlayer) {
        playerRank = index + 1;
      }
    });
  }

  function moveToNextQuestion(): void {
    if (currentQuestion < tournamentQuestions.length - 1) {
      currentQuestion++;
      startQuestion();
    } else {
      finishTournament();
    }
  }

  function finishTournament(): void {
    gameState = 'finished';
    updateRankings();
    
    // Calculate final prizes
    calculatePrizes();
  }

  function calculatePrizes(): void {
    // In a real app, this would calculate based on final rankings
    const prizeDistribution = [
      { rank: 1, amount: 7500 },
      { rank: 2, amount: 5000 },
      { rank: 3, amount: 3750 },
      { rank: 4, amount: 2500 },
      { rank: 5, amount: 2000 }
    ];
    
    const playerPrize = prizeDistribution.find(p => p.rank === playerRank);
    if (playerPrize) {
      // Store prize info for results page
      sessionStorage.setItem('tournamentPrize', JSON.stringify(playerPrize));
    }
  }

  function usePowerUp(powerUpId: string): void {
    if (usedPowerUps.includes(powerUpId)) return;
    
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp || !powerUp.available) return;
    
    // Apply power-up effect
    switch (powerUpId) {
      case 'double-points':
        // This would be applied on next correct answer
        break;
      case 'time-freeze':
        timeLeft += 5;
        break;
      case 'fifty-fifty':
        // This would remove two wrong options
        break;
    }
    
    usedPowerUps.push(powerUpId);
    powerUp.available = false;
    
    // Update player power-ups used
    const player = livePlayers.find(p => p.isCurrentPlayer);
    if (player) {
      player.powerUpsUsed++;
    }
  }

  function getPowerUpButtonText(powerUp: any): string {
    if (!powerUp.available) return 'Used';
    if (powerUp.cost > 0) return `Use (${powerUp.cost} pts)`;
    return 'Use Free';
  }

  function isPowerUpDisabled(powerUp: any): boolean {
    return !powerUp.available || (powerUp.cost > 0 && score < powerUp.cost);
  }

  function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Science': '#4f46e5',
      'History': '#dc2626',
      'Entertainment': '#ea580c',
      'Geography': '#059669',
      'Sports': '#7c3aed'
    };
    return colors[category] || '#6b7280';
  }

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#6b7280';
    }
  }

  function getCurrentQuestion(): any {
    return tournamentQuestions[currentQuestion];
  }

  function formatTime(seconds: number): string {
    return seconds.toString().padStart(2, '0');
  }

  function getRankSuffix(rank: number): string {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  }

  function viewResults(): void {
    goto(`/nationwide/tournaments/${tournament.id}/results`);
  }

  function exitToLobby(): void {
    goto('/nationwide/tournaments');
  }
</script>

<svelte:head>
  <title>Tournament Game - {tournament?.name} - ChezaNite</title>
</svelte:head>

<div class="tournament-game-container">
  {#if gameState === 'starting'}
    <!-- Tournament Starting Countdown -->
    <div class="starting-screen">
      <div class="countdown-overlay">
        <div class="countdown-animation">
          <div class="countdown-number">3</div>
          <div class="countdown-ring"></div>
        </div>
        <h1>Tournament Starting!</h1>
        <p>Get ready for {tournament.name}</p>
        <div class="tournament-theme">
          <div class="theme-badge" style="background: {tournament.theme.color}">
            <span class="theme-icon">{tournament.theme.icon}</span>
            <span class="theme-name">{tournament.theme.name}</span>
          </div>
        </div>
      </div>
    </div>

  {:else if gameState === 'playing'}
    <!-- Main Game Screen -->
    <div class="game-screen">
      <!-- Enhanced Header -->
      <div class="tournament-header">
        <div class="header-top">
          <div class="tournament-info">
            <h2>{tournament.name}</h2>
            <div class="question-progress">
              Question {currentQuestion + 1} of {tournament.details.totalQuestions}
            </div>
          </div>
          
          <div class="player-stats">
            <div class="stat-item">
              <span class="stat-label">Score</span>
              <span class="stat-value">{score}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Streak</span>
              <span class="stat-value {streak >= 3 ? 'hot' : ''}">{streak}🔥</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Rank</span>
              <span class="stat-value">#{playerRank}</span>
            </div>
          </div>
        </div>

        <!-- Power-ups Bar -->
        <div class="power-ups-bar">
          <h4>🎯 Power Ups</h4>
          <div class="power-ups-list">
            {#each powerUps as powerUp}
              <button
                class="power-up-btn {!powerUp.available ? 'used' : ''}"
                on:click={() => usePowerUp(powerUp.id)}
                disabled={isPowerUpDisabled(powerUp)}
                title={powerUp.description}
              >
                <span class="power-up-icon">{powerUp.icon}</span>
                <span class="power-up-name">{powerUp.name}</span>
                <span class="power-up-cost">
                  {#if powerUp.cost > 0}
                    {powerUp.cost} pts
                  {:else}
                    FREE
                  {/if}
                </span>
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div class="game-content">
        <!-- Left: Question & Options -->
        <div class="question-section">
          <div class="question-card">
            <!-- Question Meta -->
            <div class="question-meta">
              <div class="category-tag" style="background: {getCategoryColor(getCurrentQuestion().category)}">
                {getCurrentQuestion().category}
              </div>
              <div class="difficulty-tag" style="background: {getDifficultyColor(getCurrentQuestion().difficulty)}">
                {getCurrentQuestion().difficulty}
              </div>
              <div class="timer-display {timeLeft <= 5 ? 'warning' : ''}">
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>

            <!-- Question -->
            <h2 class="question-text">{getCurrentQuestion().question}</h2>

            <!-- Options -->
            <div class="options-grid">
              {#each getCurrentQuestion().options as option, index (index)}
                <button
                  class="option-card {selectedAnswer === index ? 'selected' : ''}"
                  on:click={() => selectAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <div class="option-content">
                    <div class="option-letter">{String.fromCharCode(65 + index)}</div>
                    <div class="option-text">{option}</div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Right: Live Tournament Leaderboard -->
        <div class="leaderboard-section">
          <div class="leaderboard-card">
            <div class="leaderboard-header">
              <h3>🏆 Live Tournament Rank</h3>
              <div class="leaderboard-stats">
                <span class="stat">{livePlayers.length} Players</span>
                <span class="stat">Q{currentQuestion + 1}/{tournament.details.totalQuestions}</span>
              </div>
            </div>

            <div class="leaderboard-list">
              {#each livePlayers.slice(0, 8) as player}
                <div class="leaderboard-item {player.isCurrentPlayer ? 'current-player' : ''} {player.rank <= 3 ? 'podium' : ''}">
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
                    {#if player.isCurrentPlayer}
                      <span class="you-badge">YOU</span>
                    {/if}
                  </div>

                  <div class="player-stats-compact">
                    <div class="player-score">{player.score}</div>
                    <div class="player-streak {player.streak >= 3 ? 'hot' : ''}">
                      {player.streak}🔥
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Current Player Highlight -->
            <div class="current-player-highlight">
              <div class="highlight-content">
                <div class="highlight-rank">
                  Your Rank: <strong>#{playerRank}</strong>
                </div>
                <div class="highlight-stats">
                  <span>{totalCorrect}/{currentQuestion + 1} correct</span>
                  <span>Avg: {averageTime.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if gameState === 'between'}
    <!-- Between Questions Results -->
    <div class="between-screen">
      <div class="results-overlay">
        {#if selectedAnswer === getCurrentQuestion().correctAnswer}
          <div class="result-success">
            <div class="result-animation">
              <div class="success-icon">🎉</div>
              <div class="confetti"></div>
            </div>
            <h1>Correct! +{calculateTimeBonus(timeLeft, getCurrentQuestion().timeLimit) + getCurrentQuestion().points} points</h1>
            <p class="explanation">{getCurrentQuestion().explanation}</p>
            
            <!-- Streak Bonus -->
            {#if streak >= 3}
              <div class="streak-bonus">
                <div class="streak-fire">🔥</div>
                <span>+{calculateStreakBonus(streak)} streak bonus!</span>
              </div>
            {/if}
          </div>
        {:else if selectedAnswer === -1}
          <div class="result-timeout">
            <div class="result-icon">⏰</div>
            <h1>Time's Up!</h1>
            <p class="correct-answer">
              Correct answer: <strong>{getCurrentQuestion().options[getCurrentQuestion().correctAnswer]}</strong>
            </p>
            <p class="explanation">{getCurrentQuestion().explanation}</p>
          </div>
        {:else}
          <div class="result-incorrect">
            <div class="result-icon">💡</div>
            <h1>Not Quite</h1>
            <p class="correct-answer">
              Correct answer: <strong>{getCurrentQuestion().options[getCurrentQuestion().correctAnswer]}</strong>
            </p>
            <p class="explanation">{getCurrentQuestion().explanation}</p>
          </div>
        {/if}

        <!-- Live Ranking Update -->
        <div class="ranking-update">
          <h3>📊 Ranking Update</h3>
          <div class="ranking-preview">
            {#each livePlayers.slice(0, 5) as player}
              <div class="ranking-preview-item {player.isCurrentPlayer ? 'current' : ''}">
                <span class="preview-rank">#{player.rank}</span>
                <span class="preview-name">{player.username}</span>
                <span class="preview-score">{player.score}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="next-question-countdown">
          <div class="countdown-loader"></div>
          <p>Next question in <span class="countdown-text">3</span> seconds</p>
        </div>
      </div>
    </div>

  {:else if gameState === 'finished'}
    <!-- Tournament Finished -->
    <div class="finished-screen">
      <div class="results-container">
        <div class="tournament-complete">
          <div class="completion-animation">
            <div class="trophy">🏆</div>
            <div class="confetti-large"></div>
          </div>
          
          <h1>Tournament Complete!</h1>
          <p class="tournament-name">{tournament.name}</p>

          <!-- Final Rank & Score -->
          <div class="final-results">
            <div class="final-rank {playerRank <= 3 ? 'podium-finish' : ''}">
              <div class="rank-badge-final">
                <span class="rank-number">{playerRank}</span>
                <span class="rank-label">{getRankSuffix(playerRank)} Place</span>
              </div>
              <p class="rank-out-of">Out of {livePlayers.length} players</p>
            </div>

            <div class="final-score">
              <span class="score-value">{score}</span>
              <span class="score-label">Total Points</span>
            </div>
          </div>

          <!-- Performance Summary -->
          <div class="performance-summary">
            <h3>Your Performance</h3>
            <div class="performance-stats">
              <div class="perf-stat">
                <div class="perf-value">{totalCorrect}/{tournament.details.totalQuestions}</div>
                <div class="perf-label">Correct Answers</div>
              </div>
              <div class="perf-stat">
                <div class="perf-value">{Math.round((totalCorrect / tournament.details.totalQuestions) * 100)}%</div>
                <div class="perf-label">Accuracy</div>
              </div>
              <div class="perf-stat">
                <div class="perf-value">{averageTime.toFixed(1)}s</div>
                <div class="perf-label">Avg. Time</div>
              </div>
              <div class="perf-stat">
                <div class="perf-value">{streak}</div>
                <div class="perf-label">Best Streak</div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="results-actions">
            <button class="action-btn primary" on:click={viewResults}>
              View Detailed Results
            </button>
            <button class="action-btn secondary" on:click={exitToLobby}>
              Back to Tournaments
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .tournament-game-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    color: white;
    padding: 0;
  }

  /* Starting Screen */
  .starting-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .countdown-overlay {
    text-align: center;
  }

  .countdown-animation {
    position: relative;
    margin-bottom: 30px;
  }

  .countdown-number {
    font-size: 6rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 20px;
  }

  .countdown-ring {
    width: 200px;
    height: 200px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #ffd700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    margin-top: 20px;
  }

  /* Game Screen */
  .game-screen {
    min-height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .tournament-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .tournament-info h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #ffd700;
  }

  .question-progress {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .player-stats {
    display: flex;
    gap: 20px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #ffd700;
  }

  .stat-value.hot {
    color: #ff6b6b;
  }

  .power-ups-bar {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 15px;
  }

  .power-ups-bar h4 {
    margin: 0 0 10px 0;
    font-size: 1rem;
  }

  .power-ups-list {
    display: flex;
    gap: 10px;
  }

  .power-up-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 8px 12px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
  }

  .power-up-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .power-up-btn.used {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .power-up-btn:disabled:not(.used) {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .power-up-icon {
    font-size: 1rem;
  }

  .power-up-name {
    font-weight: 600;
  }

  .power-up-cost {
    font-size: 0.7rem;
    opacity: 0.8;
  }

  .game-content {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 20px;
    flex: 1;
  }

  .question-section {
    display: flex;
    flex-direction: column;
  }

  .question-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .question-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    align-items: center;
  }

  .category-tag, .difficulty-tag {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .timer-display {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.2);
    padding: 6px 12px;
    border-radius: 15px;
    font-weight: 700;
  }

  .timer-display.warning {
    background: #f44336;
    animation: pulse 1s infinite;
  }

  .question-text {
    font-size: 1.8rem;
    line-height: 1.4;
    margin-bottom: 30px;
    flex: 1;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .option-card {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 18px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .option-card:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .option-card.selected {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
  }

  .option-card:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .option-content {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .option-letter {
    width: 35px;
    height: 35px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .option-card.selected .option-letter {
    background: #ffd700;
    color: #1a237e;
  }

  .option-text {
    flex: 1;
    font-size: 1.1rem;
  }

  /* Leaderboard */
  .leaderboard-section {
    position: sticky;
    top: 20px;
  }

  .leaderboard-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    height: fit-content;
  }

  .leaderboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .leaderboard-header h3 {
    margin: 0;
    color: #ffd700;
  }

  .leaderboard-stats {
    display: flex;
    gap: 10px;
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
    max-height: 400px;
    overflow-y: auto;
  }

  .leaderboard-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
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

  .player-rank {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  .player-rank.rank-1 {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
  }

  .player-rank.rank-2 {
    background: linear-gradient(45deg, #c0c0c0, #e0e0e0);
    color: #1a237e;
  }

  .player-rank.rank-3 {
    background: linear-gradient(45deg, #cd7f32, #e3964a);
    color: white;
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

  .you-badge {
    background: #ffd700;
    color: #1a237e;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .player-stats-compact {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .player-score {
    font-weight: 700;
    color: #ffd700;
  }

  .player-streak {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .player-streak.hot {
    color: #ff6b6b;
  }

  .current-player-highlight {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid #ffd700;
    border-radius: 10px;
    padding: 15px;
  }

  .highlight-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .highlight-rank {
    font-weight: 600;
  }

  .highlight-stats {
    display: flex;
    gap: 10px;
    font-size: 0.8rem;
    opacity: 0.8;
  }

  /* Between Questions Screen */
  .between-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .results-overlay {
    background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    max-width: 600px;
    width: 90%;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .result-success, .result-timeout, .result-incorrect {
    margin-bottom: 30px;
  }

  .result-animation {
    position: relative;
    margin-bottom: 20px;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 15px;
  }

  .confetti {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.5rem;
    animation: confetti-fall 2s ease-in-out;
  }

  .streak-bonus {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(255, 107, 107, 0.2);
    padding: 10px;
    border-radius: 10px;
    margin: 15px 0;
  }

  .streak-fire {
    font-size: 1.5rem;
  }

  .result-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .explanation, .correct-answer {
    opacity: 0.9;
    line-height: 1.4;
    margin: 10px 0;
  }

  .ranking-update {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
  }

  .ranking-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ranking-preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .ranking-preview-item.current {
    background: rgba(255, 215, 0, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    border-bottom: none;
  }

  .ranking-preview-item:last-child {
    border-bottom: none;
  }

  .preview-rank {
    font-weight: 700;
    color: #ffd700;
  }

  .preview-name {
    flex: 1;
    text-align: left;
    margin-left: 10px;
  }

  .preview-score {
    font-weight: 600;
  }

  .next-question-countdown {
    margin-top: 20px;
  }

  .countdown-loader {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #ffd700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
  }

  .countdown-text {
    font-weight: 700;
    color: #ffd700;
  }

  /* Finished Screen */
  .finished-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  .results-container {
    max-width: 800px;
    width: 100%;
    text-align: center;
  }

  .tournament-complete {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .completion-animation {
    position: relative;
    margin-bottom: 30px;
  }

  .trophy {
    font-size: 5rem;
    margin-bottom: 20px;
  }

  .confetti-large {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    animation: confetti-fall 3s ease-in-out;
  }

  .tournament-complete h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #fff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tournament-name {
    font-size: 1.2rem;
    opacity: 0.8;
    margin-bottom: 30px;
  }

  .final-results {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  .final-rank.podium-finish {
    transform: scale(1.1);
  }

  .rank-badge-final {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 4px solid rgba(255, 255, 255, 0.3);
  }

  .final-rank.podium-finish .rank-badge-final {
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
  }

  .final-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 5px;
  }

  .score-label {
    opacity: 0.8;
  }

  .performance-summary {
    margin-bottom: 40px;
  }

  .performance-summary h3 {
    margin-bottom: 20px;
    color: #ffd700;
  }

  .performance-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }

  .perf-stat {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 10px;
  }

  .perf-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 5px;
  }

  .perf-label {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .results-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .action-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 25px;
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
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .action-btn.secondary:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes confetti-fall {
    0% { transform: translateX(-50%) translateY(-20px) rotate(0deg); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(-50%) translateY(100px) rotate(360deg); opacity: 0; }
  }

  /* Responsive Design */
  @media (max-width: 968px) {
    .game-content {
      grid-template-columns: 1fr;
    }

    .leaderboard-section {
      position: static;
    }

    .header-top {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .player-stats {
      justify-content: center;
    }

    .final-results {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .performance-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .results-actions {
      flex-direction: column;
    }
  }

  @media (max-width: 768px) {
    .game-screen {
      padding: 15px;
    }

    .question-card {
      padding: 20px;
    }

    .question-text {
      font-size: 1.4rem;
    }

    .power-ups-list {
      flex-wrap: wrap;
    }

    .results-overlay {
      padding: 30px 20px;
    }

    .tournament-complete {
      padding: 30px 20px;
    }
  }
</style>