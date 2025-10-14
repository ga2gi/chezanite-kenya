<script>
  import { onMount, beforeUpdate } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  
  // Game state
  let currentQuestion = 0;
  let score = 0;
  let timeLeft = 20;
  let timer;
  let gameStatus = 'playing'; // playing, finished, paused
  let selectedAnswer = null;
  let questions = [];
  let playerRank = 1;
  let totalPlayers = 50;
  let gameType = 'quickplay'; // quickplay or tournament
  let sessionId = null;
  
  // Sample questions - replace with Supabase data
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the capital city of Kenya?",
      options: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
      correctAnswer: 0,
      category: "Geography",
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Which mountain is the highest in Kenya?",
      options: ["Mount Kenya", "Mount Kilimanjaro", "Mount Elgon", "Mount Longonot"],
      correctAnswer: 0,
      category: "Geography", 
      difficulty: "medium"
    },
    {
      id: 3,
      question: "What year did Kenya gain independence?",
      options: ["1960", "1963", "1965", "1970"],
      correctAnswer: 1,
      category: "History",
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Which of these is a traditional Kenyan dish?",
      options: ["Ugali", "Jollof", "Injera", "Bunny Chow"],
      correctAnswer: 0,
      category: "Culture",
      difficulty: "medium"
    },
    {
      id: 5,
      question: "What is the official language of Kenya?",
      options: ["Swahili", "English", "Both Swahili and English", "Kikuyu"],
      correctAnswer: 2,
      category: "Culture",
      difficulty: "easy"
    }
  ];

  onMount(() => {
    // Get game parameters from URL safely
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      gameType = urlParams.get('type') || 'quickplay';
      sessionId = urlParams.get('session') || generateSessionId();
    }
    
    startGame();
  });

  function generateSessionId() {
    return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function startGame() {
    questions = sampleQuestions;
    gameStatus = 'playing';
    loadQuestion(0);
  }

  function loadQuestion(index) {
    if (index >= questions.length) {
      endGame();
      return;
    }
    
    currentQuestion = index;
    selectedAnswer = null;
    timeLeft = 20; // 20 seconds per question
    
    // Start timer
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      
      if (timeLeft <= 0) {
        handleTimeUp();
      }
    }, 1000);
  }

  function selectAnswer(answerIndex) {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    selectedAnswer = answerIndex;
    clearInterval(timer);
    
    // Check if answer is correct
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      // Calculate score based on time left and difficulty
      const basePoints = 100;
      const timeBonus = Math.floor((timeLeft / 20) * 50);
      const difficultyMultiplier = getDifficultyMultiplier(questions[currentQuestion].difficulty);
      const pointsEarned = (basePoints + timeBonus) * difficultyMultiplier;
      
      score += pointsEarned;
    }
    
    // Show result for 1.5 seconds before next question
    setTimeout(() => {
      loadQuestion(currentQuestion + 1);
    }, 1500);
  }

  function handleTimeUp() {
    clearInterval(timer);
    selectedAnswer = -1; // Indicate time up
    
    // Move to next question after brief pause
    setTimeout(() => {
      loadQuestion(currentQuestion + 1);
    }, 1000);
  }

  function getDifficultyMultiplier(difficulty) {
    const multipliers = {
      easy: 1,
      medium: 1.5,
      hard: 2
    };
    return multipliers[difficulty] || 1;
  }

  function endGame() {
    gameStatus = 'finished';
    clearInterval(timer);
    
    // TODO: Save score to Supabase
    console.log('Game finished! Final score:', score);
    console.log('Game type:', gameType);
    console.log('Session ID:', sessionId);
  }

  function restartGame() {
    score = 0;
    currentQuestion = 0;
    startGame();
  }

  function exitToQuickPlay() {
    goto('/nationwide/quick-play');
  }

  function exitToNationwide() {
    goto('/nationwide');
  }

  // Cleanup timer on component destroy
  beforeUpdate(() => {
    if (gameStatus === 'finished') {
      clearInterval(timer);
    }
  });
</script>

<div class="game-session">
  <div class="game-container">
    
    <!-- Game Header -->
    <header class="game-header">
      <div class="game-info">
        <div class="score-display">
          <span class="score-label">Score</span>
          <span class="score-value">{score}</span>
        </div>
        
        <div class="progress-display">
          <span class="progress-text">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              style="width: {((currentQuestion + 1) / questions.length) * 100}%"
            ></div>
          </div>
        </div>
        
        <div class="player-stats">
          <span class="rank">Rank: #{playerRank}</span>
          <span class="players">Players: {totalPlayers}</span>
        </div>
      </div>
      
      <!-- Game Type Badge -->
      <div class="game-type-badge {gameType}">
        {gameType === 'quickplay' ? '⚡ Quick Play' : '🏆 Tournament'}
      </div>
    </header>

    <!-- Main Game Area -->
    <main class="game-main">
      {#if gameStatus === 'playing'}
        <!-- Question Card -->
        <div class="question-card">
          <div class="question-header">
            <div class="category-badge">
              {questions[currentQuestion]?.category}
            </div>
            <div class="difficulty-badge {questions[currentQuestion]?.difficulty}">
              {questions[currentQuestion]?.difficulty}
            </div>
          </div>
          
          <div class="question-content">
            <h2 class="question-text">
              {questions[currentQuestion]?.question}
            </h2>
          </div>

          <!-- Timer -->
          <div class="timer-container">
            <div class="timer-circle">
              <svg class="timer-svg" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  class="timer-background"
                ></circle>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  class="timer-progress"
                  style="stroke-dashoffset: {282.6 - (282.6 * timeLeft) / 20}"
                ></circle>
              </svg>
              <div class="timer-text">{timeLeft}s</div>
            </div>
          </div>

          <!-- Answer Options -->
          <div class="answers-grid">
            {#each questions[currentQuestion]?.options as option, index (index)}
              <button
                class="answer-option {selectedAnswer === index ? 'selected' : ''}
                       {selectedAnswer !== null && index === questions[currentQuestion]?.correctAnswer ? 'correct' : ''}
                       {selectedAnswer !== null && selectedAnswer === index && selectedAnswer !== questions[currentQuestion]?.correctAnswer ? 'incorrect' : ''}"
                on:click={() => selectAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <span class="option-letter">
                  {String.fromCharCode(65 + index)} <!-- A, B, C, D -->
                </span>
                <span class="option-text">{option}</span>
                
                <!-- Feedback Icons -->
                {#if selectedAnswer !== null}
                  {#if index === questions[currentQuestion]?.correctAnswer}
                    <span class="feedback-icon">✓</span>
                  {:else if selectedAnswer === index && selectedAnswer !== questions[currentQuestion]?.correctAnswer}
                    <span class="feedback-icon">✗</span>
                  {/if}
                {/if}
              </button>
            {/each}
          </div>
        </div>

      {:else if gameStatus === 'finished'}
        <!-- Results Screen -->
        <div class="results-card">
          <div class="results-header">
            <div class="results-icon">🏆</div>
            <h2>Game Complete!</h2>
            <p>You've finished the {gameType === 'quickplay' ? 'Quick Play' : 'Tournament'} quiz</p>
          </div>
          
          <div class="results-stats">
            <div class="stat-item">
              <div class="stat-value">{score}</div>
              <div class="stat-label">Final Score</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">
                {Math.round((questions.filter((q, index) => {
                  // Calculate correct answers (simplified)
                  return true; // In real app, track actual performance
                }).length / questions.length) * 100)}%
              </div>
              <div class="stat-label">Accuracy</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">#{playerRank}</div>
              <div class="stat-label">Your Rank</div>
            </div>
          </div>
          
          <div class="results-actions">
            <button class="btn-play-again" on:click={restartGame}>
              🎮 Play Again
            </button>
            {#if gameType === 'quickplay'}
              <button class="btn-quick-play" on:click={exitToQuickPlay}>
                ⚡ Back to Quick Play
              </button>
            {:else}
              <button class="btn-leaderboard" on:click={() => goto('/leaderboard')}>
                🏆 View Leaderboard
              </button>
            {/if}
            <button class="btn-exit" on:click={exitToNationwide}>
              ← Exit to Nationwide
            </button>
          </div>
        </div>
      {/if}
    </main>

    <!-- Game Footer -->
    <footer class="game-footer">
      <button class="btn-exit-game" on:click={gameType === 'quickplay' ? exitToQuickPlay : exitToNationwide}>
        🏠 Exit Game
      </button>
    </footer>

  </div>
</div>

<style>
  .game-session {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .game-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 800px;
    width: 100%;
    min-height: 600px;
    display: flex;
    flex-direction: column;
  }

  /* Game Header */
  .game-header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: start;
  }

  .game-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    flex: 1;
  }

  .game-type-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-left: 1rem;
  }

  .game-type-badge.quickplay {
    background: #fef3c7;
    color: #92400e;
  }

  .game-type-badge.tournament {
    background: #dbeafe;
    color: #1e40af;
  }

  .score-display {
    text-align: center;
  }

  .score-label {
    display: block;
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 600;
  }

  .score-value {
    display: block;
    font-size: 2rem;
    font-weight: 800;
    color: #3b82f6;
  }

  .progress-display {
    flex: 1;
    max-width: 300px;
  }

  .progress-text {
    display: block;
    text-align: center;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    background: #e5e7eb;
    border-radius: 10px;
    height: 8px;
    overflow: hidden;
  }

  .progress-fill {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 10px;
  }

  .player-stats {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: right;
  }

  .rank, .players {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
  }

  /* Question Card */
  .question-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border: 2px solid #f1f5f9;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .category-badge {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .difficulty-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .difficulty-badge.easy {
    background: #d1fae5;
    color: #065f46;
  }

  .difficulty-badge.medium {
    background: #fef3c7;
    color: #92400e;
  }

  .difficulty-badge.hard {
    background: #fee2e2;
    color: #991b1b;
  }

  .question-content {
    text-align: center;
    margin-bottom: 2rem;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .question-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.4;
    margin: 0;
  }

  /* Timer */
  .timer-container {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
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

  .timer-background {
    fill: none;
    stroke: #e5e7eb;
    stroke-width: 8;
  }

  .timer-progress {
    fill: none;
    stroke: #3b82f6;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 282.6;
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 1s linear;
  }

  .timer-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.2rem;
    font-weight: 700;
    color: #374151;
  }

  /* Answers Grid */
  .answers-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .answer-option {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .answer-option:hover:not(:disabled) {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .answer-option.selected {
    border-color: #3b82f6;
    background: #dbeafe;
  }

  .answer-option.correct {
    border-color: #10b981;
    background: #d1fae5;
    color: #065f46;
  }

  .answer-option.incorrect {
    border-color: #ef4444;
    background: #fee2e2;
    color: #991b1b;
  }

  .answer-option:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .option-letter {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .answer-option.selected .option-letter {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .answer-option.correct .option-letter {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }

  .answer-option.incorrect .option-letter {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  .option-text {
    flex: 1;
    text-align: left;
  }

  .feedback-icon {
    font-size: 1.2rem;
    font-weight: bold;
  }

  /* Results Screen */
  .results-card {
    background: white;
    border-radius: 16px;
    padding: 3rem 2rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border: 2px solid #f1f5f9;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .results-header {
    margin-bottom: 2rem;
  }

  .results-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .results-header h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  .results-header p {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0;
  }

  .results-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 2.5rem;
    font-weight: 800;
    color: #3b82f6;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #64748b;
    font-weight: 600;
  }

  .results-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
  }

  .btn-play-again, .btn-quick-play, .btn-leaderboard, .btn-exit {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-play-again {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
  }

  .btn-play-again:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  .btn-quick-play {
    background: #fef3c7;
    color: #92400e;
    border: 2px solid #fef3c7;
  }

  .btn-quick-play:hover {
    background: #fde68a;
    border-color: #fde68a;
  }

  .btn-leaderboard {
    background: #f8fafc;
    color: #374151;
    border: 2px solid #e5e7eb;
  }

  .btn-leaderboard:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .btn-exit {
    background: #f8fafc;
    color: #64748b;
    border: 2px solid #e5e7eb;
  }

  .btn-exit:hover {
    background: #f1f5f9;
  }

  /* Game Footer */
  .game-footer {
    margin-top: 2rem;
    text-align: center;
  }

  .btn-exit-game {
    background: #f8fafc;
    color: #64748b;
    border: 2px solid #e5e7eb;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-exit-game:hover {
    background: #fee2e2;
    border-color: #ef4444;
    color: #dc2626;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .game-container {
      padding: 1rem;
      margin: 0.5rem;
    }

    .game-header {
      flex-direction: column;
      gap: 1rem;
    }

    .game-info {
      flex-direction: column;
      text-align: center;
    }

    .progress-display {
      max-width: 100%;
    }

    .player-stats {
      text-align: center;
      flex-direction: row;
      gap: 1rem;
    }

    .question-card {
      padding: 1.5rem;
    }

    .question-text {
      font-size: 1.25rem;
    }

    .answers-grid {
      grid-template-columns: 1fr;
    }

    .results-stats {
      flex-direction: column;
      gap: 1rem;
    }

    .stat-value {
      font-size: 2rem;
    }
  }

  @media (max-width: 480px) {
    .question-text {
      font-size: 1.1rem;
    }

    .answer-option {
      padding: 1rem;
    }

    .results-card {
      padding: 2rem 1rem;
    }
  }
</style>