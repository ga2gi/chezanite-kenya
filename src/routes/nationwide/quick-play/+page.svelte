<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  
  // Game states
  let gameState: 'waiting' | 'playing' | 'finished' | 'ranking' = 'waiting';
  let currentQuestion: number = 0;
  let score: number = 0;
  let selectedAnswer: number | null = null;
  let timeLeft: number = 15;
  let timer: NodeJS.Timeout | null = null;
  
  // Live ranking
  let livePlayers: any[] = [];
  let playerRank: number = 1;
  let roomId: string = '';

  // Current user
  const currentUser = {
    id: 'current-player',
    username: 'You',
    avatar: '😎'
  };

  // Questions database
  const questions = [
    {
      id: '1',
      question: "What is the capital city of Kenya?",
      options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 15
    },
    {
      id: '2',
      question: "Which mountain is the highest in Kenya?",
      options: ["Mount Kilimanjaro", "Mount Kenya", "Mount Elgon", "Mount Longonot"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 15
    },
    {
      id: '3',
      question: "What is the official language of Kenya?",
      options: ["Swahili", "English", "Kikuyu", "Luo"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 15
    },
    {
      id: '4',
      question: "Which lake is the largest in Kenya?",
      options: ["Lake Victoria", "Lake Turkana", "Lake Naivasha", "Lake Baringo"],
      correctAnswer: 0,
      points: 10,
      timeLimit: 15
    },
    {
      id: '5',
      question: "What year did Kenya gain independence?",
      options: ["1960", "1963", "1965", "1970"],
      correctAnswer: 1,
      points: 10,
      timeLimit: 15
    }
  ];

  onMount(() => {
    if (!browser) return;
    
    roomId = `quickplay-${Date.now()}`;
    initializeGame();
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  function initializeGame(): void {
    // Add current player
    livePlayers = [{
      ...currentUser,
      score: 0,
      isCurrentPlayer: true,
      connected: true,
      rank: 1
    }];

    // Add mock players
    const mockPlayers = [
      { id: 'player-1', username: 'SuperPlayer', avatar: '🚀', score: 12, isCurrentPlayer: false, connected: true },
      { id: 'player-2', username: 'GameMaster', avatar: '🎮', score: 18, isCurrentPlayer: false, connected: true },
      { id: 'player-3', username: 'TriviaKing', avatar: '👑', score: 15, isCurrentPlayer: false, connected: true },
      { id: 'player-4', username: 'QuizWhiz', avatar: '⭐', score: 8, isCurrentPlayer: false, connected: true },
      { id: 'player-5', username: 'BrainBox', avatar: '💡', score: 22, isCurrentPlayer: false, connected: true },
      { id: 'player-6', username: 'SmartCookie', avatar: '🍪', score: 14, isCurrentPlayer: false, connected: true },
    ];

    livePlayers = [...livePlayers, ...mockPlayers];
    updateRankings();

    // Start game after delay
    setTimeout(() => {
      startGame();
    }, 3000);
  }

  function startGame(): void {
    gameState = 'playing';
    startTimer();
  }

  function startTimer(): void {
    timeLeft = questions[currentQuestion].timeLimit;
    
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
      submitAnswer(-1);
    }
  }

  function selectAnswer(index: number): void {
    if (selectedAnswer !== null) return;
    selectedAnswer = index;
    
    setTimeout(() => {
      submitAnswer(index);
    }, 1000);
  }

  function submitAnswer(answerIndex: number): void {
    if (timer) clearInterval(timer);
    
    const currentQ = questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    let pointsEarned = 0;
    
    if (isCorrect) {
      const timeBonus = calculateTimeBonus(timeLeft, currentQ.timeLimit);
      pointsEarned = currentQ.points + timeBonus;
      score += pointsEarned;
      
      // Update current player score
      livePlayers = livePlayers.map(player => 
        player.isCurrentPlayer ? { ...player, score } : player
      );
    }
    
    // Simulate other players answering
    livePlayers = livePlayers.map(player => {
      if (!player.isCurrentPlayer && Math.random() > 0.4) {
        const pointsGained = Math.floor(Math.random() * 8) + 2;
        return { ...player, score: player.score + pointsGained };
      }
      return player;
    });
    
    updateRankings();
    gameState = 'ranking';
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 2500);
  }

  function calculateTimeBonus(timeLeft: number, totalTime: number): number {
    const percentageLeft = timeLeft / totalTime;
    if (percentageLeft >= 0.8) return 5;
    if (percentageLeft >= 0.6) return 4;
    if (percentageLeft >= 0.4) return 3;
    if (percentageLeft >= 0.2) return 2;
    return 1;
  }

  function updateRankings(): void {
    livePlayers.sort((a, b) => b.score - a.score);
    livePlayers.forEach((player, index) => {
      player.rank = index + 1;
      if (player.isCurrentPlayer) {
        playerRank = index + 1;
      }
    });
  }

  function moveToNextQuestion(): void {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      selectedAnswer = null;
      gameState = 'playing';
      startTimer();
    } else {
      finishGame();
    }
  }

  function finishGame(): void {
    gameState = 'finished';
    updateRankings();
  }

  function playAgain(): void {
    // Reset game
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    gameState = 'waiting';
    playerRank = livePlayers.length;
    
    // Reset scores but keep players
    livePlayers = livePlayers.map(player => ({
      ...player,
      score: player.isCurrentPlayer ? 0 : Math.floor(Math.random() * 5)
    }));
    
    updateRankings();
    
    setTimeout(() => {
      startGame();
    }, 3000);
  }

  function exitToLobby(): void {
    goto('/nationwide');
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

  // Get player trend (up/down)
  function getPlayerTrend(player: any): string {
    // Simple simulation - in real app, compare with previous rank
    return Math.random() > 0.5 ? 'up' : 'down';
  }
</script>

<svelte:head>
  <title>Quick Play - ChezaNite</title>
</svelte:head>

<div class="quickplay-container">
  {#if gameState === 'waiting'}
    <!-- Waiting Screen -->
    <div class="waiting-screen">
      <div class="waiting-content">
        <div class="loading-spinner"></div>
        <h1>Finding Opponents...</h1>
        <p class="room-info">Room: <strong>{roomId}</strong></p>
        
        <div class="connected-players">
          <h3>Players Ready ({livePlayers.length})</h3>
          <div class="players-grid">
            {#each livePlayers as player}
              <div class="player-card {player.isCurrentPlayer ? 'current-player' : ''}">
                <div class="player-avatar">{player.avatar}</div>
                <div class="player-info">
                  <div class="player-name">{player.username}</div>
                  <div class="player-status {player.connected ? 'online' : 'offline'}">
                    {#if player.connected}
                      <span class="status-dot"></span> Online
                    {:else}
                      <span class="status-dot offline"></span> Offline
                    {/if}
                  </div>
                </div>
                {#if player.isCurrentPlayer}
                  <div class="you-badge">YOU</div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
        
        <div class="countdown-message">
          <p>Game starting in <span class="countdown-number">3</span> seconds...</p>
        </div>
      </div>
    </div>

  {:else if gameState === 'playing'}
    <!-- Game Screen -->
    <div class="game-screen">
      <!-- Game Header -->
      <div class="game-header">
        <div class="header-content">
          <div class="score-section">
            <div class="score-label">SCORE</div>
            <div class="score-value">{score}</div>
          </div>
          
          <div class="timer-section {timeLeft <= 5 ? 'warning' : ''}">
            <div class="timer-circle">
              <svg class="timer-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" class="timer-bg"></circle>
                <circle cx="50" cy="50" r="45" class="timer-progress" 
                        stroke-dasharray="283"
                        stroke-dashoffset="{283 * (1 - timeLeft/questions[currentQuestion].timeLimit)}">
                </circle>
              </svg>
              <div class="timer-text">{formatTime(timeLeft)}</div>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="question-progress">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {((currentQuestion + 1) / questions.length) * 100}%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Section -->
      <div class="question-section">
        <div class="question-card">
          <h2 class="question-text">{questions[currentQuestion].question}</h2>
          
          <div class="options-grid">
            {#each questions[currentQuestion].options as option, index (index)}
              <button
                class="option-card {selectedAnswer === index ? 'selected' : ''}
                       {selectedAnswer !== null && index === questions[currentQuestion].correctAnswer ? 'correct' : ''}
                       {selectedAnswer === index && selectedAnswer !== questions[currentQuestion].correctAnswer ? 'incorrect' : ''}"
                on:click={() => selectAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <div class="option-content">
                  <div class="option-letter">{String.fromCharCode(65 + index)}</div>
                  <div class="option-text">{option}</div>
                  {#if selectedAnswer !== null}
                    <div class="option-result">
                      {#if index === questions[currentQuestion].correctAnswer}
                        <div class="result-icon correct">✓</div>
                      {:else if selectedAnswer === index}
                        <div class="result-icon incorrect">✗</div>
                      {/if}
                    </div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Live Ranking -->
      <div class="live-ranking-section">
        <div class="ranking-header">
          <h3>🏆 LIVE RANKING</h3>
          <div class="ranking-stats">
            <span class="your-rank">Your Rank: #{playerRank}</span>
          </div>
        </div>
        
        <div class="ranking-list">
          {#each livePlayers.slice(0, 5) as player}
            <div class="ranking-item {player.isCurrentPlayer ? 'current-player' : ''} {player.rank <= 3 ? 'podium' : ''}">
              <div class="rank-badge {player.rank <= 3 ? `rank-${player.rank}` : ''}">
                {#if player.rank <= 3}
                  {#if player.rank === 1}🥇
                  {:else if player.rank === 2}🥈
                  {:else if player.rank === 3}🥉
                  {/if}
                {:else}
                  #{player.rank}
                {/if}
              </div>
              
              <div class="player-display">
                <span class="player-avatar">{player.avatar}</span>
                <span class="player-name">{player.username}</span>
                {#if player.isCurrentPlayer}
                  <span class="you-indicator">(You)</span>
                {/if}
              </div>
              
              <div class="player-score">{player.score}</div>
              
              <div class="trend-indicator {getPlayerTrend(player)}">
                {#if getPlayerTrend(player) === 'up'}
                  ↗
                {:else}
                  ↘
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

  {:else if gameState === 'ranking'}
    <!-- Ranking Screen (Between Questions) -->
    <div class="ranking-screen">
      <div class="ranking-content">
        <!-- Result Header -->
        <div class="result-header">
          {#if selectedAnswer === questions[currentQuestion].correctAnswer}
            <div class="result-success">
              <div class="result-icon">🎉</div>
              <h1>Correct Answer!</h1>
              <div class="points-earned">
                +{questions[currentQuestion].points} points
                {#if timeLeft > 0}
                  <span class="time-bonus">+{calculateTimeBonus(timeLeft, questions[currentQuestion].timeLimit)} time bonus</span>
                {/if}
              </div>
            </div>
          {:else if selectedAnswer === -1}
            <div class="result-timeout">
              <div class="result-icon">⏰</div>
              <h1>Time's Up!</h1>
              <p class="correct-answer">
                The correct answer was: <strong>{questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}</strong>
              </p>
            </div>
          {:else}
            <div class="result-incorrect">
              <div class="result-icon">💡</div>
              <h1>Nice Try!</h1>
              <p class="correct-answer">
                Correct answer: <strong>{questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}</strong>
              </p>
            </div>
          {/if}
        </div>

        <!-- Live Ranking Update -->
        <div class="ranking-update">
          <h2>📊 Ranking Update</h2>
          <div class="ranking-list-large">
            {#each livePlayers.slice(0, 8) as player}
              <div class="ranking-item-large {player.isCurrentPlayer ? 'current-player' : ''}">
                <div class="rank-section">
                  <div class="rank-number {player.rank <= 3 ? 'top-three' : ''}">
                    {player.rank}
                  </div>
                  <div class="rank-change {getPlayerTrend(player)}">
                    {#if getPlayerTrend(player) === 'up'}↗{:else}↘{/if}
                  </div>
                </div>
                
                <div class="player-section">
                  <span class="player-avatar">{player.avatar}</span>
                  <span class="player-name">{player.username}</span>
                  {#if player.isCurrentPlayer}
                    <span class="you-tag">YOU</span>
                  {/if}
                </div>
                
                <div class="score-section">
                  <span class="score-value">{player.score}</span>
                  <span class="score-label">pts</span>
                </div>
              </div>
            {/each}
          </div>
          
          <div class="current-rank-display">
            You are currently <strong>{playerRank}{getRankSuffix(playerRank)}</strong> out of {livePlayers.length} players
          </div>
        </div>

        <div class="next-question-countdown">
          <div class="countdown-loader"></div>
          <p>Next question in <span class="countdown-text">2</span> seconds</p>
        </div>
      </div>
    </div>

  {:else if gameState === 'finished'}
    <!-- Final Results Screen -->
    <div class="results-screen">
      <div class="results-content">
        <!-- Final Results Header -->
        <div class="final-header">
          <h1>Game Complete! 🎉</h1>
          <p class="game-summary">You've completed all {questions.length} questions</p>
        </div>

        <!-- Final Score & Rank -->
        <div class="final-stats">
          <div class="score-display-final">
            <div class="score-circle">
              <span class="score-value-final">{score}</span>
              <span class="score-label-final">Total Points</span>
            </div>
          </div>
          
          <div class="rank-display-final">
            <div class="rank-badge-final {playerRank <= 3 ? 'top-rank' : ''}">
              <span class="rank-number-final">{playerRank}</span>
              <span class="rank-label-final">{getRankSuffix(playerRank)} Place</span>
            </div>
            <p class="rank-out-of">Out of {livePlayers.length} players</p>
          </div>
        </div>

        <!-- Performance Stats -->
        <div class="performance-stats">
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">{Math.floor(score / 10)}/{questions.length}</div>
              <div class="stat-label">Correct Answers</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{Math.round((score / 10 / questions.length) * 100)}%</div>
              <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{livePlayers.length}</div>
              <div class="stat-label">Players</div>
            </div>
          </div>
        </div>

        <!-- Final Leaderboard -->
        <div class="final-leaderboard">
          <h2>🏆 Final Leaderboard</h2>
          <div class="leaderboard-container">
            {#each livePlayers as player}
              <div class="leaderboard-item {player.isCurrentPlayer ? 'current-player' : ''} {player.rank <= 3 ? 'podium-item' : ''}">
                <div class="leaderboard-rank {player.rank <= 3 ? `rank-${player.rank}` : ''}">
                  {#if player.rank <= 3}
                    {#if player.rank === 1}🥇
                    {:else if player.rank === 2}🥈
                    {:else if player.rank === 3}🥉
                    {/if}
                  {:else}
                    #{player.rank}
                  {/if}
                </div>
                
                <div class="leaderboard-player">
                  <span class="player-avatar">{player.avatar}</span>
                  <span class="player-name">{player.username}</span>
                  {#if player.isCurrentPlayer}
                    <span class="you-badge-leaderboard">You</span>
                  {/if}
                </div>
                
                <div class="leaderboard-score">
                  <span class="score-value">{player.score}</span>
                  <span class="score-label">points</span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons-final">
          <button class="play-again-btn" on:click={playAgain}>
            <span class="btn-icon">🔄</span>
            Play Again
          </button>
          <button class="lobby-btn" on:click={exitToLobby}>
            <span class="btn-icon">🏠</span>
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Base Styles */
  .quickplay-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 0;
  }

  /* Waiting Screen Styles */
  .waiting-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  .waiting-content {
    text-align: center;
    max-width: 600px;
    width: 100%;
  }

  .loading-spinner {
    width: 80px;
    height: 80px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #ffd700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 30px;
  }

  .waiting-content h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #fff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .room-info {
    opacity: 0.8;
    margin-bottom: 30px;
    font-size: 1.1rem;
  }

  .connected-players {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 30px;
    margin: 30px 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .connected-players h3 {
    margin-bottom: 20px;
    font-size: 1.3rem;
    color: #ffd700;
  }

  .players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .player-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }

  .player-card.current-player {
    background: rgba(255, 215, 0, 0.2);
    border-color: #ffd700;
    transform: scale(1.05);
  }

  .player-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
  }

  .player-avatar {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .player-status {
    font-size: 0.8rem;
    opacity: 0.7;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    background: #4caf50;
    border-radius: 50%;
  }

  .status-dot.offline {
    background: #f44336;
  }

  .you-badge {
    background: #ffd700;
    color: #1a237e;
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .countdown-message {
    margin-top: 20px;
  }

  .countdown-number {
    font-weight: 700;
    color: #ffd700;
    font-size: 1.2rem;
  }

  /* Game Screen Styles */
  .game-screen {
    min-height: 100vh;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .game-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header-content {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 30px;
  }

  .score-section {
    text-align: left;
  }

  .score-label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  .score-value {
    font-size: 2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .timer-section {
    display: flex;
    justify-content: center;
  }

  .timer-circle {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .timer-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .timer-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 8;
  }

  .timer-progress {
    fill: none;
    stroke: #ffd700;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear;
  }

  .timer-section.warning .timer-progress {
    stroke: #ff6b6b;
    animation: pulse 1s infinite;
  }

  .timer-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.2rem;
    font-weight: 700;
  }

  .progress-section {
    text-align: right;
  }

  .question-progress {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 8px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffd700, #ffed4a);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .question-section {
    margin-bottom: 30px;
  }

  .question-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .question-text {
    font-size: 1.8rem;
    line-height: 1.4;
    margin-bottom: 40px;
    text-align: center;
    font-weight: 600;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    max-width: 600px;
    margin: 0 auto;
  }

  .option-card {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 15px;
    padding: 20px;
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

  .option-card.correct {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
  }

  .option-card.incorrect {
    border-color: #f44336;
    background: rgba(244, 67, 54, 0.1);
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
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .option-card.selected .option-letter {
    background: #ffd700;
    color: #1a237e;
  }

  .option-card.correct .option-letter {
    background: #4caf50;
    color: white;
  }

  .option-text {
    flex: 1;
    font-size: 1.1rem;
  }

  .option-result {
    margin-left: auto;
  }

  .result-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .result-icon.correct {
    background: #4caf50;
    color: white;
  }

  .result-icon.incorrect {
    background: #f44336;
    color: white;
  }

  .live-ranking-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .ranking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .ranking-header h3 {
    margin: 0;
    color: #ffd700;
  }

  .your-rank {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 15px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .ranking-item.current-player {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
  }

  .ranking-item.podium {
    background: rgba(255, 215, 0, 0.1);
  }

  .rank-badge {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.2);
  }

  .rank-badge.rank-1 {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
  }

  .rank-badge.rank-2 {
    background: linear-gradient(45deg, #c0c0c0, #e0e0e0);
    color: #1a237e;
  }

  .rank-badge.rank-3 {
    background: linear-gradient(45deg, #cd7f32, #e3964a);
    color: white;
  }

  .player-display {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .player-avatar {
    font-size: 1.2rem;
  }

  .player-name {
    font-weight: 600;
  }

  .you-indicator {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .player-score {
    font-weight: 700;
    color: #ffd700;
    font-size: 1.1rem;
  }

  .trend-indicator {
    font-size: 0.9rem;
  }

  .trend-indicator.up {
    color: #4caf50;
  }

  .trend-indicator.down {
    color: #f44336;
  }

  /* Ranking Screen Styles */
  .ranking-screen {
    min-height: 100vh;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ranking-content {
    max-width: 600px;
    width: 100%;
    text-align: center;
  }

  .result-header {
    margin-bottom: 40px;
  }

  .result-success, .result-timeout, .result-incorrect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    border: 2px solid;
  }

  .result-success {
    border-color: #4caf50;
  }

  .result-timeout {
    border-color: #ff9800;
  }

  .result-incorrect {
    border-color: #f44336;
  }

  .result-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .result-header h1 {
    font-size: 2rem;
    margin-bottom: 15px;
  }

  .points-earned {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffd700;
  }

  .time-bonus {
    display: block;
    font-size: 1rem;
    color: #4caf50;
    margin-top: 5px;
  }

  .correct-answer {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .ranking-update {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 30px;
    margin: 30px 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .ranking-update h2 {
    margin-bottom: 20px;
    color: #ffd700;
  }

  .ranking-list-large {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .ranking-item-large {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
  }

  .ranking-item-large.current-player {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
  }

  .rank-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rank-number {
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .rank-number.top-three {
    background: #ffd700;
    color: #1a237e;
  }

  .rank-change {
    font-size: 0.8rem;
  }

  .rank-change.up {
    color: #4caf50;
  }

  .rank-change.down {
    color: #f44336;
  }

  .player-section {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .you-tag {
    background: #ffd700;
    color: #1a237e;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .score-section {
    text-align: right;
  }

  .score-value {
    font-weight: 700;
    color: #ffd700;
    font-size: 1.1rem;
  }

  .score-label {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-left: 2px;
  }

  .current-rank-display {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .next-question-countdown {
    margin-top: 30px;
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

  /* Results Screen Styles */
  .results-screen {
    min-height: 100vh;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .results-content {
    max-width: 800px;
    width: 100%;
    text-align: center;
  }

  .final-header h1 {
    font-size: 3rem;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #fff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .game-summary {
    font-size: 1.2rem;
    opacity: 0.8;
    margin-bottom: 40px;
  }

  .final-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  .score-circle {
    width: 150px;
    height: 150px;
    border: 5px solid #ffd700;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  .score-value-final {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffd700;
  }

  .score-label-final {
    font-size: 0.9rem;
    opacity: 0.8;
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

  .rank-badge-final.top-rank {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
  }

  .rank-number-final {
    font-size: 2rem;
    font-weight: 700;
  }

  .rank-label-final {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .rank-out-of {
    opacity: 0.7;
  }

  .performance-stats {
    margin-bottom: 40px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 400px;
    margin: 0 auto;
  }

  .stat-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 5px;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .final-leaderboard {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .final-leaderboard h2 {
    margin-bottom: 25px;
    color: #ffd700;
  }

  .leaderboard-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .leaderboard-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
  }

  .leaderboard-item.current-player {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #ffd700;
  }

  .leaderboard-item.podium-item {
    background: rgba(255, 215, 0, 0.1);
  }

  .leaderboard-rank {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.2);
  }

  .leaderboard-rank.rank-1 {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
  }

  .leaderboard-rank.rank-2 {
    background: linear-gradient(45deg, #c0c0c0, #e0e0e0);
    color: #1a237e;
  }

  .leaderboard-rank.rank-3 {
    background: linear-gradient(45deg, #cd7f32, #e3964a);
    color: white;
  }

  .leaderboard-player {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .you-badge-leaderboard {
    background: #ffd700;
    color: #1a237e;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .leaderboard-score {
    text-align: right;
  }

  .action-buttons-final {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .play-again-btn, .lobby-btn {
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .play-again-btn {
    background: #ffd700;
    color: #1a237e;
  }

  .play-again-btn:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  .lobby-btn {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .lobby-btn:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-icon {
    font-size: 1.2rem;
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

  /* Responsive Design */
  @media (max-width: 768px) {
    .header-content {
      grid-template-columns: 1fr;
      gap: 20px;
      text-align: center;
    }

    .score-section, .progress-section {
      text-align: center;
    }

    .question-text {
      font-size: 1.4rem;
    }

    .options-grid {
      grid-template-columns: 1fr;
    }

    .players-grid {
      grid-template-columns: 1fr;
    }

    .final-stats {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .stat-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .action-buttons-final {
      flex-direction: column;
    }

    .ranking-header {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .game-header, .question-card, .live-ranking-section {
      padding: 20px;
    }

    .question-text {
      font-size: 1.2rem;
    }

    .option-content {
      gap: 10px;
    }

    .option-letter {
      width: 35px;
      height: 35px;
    }

    .ranking-item, .ranking-item-large, .leaderboard-item {
      padding: 12px;
      gap: 10px;
    }
  }
</style>