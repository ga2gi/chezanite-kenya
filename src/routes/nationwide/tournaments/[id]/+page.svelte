<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let user = null;
  let loading = true;
  let tournament = null;
  let currentSegment = 0;
  let currentQuestion = 0;
  let score = 0;
  let timeLeft = 0;
  let timer = null;
  let selectedAnswer = null;
  let gameState = 'waiting'; // waiting, playing, segmentTransition, finished
  let playerRank = 0;
  let correctAnswers = 0;
  
  // Hardcoded tournament segments and questions
  const tournamentSegments = [
    {
      category: 'General Knowledge',
      questions: 5,
      timePerQuestion: 25,
      icon: '💬',
      questions: [
        {
          id: 1,
          question: "What is the largest ocean on Earth?",
          options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
          correctAnswer: 2
        },
        {
          id: 2,
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: 1
        },
        {
          id: 3,
          question: "What is the chemical symbol for gold?",
          options: ["Go", "Gd", "Au", "Ag"],
          correctAnswer: 2
        },
        {
          id: 4,
          question: "How many continents are there in the world?",
          options: ["5", "6", "7", "8"],
          correctAnswer: 2
        },
        {
          id: 5,
          question: "What is the largest mammal in the world?",
          options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
          correctAnswer: 1
        }
      ]
    },
    {
      category: 'Kenyan History',
      questions: 5,
      timePerQuestion: 30,
      icon: '🇰🇪',
      questions: [
        {
          id: 1,
          question: "In what year did Kenya gain independence?",
          options: ["1960", "1961", "1962", "1963"],
          correctAnswer: 3
        },
        {
          id: 2,
          question: "Who was the first President of Kenya?",
          options: ["Daniel Moi", "Jomo Kenyatta", "Mwai Kibaki", "Jaramogi Oginga"],
          correctAnswer: 1
        },
        {
          id: 3,
          question: "What is the name of the freedom fighter group that fought for Kenyan independence?",
          options: ["Mau Mau", "Uhuru Warriors", "Kenya Freedom Army", "Harambee Movement"],
          correctAnswer: 0
        },
        {
          id: 4,
          question: "Which European country colonized Kenya?",
          options: ["Portugal", "Germany", "Britain", "Italy"],
          correctAnswer: 2
        },
        {
          id: 5,
          question: "Where was the first capital of Kenya located?",
          options: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
          correctAnswer: 1
        }
      ]
    },
    {
      category: 'Pop Culture',
      questions: 5,
      timePerQuestion: 20,
      icon: '🎬',
      questions: [
        {
          id: 1,
          question: "Which artist sang 'Blinding Lights'?",
          options: ["The Weeknd", "Drake", "Ed Sheeran", "Post Malone"],
          correctAnswer: 0
        },
        {
          id: 2,
          question: "Which streaming service released 'Stranger Things'?",
          options: ["Netflix", "Amazon Prime", "Disney+", "HBO Max"],
          correctAnswer: 0
        },
        {
          id: 3,
          question: "What is the highest-grossing film of all time?",
          options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"],
          correctAnswer: 1
        },
        {
          id: 4,
          question: "Which social media platform is known for short-form videos?",
          options: ["Facebook", "Instagram", "TikTok", "Twitter"],
          correctAnswer: 2
        },
        {
          id: 5,
          question: "Who is known as the 'Queen of Pop'?",
          options: ["Beyoncé", "Madonna", "Taylor Swift", "Rihanna"],
          correctAnswer: 1
        }
      ]
    },
    {
      category: 'Geography',
      questions: 5,
      timePerQuestion: 25,
      icon: '🌍',
      questions: [
        {
          id: 1,
          question: "What is the longest river in Africa?",
          options: ["Congo River", "Nile River", "Niger River", "Zambezi River"],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "Which country has the most natural lakes in the world?",
          options: ["Russia", "Canada", "USA", "Finland"],
          correctAnswer: 1
        },
        {
          id: 3,
          question: "What is the smallest country in the world?",
          options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
          correctAnswer: 1
        },
        {
          id: 4,
          question: "Which desert is the largest in the world?",
          options: ["Sahara Desert", "Arabian Desert", "Gobi Desert", "Antarctic Desert"],
          correctAnswer: 3
        },
        {
          id: 5,
          question: "What is the capital of Australia?",
          options: ["Sydney", "Melbourne", "Canberra", "Perth"],
          correctAnswer: 2
        }
      ]
    },
    {
      category: 'Science & Technology',
      questions: 5,
      timePerQuestion: 30,
      icon: '🔬',
      questions: [
        {
          id: 1,
          question: "What is the hardest natural substance on Earth?",
          options: ["Gold", "Iron", "Diamond", "Platinum"],
          correctAnswer: 2
        },
        {
          id: 2,
          question: "How many bones are in the human body?",
          options: ["196", "206", "216", "226"],
          correctAnswer: 1
        },
        {
          id: 3,
          question: "What is the main gas found in the Earth's atmosphere?",
          options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
          correctAnswer: 2
        },
        {
          id: 4,
          question: "Which planet has the most moons?",
          options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
          correctAnswer: 1
        },
        {
          id: 5,
          question: "What is the speed of light in vacuum?",
          options: ["299,792 km/s", "300,000 km/s", "299,792 m/s", "300,000 m/s"],
          correctAnswer: 0
        }
      ]
    }
  ];

  let segments = tournamentSegments;
  let questions = [];

  $: currentCategory = segments[currentSegment]?.category || '';
  $: currentCategoryIcon = segments[currentSegment]?.icon || '';
  $: totalQuestions = segments.reduce((total, seg) => total + seg.questions, 0);
  $: questionsInCurrentSegment = segments[currentSegment]?.questions || 0;
  $: progress = ((currentSegment * questionsInCurrentSegment + currentQuestion) / totalQuestions) * 100;
  $: scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
    
    if (!user) {
      goto('/auth');
      return;
    }

    console.log('Tournament ID from URL:', $page.params.id);

    // TEST MODE: Skip normal loading and start immediately
    tournament = {
      id: $page.params.id, // Use the actual ID from URL
      name: "Friday Game Night Mega Tournament",
      prizePool: 15000,
      totalPlayers: 87
    };
    
    // Start tournament immediately without waiting
    setTimeout(() => {
      startTournament();
    }, 1000);
    
    loading = false;
  });

  function startTournament() {
    gameState = 'playing';
    loadSegmentQuestions(0);
  }

  function loadSegmentQuestions(segmentIndex) {
    currentSegment = segmentIndex;
    currentQuestion = 0;
    questions = segments[segmentIndex].questions;
    startQuestionTimer();
  }

  function startQuestionTimer() {
    timeLeft = segments[currentSegment].timePerQuestion;
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
    if (selectedAnswer === null) {
      // Auto-submit no answer
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    }
  }

  function selectAnswer(index) {
    selectedAnswer = index;
  }

  function submitAnswer() {
    clearInterval(timer);
    
    // Check if answer is correct
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      correctAnswers++;
      // Base points + time bonus
      score += 10 + Math.floor(timeLeft / 5);
    }
    
    // Show feedback
    gameState = 'answerFeedback';
    
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  }

  function nextQuestion() {
    gameState = 'playing';
    
    if (currentQuestion < questionsInCurrentSegment - 1) {
      currentQuestion++;
      selectedAnswer = null;
      startQuestionTimer();
    } else {
      nextSegment();
    }
  }

  function nextSegment() {
    if (currentSegment < segments.length - 1) {
      gameState = 'segmentTransition';
      setTimeout(() => {
        currentSegment++;
        loadSegmentQuestions(currentSegment);
        gameState = 'playing';
      }, 3000);
    } else {
      finishTournament();
    }
  }

  function finishTournament() {
    gameState = 'finished';
    clearInterval(timer);
    
    // Calculate rank (mock - in real app, this would be from server)
    playerRank = Math.floor(Math.random() * 87) + 1;
    
    saveTournamentResult();
  }

  async function saveTournamentResult() {
    try {
      const { error } = await supabase
        .from('tournament_results')
        .insert({
          user_id: user.id,
          tournament_id: tournament.id,
          score: score,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          time_taken: 0, // You can calculate this
          rank: playerRank
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving tournament result:', error);
    }
  }

  function playAgain() {
    goto('/tournaments');
  }

  function exitToHome() {
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
        <h1>{tournament.name}</h1>
        <div class="prize-pool">Prize Pool: KSH {tournament.prizePool?.toLocaleString()}</div>
        <div class="player-count">{tournament.totalPlayers} Players Joined</div>
      </div>
      
      <div class="countdown">
        <div class="countdown-number">3</div>
        <p>Tournament starting soon...</p>
      </div>

      <div class="segments-preview">
        <h3>Tournament Segments:</h3>
        <div class="segments-list">
          {#each segments as segment, index}
            <div class="segment-preview">
              <span class="segment-icon">{segment.icon}</span>
              <span class="segment-name">{segment.category}</span>
              <span class="segment-details">{segment.questions} Qs, {segment.timePerQuestion}s each</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

  {:else if gameState === 'playing' || gameState === 'answerFeedback'}
    <div class="game-screen">
      <!-- Header -->
      <div class="game-header">
        <div class="segment-info">
          <span class="segment-icon">{currentCategoryIcon}</span>
          <span class="segment-name">{currentCategory}</span>
          <span class="question-count">Question {currentQuestion + 1} of {questionsInCurrentSegment}</span>
        </div>
        
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" style="width: {progress}%"></div>
          </div>
          <span class="progress-text">{Math.round(progress)}% Complete</span>
        </div>

        <div class="score-section">
          <div class="score-display">{score} pts</div>
          <div class="timer {timeLeft <= 5 ? 'warning' : ''}">
            {timeLeft}s
          </div>
        </div>
      </div>

      <!-- Question Section -->
      <div class="question-section">
        <h2 class="question-text">{questions[currentQuestion]?.question}</h2>
        
        <div class="options-grid">
          {#each questions[currentQuestion]?.options as option, index}
            <button
              class="option-button 
                {selectedAnswer === index ? 'selected' : ''}
                {gameState === 'answerFeedback' && index === questions[currentQuestion].correctAnswer ? 'correct' : ''}
                {gameState === 'answerFeedback' && selectedAnswer === index && selectedAnswer !== questions[currentQuestion].correctAnswer ? 'incorrect' : ''}"
              on:click={() => selectAnswer(index)}
              disabled={gameState === 'answerFeedback' || selectedAnswer !== null}
            >
              <span class="option-letter">{String.fromCharCode(65 + index)}</span>
              <span class="option-text">{option}</span>
              {#if gameState === 'answerFeedback' && index === questions[currentQuestion].correctAnswer}
                <span class="correct-indicator">✓</span>
              {/if}
            </button>
          {/each}
        </div>

        <div class="action-buttons">
          {#if selectedAnswer !== null && gameState === 'playing'}
            <button class="submit-button" on:click={submitAnswer}>
              Submit Answer
            </button>
          {:else if gameState === 'answerFeedback'}
            <div class="feedback-message">
              {#if selectedAnswer === questions[currentQuestion].correctAnswer}
                <span class="correct">Correct! +{10 + Math.floor(timeLeft / 5)} points</span>
              {:else}
                <span class="incorrect">Incorrect! The right answer was {String.fromCharCode(65 + questions[currentQuestion].correctAnswer)}</span>
              {/if}
            </div>
          {:else}
            <button class="skip-button" on:click={nextQuestion}>
              Skip Question
            </button>
          {/if}
        </div>
      </div>
    </div>

  {:else if gameState === 'segmentTransition'}
    <div class="segment-transition">
      <div class="transition-content">
        <div class="completed-segment">
          <h2>Segment Complete!</h2>
          <div class="segment-icon-large">{currentCategoryIcon}</div>
          <h3>{currentCategory}</h3>
          <p>You scored {correctAnswers - (currentSegment * 5)}/5 in this segment</p>
        </div>
        
        {#if currentSegment < segments.length - 1}
          <div class="next-segment">
            <h4>Next Up:</h4>
            <div class="next-segment-info">
              <span class="segment-icon">{segments[currentSegment + 1].icon}</span>
              <span class="segment-name">{segments[currentSegment + 1].category}</span>
            </div>
            <p>{segments[currentSegment + 1].questions} questions, {segments[currentSegment + 1].timePerQuestion}s each</p>
          </div>
        {/if}
        
        <div class="countdown-next">
          <div class="countdown-circle">3</div>
        </div>
      </div>
    </div>

  {:else if gameState === 'finished'}
    <div class="results-screen">
      <div class="results-header">
        <h1>Tournament Complete! 🎉</h1>
        <p class="tournament-name">{tournament.name}</p>
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
            <span class="stat-value">{correctAnswers}/{totalQuestions}</span>
          </div>
          <div class="result-stat">
            <span class="stat-name">Accuracy</span>
            <span class="stat-value">{scorePercentage}%</span>
          </div>
          <div class="result-stat">
            <span class="stat-name">Your Rank</span>
            <span class="stat-value">#{playerRank} of {tournament.totalPlayers}</span>
          </div>
          <div class="result-stat">
            <span class="stat-name">Prize Pool</span>
            <span class="stat-value">KSH {tournament.prizePool?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Segment Breakdown -->
      <div class="segment-breakdown">
        <h3>Segment Performance:</h3>
        <div class="segments-performance">
          {#each segments as segment, index}
            <div class="segment-performance">
              <span class="segment-icon">{segment.icon}</span>
              <span class="segment-name">{segment.category}</span>
              <span class="segment-score">
                {#if index === 0}
                  {correctAnswers >= 5 ? 5 : correctAnswers}/5
                {:else if index === 1}
                  {correctAnswers >= 10 ? 5 : (correctAnswers - 5 >= 0 ? correctAnswers - 5 : 0)}/5
                {:else if index === 2}
                  {correctAnswers >= 15 ? 5 : (correctAnswers - 10 >= 0 ? correctAnswers - 10 : 0)}/5
                {:else if index === 3}
                  {correctAnswers >= 20 ? 5 : (correctAnswers - 15 >= 0 ? correctAnswers - 15 : 0)}/5
                {:else}
                  {correctAnswers - 20 >= 0 ? correctAnswers - 20 : 0}/5
                {/if}
              </span>
            </div>
          {/each}
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
  .tournament-game-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    color: white;
    padding: 20px;
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
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  /* Waiting Screen */
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

  .segments-preview {
    margin-top: 40px;
  }

  .segments-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }

  .segment-preview {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .segment-icon {
    font-size: 1.5rem;
  }

  .segment-name {
    flex: 1;
    text-align: left;
    font-weight: 600;
  }

  .segment-details {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  /* Game Screen */
  .game-screen {
    max-width: 800px;
    margin: 0 auto;
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
  }

  .segment-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .segment-icon {
    font-size: 1.5rem;
  }

  .segment-name {
    font-weight: 600;
  }

  .question-count {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .progress-section {
    flex: 1;
    max-width: 200px;
    text-align: center;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 5px;
  }

  .progress-fill {
    height: 100%;
    background: #ffd700;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .score-section {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .score-display {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .timer {
    font-size: 1.5rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.2);
    padding: 10px 15px;
    border-radius: 10px;
    min-width: 60px;
    text-align: center;
  }

  .timer.warning {
    color: #ff6b6b;
    animation: pulse 1s infinite;
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
    position: relative;
  }

  .option-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .option-button.selected {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
  }

  .option-button.correct {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.2);
  }

  .option-button.incorrect {
    border-color: #f44336;
    background: rgba(244, 67, 54, 0.2);
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

  .option-button.correct .option-letter {
    background: #4caf50;
    color: white;
  }

  .correct-indicator {
    position: absolute;
    right: 15px;
    color: #4caf50;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  .submit-button, .skip-button {
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .submit-button {
    background: #ffd700;
    color: #1a237e;
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

  .feedback-message {
    padding: 15px 30px;
    border-radius: 25px;
    font-weight: 600;
  }

  .feedback-message .correct {
    color: #4caf50;
  }

  .feedback-message .incorrect {
    color: #f44336;
  }

  /* Segment Transition */
  .segment-transition {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
  }

  .transition-content {
    max-width: 500px;
  }

  .completed-segment h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #ffd700;
  }

  .segment-icon-large {
    font-size: 4rem;
    margin: 20px 0;
  }

  .completed-segment h3 {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }

  .next-segment {
    margin: 40px 0;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
  }

  .next-segment h4 {
    margin-bottom: 15px;
    opacity: 0.8;
  }

  .next-segment-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .countdown-next {
    margin-top: 30px;
  }

  .countdown-circle {
    width: 80px;
    height: 80px;
    border: 3px solid #ffd700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    margin: 0 auto;
  }

  /* Results Screen */
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

  .segment-breakdown {
    margin-bottom: 40px;
  }

  .segment-breakdown h3 {
    margin-bottom: 20px;
    color: #ffd700;
  }

  .segments-performance {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .segment-performance {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .segment-score {
    margin-left: auto;
    font-weight: 600;
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

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .game-header {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .segment-info {
      justify-content: center;
    }

    .progress-section {
      max-width: none;
    }

    .options-grid {
      grid-template-columns: 1fr;
    }

    .question-text {
      font-size: 1.4rem;
    }

    .results-details {
      padding: 15px;
    }
  }
</style>