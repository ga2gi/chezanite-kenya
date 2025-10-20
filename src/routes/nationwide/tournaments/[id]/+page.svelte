<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  // Define interfaces for our data structures
  interface Tournament {
    id: string;
    name: string;
    prizePool: number;
    totalPlayers: number;
  }

  interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
  }

  // Define reactive variables with proper types
  let loading: boolean = true;
  let tournament: Tournament | null = null;
  let gameState: 'waiting' | 'playing' | 'finished' = 'waiting';
  let currentQuestion: number = 0;
  let score: number = 0;
  let selectedAnswer: number | null = null;

  // Properly typed questions array
  const questions: Question[] = [
    {
      question: "What is the capital city of Kenya?",
      options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"],
      correctAnswer: 1
    },
    {
      question: "Which mountain is the highest in Kenya?",
      options: ["Mount Kilimanjaro", "Mount Kenya", "Mount Elgon", "Mount Longonot"],
      correctAnswer: 1
    },
    {
      question: "What is the official language of Kenya?",
      options: ["Swahili", "English", "Kikuyu", "Luo"],
      correctAnswer: 1
    }
  ];

  onMount(() => {
    console.log('Tournament ID:', $page.params.id);
    
    // Mock tournament data with proper type
    tournament = {
      id: String($page.params.id ?? ''),
      name: "Friday Game Night Mega Tournament",
      prizePool: 15000,
      totalPlayers: 87
    };
    
    // Start tournament after 3 seconds
    setTimeout(() => {
      startTournament();
    }, 3000);
    
    loading = false;
  });

  function startTournament(): void {
    gameState = 'playing';
  }

  function selectAnswer(index: number): void {
    selectedAnswer = index;
  }

  function submitAnswer(): void {
    // Check if answer is correct
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      score += 10;
    }
    
    // Move to next question or finish
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        selectedAnswer = null;
      } else {
        finishTournament();
      }
    }, 1000);
  }

  function finishTournament(): void {
    gameState = 'finished';
  }

  function playAgain(): void {
    goto('/nationwide/tournaments');
  }

  function exitToHome(): void {
    goto('/');
  }
</script>

<svelte:head>
  <title>Tournament - ChezaNite</title>
</svelte:head>

<div class="tournament-game-container">
  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading Tournament...</p>
    </div>

  {:else if gameState === 'waiting'}
    <div class="waiting-screen">
      <div class="tournament-info">
        <h1>{tournament?.name}</h1>
        <div class="prize-pool">Prize Pool: KSH {tournament?.prizePool?.toLocaleString()}</div>
        <div class="player-count">{tournament?.totalPlayers} Players Joined</div>
      </div>
      
      <div class="countdown">
        <div class="countdown-number">3</div>
        <p>Tournament starting soon...</p>
      </div>
    </div>

  {:else if gameState === 'playing'}
    <div class="game-screen">
      <div class="game-header">
        <div class="score-section">
          <div class="score-display">Score: {score}</div>
          <div class="question-count">Question {currentQuestion + 1} of {questions.length}</div>
        </div>
      </div>

      <div class="question-section">
        <h2 class="question-text">{questions[currentQuestion].question}</h2>
        
        <div class="options-grid">
          {#each questions[currentQuestion].options as option, index (index)}
            <button
              class="option-button {selectedAnswer === index ? 'selected' : ''}"
              on:click={() => selectAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              <span class="option-letter">{String.fromCharCode(65 + index)}</span>
              <span class="option-text">{option}</span>
            </button>
          {/each}
        </div>

        <div class="action-buttons">
          {#if selectedAnswer !== null}
            <button class="submit-button" on:click={submitAnswer}>
              {currentQuestion === questions.length - 1 ? 'Finish Game' : 'Next Question'}
            </button>
          {/if}
        </div>
      </div>
    </div>

  {:else if gameState === 'finished'}
    <div class="results-screen">
      <div class="results-header">
        <h1>Tournament Complete! 🎉</h1>
        <p class="tournament-name">{tournament?.name}</p>
      </div>

      <div class="results-summary">
        <div class="score-card">
          <div class="score-circle">
            <span class="score-value">{score}</span>
            <span class="score-label">Total Points</span>
          </div>
        </div>

        <div class="results-details">
          <div class="result-stat">
            <span class="stat-name">Correct Answers</span>
            <span class="stat-value">{Math.floor(score / 10)}/{questions.length}</span>
          </div>
          <div class="result-stat">
            <span class="stat-name">Accuracy</span>
            <span class="stat-value">{Math.round((score / 10 / questions.length) * 100)}%</span>
          </div>
          <div class="result-stat">
            <span class="stat-name">Prize Pool</span>
            <span class="stat-value">KSH {tournament?.prizePool?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="results-actions">
        <button class="play-again-button" on:click={playAgain}>
          Find More Tournaments
        </button>
        <button class="exit-button" on:click={exitToHome}>
          Back to Home
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Your existing CSS remains the same */
  .tournament-game-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    color: white;
    padding: 20px;
  }

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
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .waiting-screen {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 40px 20px;
  }

  .tournament-info h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .prize-pool {
    font-size: 1.5rem;
    color: #ffd700;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .player-count {
    opacity: 0.8;
    margin-bottom: 40px;
  }

  .countdown {
    margin: 40px 0;
  }

  .countdown-number {
    font-size: 4rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 20px;
  }

  .game-screen {
    max-width: 800px;
    margin: 0 auto;
  }

  .game-header {
    margin-bottom: 40px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
  }

  .score-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .score-display {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .question-count {
    opacity: 0.8;
  }

  .question-section {
    text-align: center;
  }

  .question-text {
    font-size: 1.8rem;
    margin-bottom: 40px;
    line-height: 1.4;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 30px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .option-button {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    padding: 20px;
    border-radius: 15px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 1rem;
  }

  .option-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .option-button.selected {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
  }

  .option-button:disabled {
    cursor: not-allowed;
  }

  .option-letter {
    background: rgba(255, 255, 255, 0.2);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .option-button.selected .option-letter {
    background: #ffd700;
    color: #1a237e;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  .submit-button {
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #ffd700;
    color: #1a237e;
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
  }

  .results-screen {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 40px 20px;
  }

  .results-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }

  .tournament-name {
    opacity: 0.8;
    margin-bottom: 40px;
  }

  .results-summary {
    margin-bottom: 40px;
  }

  .score-card {
    margin-bottom: 30px;
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
    margin: 0 auto 20px;
  }

  .score-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffd700;
  }

  .score-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .results-details {
    background: rgba(255, 255, 255, 0.1);
    padding: 25px;
    border-radius: 15px;
    margin-bottom: 30px;
  }

  .result-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-stat:last-child {
    border-bottom: none;
  }

  .stat-name {
    opacity: 0.8;
  }

  .stat-value {
    font-weight: 700;
    color: #ffd700;
  }

  .results-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .play-again-button, .exit-button {
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .play-again-button {
    background: #ffd700;
    color: #1a237e;
  }

  .play-again-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
  }

  .exit-button {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .exit-button:hover {
    border-color: white;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .question-text {
      font-size: 1.4rem;
    }

    .options-grid {
      grid-template-columns: 1fr;
    }
  }
</style>