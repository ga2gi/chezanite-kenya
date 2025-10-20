<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let tournament: any = null;
  let isLoading = true;
  let countdown: string = '15:00';
  let connectedPlayers: any[] = [];
  let practiceQuestions: any[] = [];
  let currentPracticeQuestion: number = 0;
  let selectedPracticeAnswer: number | null = null;
  let showPracticeResults: boolean = false;
  let chatMessages: any[] = [];
  let newChatMessage: string = '';
  let tournamentStats: any = null;

  // Mock data
  const currentUser = {
    id: 'user-123',
    username: 'GamePlayer',
    avatar: '😎',
    level: 15
  };

  onMount(() => {
    if (!browser) return;
    loadTournamentData();
    startCountdown();
    simulatePlayerJoining();
    loadPracticeQuestions();
    loadTournamentStats();
  });

  onDestroy(() => {
    // Cleanup any intervals
  });

  function loadTournamentData(): void {
    const tournamentId = $page.params.id;
    
    tournament = {
      id: tournamentId,
      name: 'Mega Monday Championship',
      theme: {
        name: 'General Knowledge',
        category: 'general',
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
        prizePool: 2500,
        maxPlayers: 100,
        registeredPlayers: 87,
        questions: 20,
        timePerQuestion: 20
      },
      rules: [
        '20 questions across various categories',
        '20 seconds per question',
        'Points based on speed and accuracy',
        'Tie-breaker: fastest average answer time'
      ]
    };

    isLoading = false;
  }

  function startCountdown(): void {
    // Simulate 15-minute countdown
    let seconds = 15 * 60; // 15 minutes in seconds
    
    const timer = setInterval(() => {
      seconds--;
      
      if (seconds <= 0) {
        clearInterval(timer);
        startTournament();
        return;
      }
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      countdown = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      
      // Auto-start when countdown reaches 0
      if (seconds === 0) {
        startTournament();
      }
    }, 1000);
  }

  function simulatePlayerJoining(): void {
    // Initial players (including current user)
    connectedPlayers = [
      { ...currentUser, joinTime: new Date(), ready: true }
    ];

    // Simulate other players joining
    const mockPlayers = [
      { id: '2', username: 'TriviaMaster', avatar: '👑', level: 22, joinTime: new Date(), ready: true },
      { id: '3', username: 'QuizWhiz', avatar: '⭐', level: 18, joinTime: new Date(), ready: true },
      { id: '4', username: 'BrainBox', avatar: '💡', level: 25, joinTime: new Date(), ready: false },
      { id: '5', username: 'SuperPlayer', avatar: '🚀', level: 19, joinTime: new Date(), ready: true },
      { id: '6', username: 'GameExpert', avatar: '🎮', level: 21, joinTime: new Date(), ready: true },
      { id: '7', username: 'KnowledgeKing', avatar: '🤴', level: 24, joinTime: new Date(), ready: false },
      { id: '8', username: 'QuickMind', avatar: '⚡', level: 16, joinTime: new Date(), ready: true },
    ];

    // Add players gradually
    mockPlayers.forEach((player, index) => {
      setTimeout(() => {
        connectedPlayers = [...connectedPlayers, player];
      }, (index + 1) * 2000); // 2 seconds between each player
    });
  }

  function loadPracticeQuestions(): void {
    practiceQuestions = [
      {
        id: 'p1',
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation: "Mars is called the Red Planet due to its reddish appearance caused by iron oxide on its surface."
      },
      {
        id: 'p2', 
        question: "What is the capital city of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctAnswer: 2,
        explanation: "Canberra was chosen as the capital in 1908 as a compromise between rivals Sydney and Melbourne."
      },
      {
        id: 'p3',
        question: "Who wrote the play 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1,
        explanation: "William Shakespeare wrote this famous tragedy in the late 16th century."
      }
    ];
  }

  function loadTournamentStats(): void {
    tournamentStats = {
      totalPlayers: 87,
      averageLevel: 18.5,
      prizeDistribution: [
        { rank: 1, amount: 750 },
        { rank: 2, amount: 500 },
        { rank: 3, amount: 375 }
      ],
      yourPreviousPerformance: {
        tournamentsPlayed: 23,
        averageRank: 8.5,
        bestRank: 3,
        totalWinnings: 125
      }
    };
  }

  function startTournament(): void {
    goto(`/nationwide/tournaments/${tournament.id}/play`);
  }

  function selectPracticeAnswer(index: number): void {
    if (selectedPracticeAnswer !== null) return;
    
    selectedPracticeAnswer = index;
    showPracticeResults = true;
    
    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentPracticeQuestion < practiceQuestions.length - 1) {
        currentPracticeQuestion++;
        selectedPracticeAnswer = null;
        showPracticeResults = false;
      } else {
        // Reset to first question
        currentPracticeQuestion = 0;
        selectedPracticeAnswer = null;
        showPracticeResults = false;
      }
    }, 2000);
  }

  function sendChatMessage(): void {
    if (!newChatMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      user: currentUser,
      text: newChatMessage,
      timestamp: new Date(),
      type: 'player'
    };
    
    chatMessages = [...chatMessages, message];
    newChatMessage = '';
    
    // Simulate other players responding
    setTimeout(() => {
      const responses = [
        "Hello everyone! 🍀",
        "Ready to win this! 💪",
        "Anyone else nervous? 😅",
        "Let's have a great game! 🎯"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const randomPlayer = connectedPlayers[Math.floor(Math.random() * connectedPlayers.length)];
      
      if (randomPlayer && randomPlayer.id !== currentUser.id) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          user: randomPlayer,
          text: randomResponse,
          timestamp: new Date(),
          type: 'player'
        };
        
        chatMessages = [...chatMessages, botMessage];
      }
    }, 1000);
  }

  function getPlayerRankings(): any[] {
    return [...connectedPlayers].sort((a, b) => b.level - a.level);
  }

  function getReadyCount(): number {
    return connectedPlayers.filter(player => player.ready).length;
  }

  function formatTimeUntilStart(): string {
    // This would calculate actual time until tournament start
    return "15 minutes";
  }
</script>

<svelte:head>
  <title>Tournament Lobby - {tournament?.name} - ChezaNite</title>
</svelte:head>

<div class="lobby-container">
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Entering tournament lobby...</p>
    </div>

  {:else}
    <!-- Header Section -->
    <div class="lobby-header">
      <div class="header-content">
        <div class="tournament-info">
          <h1>🎯 {tournament.name}</h1>
          <div class="tournament-meta">
            <div class="meta-item">
              <span class="meta-icon">⏰</span>
              <span class="meta-text">Starts in {countdown}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👥</span>
              <span class="meta-text">{connectedPlayers.length} / {tournament.details.maxPlayers} players connected</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">💰</span>
              <span class="meta-text">KSH {tournament.details.prizePool.toLocaleString()} prize pool</span>
            </div>
          </div>
        </div>
        
        <div class="countdown-section">
          <div class="countdown-timer">
            <div class="timer-label">TOURNAMENT STARTS IN</div>
            <div class="timer-display">{countdown}</div>
          </div>
          <button class="ready-button" on:click={startTournament}>
            🚀 Ready to Start!
          </button>
        </div>
      </div>
    </div>

    <div class="lobby-content">
      <div class="lobby-grid">
        <!-- Left Column: Player List & Chat -->
        <div class="left-column">
          <!-- Connected Players -->
          <div class="players-card">
            <div class="card-header">
              <h3>👥 Connected Players ({connectedPlayers.length})</h3>
              <div class="ready-count">
                <span class="ready-text">{getReadyCount()} ready</span>
              </div>
            </div>
            
            <div class="players-list">
              {#each getPlayerRankings() as player, index}
                <div class="player-item {player.ready ? 'ready' : ''}">
                  <div class="player-rank">#{index + 1}</div>
                  <div class="player-avatar">{player.avatar}</div>
                  <div class="player-info">
                    <div class="player-name">
                      {player.username}
                      {#if player.id === currentUser.id}
                        <span class="you-badge">(You)</span>
                      {/if}
                    </div>
                    <div class="player-level">Level {player.level}</div>
                  </div>
                  <div class="player-status">
                    {#if player.ready}
                      <div class="status-ready">✅ Ready</div>
                    {:else}
                      <div class="status-waiting">⏳ Waiting</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Tournament Chat -->
          <div class="chat-card">
            <div class="card-header">
              <h3>💬 Tournament Chat</h3>
              <div class="online-indicator">
                <span class="dot"></span>
                {connectedPlayers.length} online
              </div>
            </div>
            
            <div class="chat-messages">
              {#each chatMessages as message}
                <div class="chat-message {message.user.id === currentUser.id ? 'own-message' : ''}">
                  <div class="message-avatar">{message.user.avatar}</div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-sender">{message.user.username}</span>
                      <span class="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div class="message-text">{message.text}</div>
                  </div>
                </div>
              {/each}
            </div>
            
            <div class="chat-input">
              <input
                type="text"
                bind:value={newChatMessage}
                placeholder="Type your message..."
                on:keydown={(e) => e.key === 'Enter' && sendChatMessage()}
                maxlength="200"
              />
              <button class="send-button" on:click={sendChatMessage} disabled={!newChatMessage.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>

        <!-- Center Column: Practice Area -->
        <div class="center-column">
          <!-- Practice Session -->
          <div class="practice-card">
            <div class="card-header">
              <h3>🎯 Practice Session</h3>
              <div class="practice-progress">
                Question {currentPracticeQuestion + 1} of {practiceQuestions.length}
              </div>
            </div>
            
            <div class="practice-content">
              {#if !showPracticeResults}
                <div class="practice-question">
                  <h4 class="question-text">{practiceQuestions[currentPracticeQuestion].question}</h4>
                  
                  <div class="practice-options">
                    {#each practiceQuestions[currentPracticeQuestion].options as option, index (index)}
                      <button
                        class="practice-option {selectedPracticeAnswer === index ? 'selected' : ''}"
                        on:click={() => selectPracticeAnswer(index)}
                        disabled={selectedPracticeAnswer !== null}
                      >
                        <span class="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span class="option-text">{option}</span>
                      </button>
                    {/each}
                  </div>
                </div>
              {:else}
                <div class="practice-result">
                  {#if selectedPracticeAnswer === practiceQuestions[currentPracticeQuestion].correctAnswer}
                    <div class="result-correct">
                      <div class="result-icon">✅</div>
                      <h4>Correct!</h4>
                      <p class="explanation">{practiceQuestions[currentPracticeQuestion].explanation}</p>
                    </div>
                  {:else}
                    <div class="result-incorrect">
                      <div class="result-icon">❌</div>
                      <h4>Good try!</h4>
                      <p class="correct-answer">
                        Correct answer: <strong>{practiceQuestions[currentPracticeQuestion].options[practiceQuestions[currentPracticeQuestion].correctAnswer]}</strong>
                      </p>
                      <p class="explanation">{practiceQuestions[currentPracticeQuestion].explanation}</p>
                    </div>
                  {/if}
                  
                  <div class="next-question-prompt">
                    <p>Next practice question in <span class="countdown">2</span>s...</p>
                  </div>
                </div>
              {/if}
            </div>
            
            <div class="practice-tips">
              <h4>💡 Tournament Tips</h4>
              <ul>
                <li>Read questions carefully before answering</li>
                <li>Use the full time if you're unsure</li>
                <li>Faster correct answers earn bonus points</li>
                <li>Stay focused - every point matters!</li>
              </ul>
            </div>
          </div>

          <!-- Tournament Rules -->
          <div class="rules-card">
            <h3>📜 Tournament Rules</h3>
            <div class="rules-list">
              {#each tournament.rules as rule}
                <div class="rule-item">
                  <span class="rule-icon">•</span>
                  <span class="rule-text">{rule}</span>
                </div>
              {/each}
            </div>
            
            <div class="scoring-info">
              <h4>🎯 Scoring System</h4>
              <div class="scoring-items">
                <div class="scoring-item">
                  <span class="scoring-points">+10 pts</span>
                  <span class="scoring-desc">Correct answer</span>
                </div>
                <div class="scoring-item">
                  <span class="scoring-points">+1-5 pts</span>
                  <span class="scoring-desc">Time bonus (faster = more points)</span>
                </div>
                <div class="scoring-item">
                  <span class="scoring-points">+2 pts</span>
                  <span class="scoring-desc">Per consecutive correct answer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Tournament Stats -->
        <div class="right-column">
          <!-- Your Stats -->
          <div class="stats-card">
            <h3>📊 Your Tournament Stats</h3>
            <div class="user-stats">
              <div class="user-avatar-large">{currentUser.avatar}</div>
              <div class="user-info">
                <div class="user-name">{currentUser.username}</div>
                <div class="user-level">Level {currentUser.level}</div>
              </div>
            </div>
            
            <div class="performance-stats">
              <div class="stat-item">
                <div class="stat-value">{tournamentStats.yourPreviousPerformance.tournamentsPlayed}</div>
                <div class="stat-label">Tournaments Played</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{tournamentStats.yourPreviousPerformance.averageRank}</div>
                <div class="stat-label">Average Rank</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{tournamentStats.yourPreviousPerformance.bestRank}</div>
                <div class="stat-label">Best Rank</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">KSH {tournamentStats.yourPreviousPerformance.totalWinnings.toLocaleString()}</div>
                <div class="stat-label">Total Winnings</div>
              </div>
            </div>
          </div>

          <!-- Prize Information -->
          <div class="prize-card">
            <h3>💰 Prize Distribution</h3>
            <div class="prize-pool-info">
              <div class="total-prize">
                <span class="prize-label">Total Prize Pool:</span>
                <span class="prize-amount">KSH {tournament.details.prizePool.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="prize-list">
              {#each tournamentStats.prizeDistribution as prize}
                <div class="prize-item">
                  <div class="prize-rank {prize.rank === 1 ? 'first-place' : ''}">
                    {#if prize.rank === 1}🥇
                    {:else if prize.rank === 2}🥈  
                    {:else if prize.rank === 3}🥉
                    {:else}##{prize.rank}
                    {/if}
                  </div>
                  <div class="prize-details">
                    <div class="prize-position">
                      {prize.rank}{#if prize.rank === 1}st
                      {:else if prize.rank === 2}nd
                      {:else if prize.rank === 3}rd
                      {:else}th{/if} Place
                    </div>
                    <div class="prize-money">KSH {prize.amount.toLocaleString()}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="actions-card">
            <h3>⚡ Quick Actions</h3>
            <div class="action-buttons">
              <button class="action-btn primary" on:click={startTournament}>
                🚀 Enter Tournament
              </button>
              <button class="action-btn secondary" on:click={() => goto('/nationwide/tournaments')}>
                ← Back to Tournaments
              </button>
              <button class="action-btn outline">
                📱 Share Tournament
              </button>
            </div>
            
            <div class="tournament-theme">
              <div class="theme-badge" style="background: {tournament.theme.color}">
                <span class="theme-icon">{tournament.theme.icon}</span>
                <span class="theme-name">{tournament.theme.name}</span>
              </div>
              <p class="theme-description">
                Get ready for questions about {tournament.theme.name.toLowerCase()}!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Banner -->
    <div class="lobby-footer">
      <div class="footer-content">
        <div class="footer-info">
          <div class="info-item">
            <span class="info-icon">⏰</span>
            <span class="info-text">Tournament starts automatically in {countdown}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">👥</span>
            <span class="info-text">{getReadyCount()} of {connectedPlayers.length} players ready</span>
          </div>
        </div>
        <button class="start-now-btn" on:click={startTournament}>
          🚀 Start Tournament Now
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .lobby-container {
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
  .lobby-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 25px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
  }

  .tournament-info h1 {
    font-size: 2.2rem;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #fff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tournament-meta {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0.9;
  }

  .meta-icon {
    font-size: 1.1rem;
  }

  .countdown-section {
    text-align: center;
  }

  .countdown-timer {
    margin-bottom: 15px;
  }

  .timer-label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  .timer-display {
    font-size: 2rem;
    font-weight: 700;
    color: #ffd700;
    font-family: 'Courier New', monospace;
  }

  .ready-button {
    background: #ffd700;
    color: #1a237e;
    border: none;
    padding: 12px 25px;
    border-radius: 25px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .ready-button:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  /* Main Content */
  .lobby-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 20px;
  }

  .lobby-grid {
    display: grid;
    grid-template-columns: 350px 1fr 350px;
    gap: 25px;
    align-items: start;
  }

  /* Card Styles */
  .players-card, .chat-card, .practice-card, .rules-card, .stats-card, .prize-card, .actions-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 25px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .card-header h3 {
    margin: 0;
    color: #ffd700;
    font-size: 1.1rem;
  }

  /* Players List */
  .players-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
  }

  .player-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .player-item.ready {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
  }

  .player-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .player-rank {
    font-weight: 700;
    color: #ffd700;
    width: 25px;
  }

  .player-avatar {
    font-size: 1.2rem;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .you-badge {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .player-level {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .player-status {
    font-size: 0.8rem;
  }

  .status-ready {
    color: #4caf50;
    font-weight: 600;
  }

  .status-waiting {
    color: #ff9800;
  }

  .ready-count {
    background: rgba(76, 175, 80, 0.2);
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  /* Chat Styles */
  .online-indicator {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #4caf50;
    border-radius: 50%;
  }

  .chat-messages {
    height: 300px;
    overflow-y: auto;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .chat-message {
    display: flex;
    gap: 10px;
    padding: 8px;
    border-radius: 10px;
  }

  .chat-message.own-message {
    background: rgba(255, 215, 0, 0.1);
  }

  .message-avatar {
    font-size: 1rem;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .message-content {
    flex: 1;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .message-sender {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .message-time {
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .message-text {
    font-size: 0.9rem;
    line-height: 1.3;
  }

  .chat-input {
    display: flex;
    gap: 10px;
  }

  .chat-input input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 10px 15px;
    color: white;
    font-size: 0.9rem;
  }

  .chat-input input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .send-button {
    background: #ffd700;
    color: #1a237e;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .send-button:hover:not(:disabled) {
    background: #ffed4a;
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Practice Area */
  .practice-content {
    margin-bottom: 20px;
  }

  .question-text {
    font-size: 1.2rem;
    margin-bottom: 20px;
    line-height: 1.4;
  }

  .practice-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .practice-option {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 10px;
    padding: 15px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
  }

  .practice-option:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  .practice-option.selected {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
  }

  .practice-option:disabled {
    cursor: not-allowed;
  }

  .option-letter {
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .practice-option.selected .option-letter {
    background: #ffd700;
    color: #1a237e;
  }

  .option-text {
    flex: 1;
  }

  .practice-result {
    text-align: center;
    padding: 20px 0;
  }

  .result-correct, .result-incorrect {
    margin-bottom: 20px;
  }

  .result-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }

  .result-correct h4 {
    color: #4caf50;
    margin-bottom: 10px;
  }

  .result-incorrect h4 {
    color: #f44336;
    margin-bottom: 10px;
  }

  .explanation, .correct-answer {
    opacity: 0.9;
    line-height: 1.4;
  }

  .next-question-prompt {
    opacity: 0.7;
    font-size: 0.9rem;
  }

  .countdown {
    font-weight: 700;
    color: #ffd700;
  }

  .practice-tips ul {
    list-style: none;
    padding: 0;
    font-size: 0.9rem;
  }

  .practice-tips li {
    padding: 5px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    padding-left: 20px;
  }

  .practice-tips li:before {
    content: '•';
    color: #ffd700;
    position: absolute;
    left: 0;
  }

  .practice-tips li:last-child {
    border-bottom: none;
  }

  /* Rules */
  .rules-list {
    margin-bottom: 20px;
  }

  .rule-item {
    display: flex;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .rule-item:last-child {
    border-bottom: none;
  }

  .rule-icon {
    color: #ffd700;
    font-weight: 700;
  }

  .scoring-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .scoring-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }

  .scoring-points {
    color: #ffd700;
    font-weight: 600;
  }

  .scoring-desc {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  /* Stats */
  .user-stats {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-avatar-large {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .user-name {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 2px;
  }

  .user-level {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .performance-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .stat-item {
    text-align: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .stat-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  /* Prizes */
  .total-prize {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .prize-amount {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .prize-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .prize-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
  }

  .prize-rank {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .prize-rank.first-place {
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    color: #1a237e;
  }

  .prize-details {
    flex: 1;
  }

  .prize-position {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .prize-money {
    color: #ffd700;
    font-weight: 600;
  }

  /* Actions */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .action-btn {
    padding: 12px;
    border: none;
    border-radius: 10px;
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

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 20px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .theme-description {
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
  }

  /* Footer */
  .lobby-footer {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    position: sticky;
    bottom: 0;
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .footer-info {
    display: flex;
    gap: 30px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .start-now-btn {
    background: #ffd700;
    color: #1a237e;
    border: none;
    padding: 12px 25px;
    border-radius: 25px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .start-now-btn:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .lobby-grid {
      grid-template-columns: 300px 1fr 300px;
      gap: 20px;
    }
  }

  @media (max-width: 968px) {
    .lobby-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .left-column, .center-column, .right-column {
      order: 1;
    }

    .center-column {
      order: 0;
    }

    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }

    .tournament-meta {
      justify-content: center;
    }

    .footer-content {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .footer-info {
      flex-direction: column;
      gap: 10px;
    }
  }

  @media (max-width: 768px) {
    .lobby-content {
      padding: 20px 15px;
    }

    .players-card, .chat-card, .practice-card, .rules-card, .stats-card, .prize-card, .actions-card {
      padding: 15px;
    }

    .performance-stats {
      grid-template-columns: 1fr;
    }

    .tournament-info h1 {
      font-size: 1.8rem;
    }
  }
</style>