<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';

  let user = null;
  let loading = true;
  let gameState = 'idle'; // 'idle', 'playing', 'finished'
  let currentQuestion = 0;
  let score = 0;
  let timeLeft = 20;
  let timer = null;
  let questions = [];
  let selectedAnswer = null;
  let gameStats = {
    totalPlayers: 500,
    averageScore: 70
  };

  // Mock questions - replace with real API call
  const mockQuestions = [
    {
      id: 1,
      question: "What is the capital city of Kenya?",
      options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Which mountain is the highest in Kenya?",
      options: ["Mount Kilimanjaro", "Mount Kenya", "Mount Elgon", "Mount Longonot"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What is the official language of Kenya?",
      options: ["Swahili", "English", "Kikuyu", "Luo"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "Which lake in Kenya is known for flamingos?",
      options: ["Lake Victoria", "Lake Nakuru", "Lake Naivasha", "Lake Baringo"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What year did Kenya gain independence?",
      options: ["1957", "1960", "1963", "1965"],
      correctAnswer: 2
    },
    {
      id: 6,
      question: "Which Kenyan won the Nobel Peace Prize?",
      options: ["Jomo Kenyatta", "Wangari Maathai", "Raila Odinga", "William Ruto"],
      correctAnswer: 1
    },
    {
      id: 7,
      question: "What is the currency of Kenya?",
      options: ["Kenyan Dollar", "Kenyan Pound", "Kenyan Shilling", "Kenyan Franc"],
      correctAnswer: 2
    },
    {
      id: 8,
      question: "Which national park in Kenya is famous for the wildebeest migration?",
      options: ["Amboseli", "Tsavo", "Maasai Mara", "Samburu"],
      correctAnswer: 2
    },
    {
      id: 9,
      question: "What is Kenya's country code?",
      options: ["+254", "+255", "+256", "+257"],
      correctAnswer: 0
    },
    {
      id: 10,
      question: "Which ocean borders Kenya to the east?",
      options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
      correctAnswer: 1
    }
  ];

  onMount(async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
    
    if (!user) {
      goto('/auth');
      return;
    }
    
    loading = false;
    questions = mockQuestions;
  });

  function startQuickPlay() {
    gameState = 'playing';
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    startTimer();
  }

  function startTimer() {
    timeLeft = 20;
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
      timeLeft--;
      
      if (timeLeft <= 0) {
        handleTimeUp();
      }
    }, 1000);
  }

  function handleTimeUp() {
    clearInterval(timer);
    // Auto-submit if time runs out
    if (selectedAnswer === null) {
      // No answer selected, move to next question
      nextQuestion();
    }
  }

  function selectAnswer(index) {
    selectedAnswer = index;
  }

  function submitAnswer() {
    clearInterval(timer);
    
    // Check if answer is correct
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      score++;
    }
    
    // Move to next question or finish game
    setTimeout(() => {
      nextQuestion();
    }, 1000);
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      selectedAnswer = null;
      startTimer();
    } else {
      finishGame();
    }
  }

  function finishGame() {
    gameState = 'finished';
    clearInterval(timer);
    
    // Save score to database
    saveGameResult();
  }

  async function saveGameResult() {
    try {
      const { error } = await supabase
        .from('game_results')
        .insert({
          user_id: user.id,
          game_type: 'quick_play',
          score: score,
          total_questions: questions.length,
          played_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  }

  function playAgain() {
    gameState = 'idle';
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
  }

  function exitGame() {
    goto('/nationwide');
  }

  // Calculate progress percentage
  $: progress = (currentQuestion / questions.length) * 100;
  $: scorePercentage = Math.round((score / questions.length) * 100);
</script>

<svelte:head>
  <title>Quick Play - ChezaNite</title>
</svelte:head>

<div class="quick-play-container">
  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading Quick Play...</p>
    </div>
  {:else if gameState === 'idle'}
    <div class="game-lobby">
      <div class="lobby-header">
        <h1>Quick Play</h1>
        <div class="game-stats">
          <div class="stat">
            <span class="stat-value">{gameStats.totalPlayers.toLocaleString()}</span>
            <span class="stat-label">Players Online</span>
          </div>
          <div class="stat">
            <span class="stat-value">{gameStats.averageScore}%</span>
            <span class="stat-label">Average Score</span>
          </div>
        </div>
      </div>

      <div class="game-info">
        <div class="info-card">
          <h3>10 Questions</h3>
          <p>General Knowledge</p>
        </div>
        <div class="info-card">
          <h3>20s Each</h3>
          <p>Per Question</p>
        </div>
      </div>

      <div class="start-section">
        <button class="start-button" on:click={startQuickPlay}>
          Start Quick Play
        </button>
        <p class="play-anytime">Play anytime, compete nationwide!</p>
      </div>
    </div>
  {:else if gameState === 'playing'}
    <div class="game-screen">
      <div class="game-header">
        <div class="progress-info">
          <span class="question-count">Question {currentQuestion + 1} of {questions.length}</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: {progress}%"></div>
          </div>
        </div>
        <div class="timer-section">
          <div class="timer-circle">
            <span class="time-left">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div class="question-section">
        <h2 class="question-text">{questions[currentQuestion].question}</h2>
        
        <div class="options-grid">
          {#each questions[currentQuestion].options as option, index}
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
          {:else}
            <button class="skip-button" on:click={nextQuestion}>
              Skip Question
            </button>
          {/if}
        </div>
      </div>
    </div>
  {:else if gameState === 'finished'}
    <div class="results-screen">
      <div class="results-header">
        <h1>Game Complete!</h1>
        <div class="score-display">
          <div class="score-circle">
            <span class="score-value">{score}</span>
            <span class="score-label">out of {questions.length}</span>
          </div>
          <div class="score-percentage">{scorePercentage}%</div>
        </div>
      </div>

      <div class="results-details">
        <div class="result-stat">
          <span class="stat-name">Correct Answers</span>
          <span class="stat-value">{score}</span>
        </div>
        <div class="result-stat">
          <span class="stat-name">Wrong Answers</span>
          <span class="stat-value">{questions.length - score}</span>
        </div>
        <div class="result-stat">
          <span class="stat-name">Your Rank</span>
          <span class="stat-value">#{Math.floor(Math.random() * 100) + 1}</span>
        </div>
      </div>

      <div class="results-actions">
        <button class="play-again-button" on:click={playAgain}>
          Play Again
        </button>
        <button class="exit-button" on:click={exitGame}>
          Back to Nationwide
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .quick-play-container {
    min-height: calc(100vh - 70px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

  /* Game Lobby Styles */
  .game-lobby {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 40px 20px;
  }

  .lobby-header h1 {
    font-size: 3rem;
    margin-bottom: 30px;
    font-weight: 700;
  }

  .game-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 40px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 5px;
  }

  .game-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 40px;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  .info-card h3 {
    font-size: 1.5rem;
    margin-bottom: 5px;
    color: #ffd700;
  }

  .start-button {
    background: #ffd700;
    color: #2d3748;
    border: none;
    padding: 15px 40px;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 15px;
  }

  .start-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
  }

  .play-anytime {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  /* Game Screen Styles */
  .game-screen {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
  }

  .progress-info {
    flex: 1;
  }

  .question-count {
    display: block;
    margin-bottom: 10px;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .progress-bar {
    width: 300px;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #ffd700;
    transition: width 0.3s ease;
  }

  .timer-section {
    display: flex;
    align-items: center;
  }

  .timer-circle {
    width: 80px;
    height: 80px;
    border: 3px solid #ffd700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 700;
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
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 30px;
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
    opacity: 0.6;
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
    color: #2d3748;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  .submit-button, .skip-button {
    padding: 12px 30px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .submit-button {
    background: #ffd700;
    color: #2d3748;
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
  }

  .skip-button {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .skip-button:hover {
    border-color: white;
  }

  /* Results Screen Styles */
  .results-screen {
    max-width: 500px;
    margin: 0 auto;
    text-align: center;
    padding: 40px 20px;
  }

  .results-header h1 {
    font-size: 2.5rem;
    margin-bottom: 30px;
  }

  .score-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
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
  }

  .score-value {
    font-size: 3rem;
    font-weight: 700;
    color: #ffd700;
  }

  .score-label {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .score-percentage {
    font-size: 2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .results-details {
    background: rgba(255, 255, 255, 0.1);
    padding: 25px;
    border-radius: 15px;
    margin-bottom: 30px;
    backdrop-filter: blur(10px);
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
    color: #2d3748;
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

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .game-stats {
      gap: 20px;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .game-info {
      grid-template-columns: 1fr;
    }

    .options-grid {
      grid-template-columns: 1fr;
    }

    .game-header {
      flex-direction: column;
      gap: 20px;
    }

    .progress-bar {
      width: 100%;
    }

    .score-display {
      flex-direction: column;
      gap: 20px;
    }
  }
</style>