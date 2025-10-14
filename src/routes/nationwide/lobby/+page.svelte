<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  let tournament = null;
  let players = [];
  let countdown = 0;
  let isLoading = true;
  let currentUser = { name: 'You', isReady: false };
  let chatMessages = [];
  let newMessage = '';

  // Sample tournament data
  const sampleTournament = {
    id: 'monday-trivia',
    name: 'Monday Night Trivia',
    description: '20 questions, 30 seconds each - General knowledge & fun facts',
    startTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    maxPlayers: 100,
    entryType: 'premium',
    duration: '10 mins',
    prize: 'Premium Badge + 500 Points'
  };

  onMount(() => {
    loadTournamentData();
    startCountdown();
    loadPlayers();
  });

  function loadTournamentData() {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const tournamentId = urlParams.get('tournament');
      
      // TODO: Fetch tournament data from Supabase based on tournamentId
      tournament = sampleTournament;
      
      // Calculate initial countdown
      updateCountdown();
    }
    isLoading = false;
  }

  function startCountdown() {
    setInterval(() => {
      updateCountdown();
    }, 1000);
  }

  function updateCountdown() {
    if (!tournament) return;
    
    const now = new Date();
    const timeDiff = tournament.startTime - now;
    
    if (timeDiff <= 0) {
      countdown = 0;
      startTournament();
    } else {
      countdown = Math.floor(timeDiff / 1000);
    }
  }

  function loadPlayers() {
    // TODO: Fetch real players from Supabase
    players = [
      { id: 1, name: 'Sarah_K', isReady: true, avatar: '👩' },
      { id: 2, name: 'MikeJ', isReady: true, avatar: '👨' },
      { id: 3, name: 'Tasha_KE', isReady: false, avatar: '👧' },
      { id: 4, name: 'Jamal', isReady: true, avatar: '👦' },
      { id: 5, name: 'Grace_W', isReady: false, avatar: '👩' },
      { id: 6, name: 'David_M', isReady: true, avatar: '👨' }
    ];
    
    // Add current user to players list
    players.unshift({ ...currentUser, id: 0, avatar: '😊' });
  }

  function toggleReady() {
    currentUser.isReady = !currentUser.isReady;
    // Update the current user in the players list
    const userIndex = players.findIndex(p => p.id === 0);
    if (userIndex !== -1) {
      players[userIndex].isReady = currentUser.isReady;
    }
    // TODO: Update ready status in Supabase
  }

  function startTournament() {
    if (!tournament) return;
    
    // Generate tournament session ID
    const sessionId = `tournament_${tournament.id}_${Date.now()}`;
    
    // Navigate to game with tournament parameters
    goto(`/game?type=tournament&session=${sessionId}&tournament=${tournament.id}`);
  }

  function sendMessage() {
    if (!newMessage.trim()) return;
    
    chatMessages.push({
      id: Date.now(),
      user: currentUser.name,
      message: newMessage,
      timestamp: new Date()
    });
    
    newMessage = '';
    
    // TODO: Send message to Supabase real-time
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function exitLobby() {
    goto('/nationwide');
  }

  function getReadyPercentage() {
    const readyPlayers = players.filter(p => p.isReady).length;
    return Math.round((readyPlayers / players.length) * 100);
  }
</script>

<div class="tournament-lobby">
  <div class="lobby-container">
    
    <!-- Header -->
    <header class="lobby-header">
      <button class="back-button" on:click={exitLobby}>← Back</button>
      <h1>Tournament Lobby</h1>
      <div class="tournament-info">
        {#if tournament}
          <span class="tournament-name">{tournament.name}</span>
          <span class="tournament-type {tournament.entryType}">{tournament.entryType?.toUpperCase()}</span>
        {/if}
      </div>
    </header>

    {#if isLoading}
      <div class="loading-state">
        <div class="loading-spinner">⏳</div>
        <p>Loading tournament...</p>
      </div>
    {:else if tournament}
      <div class="lobby-content">
        
        <!-- Countdown & Info Section -->
        <section class="info-section">
          <div class="countdown-card">
            <div class="countdown-header">
              <h2>Tournament Starts In</h2>
              {#if countdown === 0}
                <div class="starting-soon">Starting now...</div>
              {/if}
            </div>
            <div class="countdown-timer">
              {formatTime(countdown)}
            </div>
            <div class="tournament-details">
              <div class="detail-item">
                <span class="label">Duration:</span>
                <span class="value">{tournament.duration}</span>
              </div>
              <div class="detail-item">
                <span class="label">Players:</span>
                <span class="value">{players.length}/{tournament.maxPlayers}</span>
              </div>
              <div class="detail-item">
                <span class="label">Prize:</span>
                <span class="value">{tournament.prize}</span>
              </div>
            </div>
          </div>

          <!-- Ready Section -->
          <div class="ready-section">
            <div class="ready-header">
              <h3>Ready Check</h3>
              <div class="ready-stats">
                <span class="ready-count">{players.filter(p => p.isReady).length}/{players.length}</span>
                <span class="ready-percentage">({getReadyPercentage()}% ready)</span>
              </div>
            </div>
            
            <button 
              class="ready-button {currentUser.isReady ? 'ready' : 'not-ready'}" 
              on:click={toggleReady}
            >
              {#if currentUser.isReady}
                ✅ You're Ready!
              {:else}
                ⏳ Click when Ready
              {/if}
            </button>
            
            <p class="ready-description">
              {#if currentUser.isReady}
                Waiting for other players... Tournament will start automatically
              {:else}
                Click the button above when you're ready to play
              {/if}
            </p>
          </div>
        </section>

        <!-- Players & Chat Section -->
        <section class="interaction-section">
          
          <!-- Players List -->
          <div class="players-section">
            <h3>Players ({players.length})</h3>
            <div class="players-list">
              {#each players as player (player.id)}
                <div class="player-card {player.id === 0 ? 'current-user' : ''}">
                  <div class="player-avatar">{player.avatar}</div>
                  <div class="player-info">
                    <span class="player-name">{player.name}</span>
                    {#if player.id === 0}
                      <span class="you-badge">(You)</span>
                    {/if}
                  </div>
                  <div class="player-status {player.isReady ? 'ready' : 'not-ready'}">
                    {#if player.isReady}
                      ✅ Ready
                    {:else}
                      ⏳ Waiting
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Chat Section -->
          <div class="chat-section">
            <h3>Tournament Chat</h3>
            <div class="chat-messages">
              {#each chatMessages as message (message.id)}
                <div class="chat-message">
                  <span class="message-user">{message.user}:</span>
                  <span class="message-text">{message.message}</span>
                  <span class="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              {/each}
            </div>
            
            <div class="chat-input">
              <input 
                type="text" 
                bind:value={newMessage}
                placeholder="Type your message..."
                on:keydown={(e) => e.key === 'Enter' && sendMessage()}
                class="message-input"
              />
              <button on:click={sendMessage} class="send-button">Send</button>
            </div>
          </div>

        </section>

        <!-- Tournament Description -->
        <section class="description-section">
          <h3>About This Tournament</h3>
          <div class="description-card">
            <p>{tournament.description}</p>
            <div class="tournament-rules">
              <h4>Tournament Rules:</h4>
              <ul>
                <li>20 questions, 30 seconds each</li>
                <li>Points based on speed and accuracy</li>
                <li>Leaderboard updates in real-time</li>
                <li>Top 3 players win prizes</li>
                <li>No late entries after start</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    {:else}
      <div class="error-state">
        <div class="error-icon">❌</div>
        <h3>Tournament Not Found</h3>
        <p>The tournament you're looking for doesn't exist or has ended.</p>
        <button class="back-button" on:click={exitLobby}>Back to Nationwide</button>
      </div>
    {/if}

  </div>
</div>

<style>
  .tournament-lobby {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
    padding: 1rem;
  }

  .lobby-container {
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  /* Header */
  .lobby-header {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .back-button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .lobby-header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
  }

  .tournament-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .tournament-name {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .tournament-type {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .tournament-type.premium {
    background: #fef3c7;
    color: #92400e;
  }

  .tournament-type.free {
    background: #d1fae5;
    color: #065f46;
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

  /* Error State */
  .error-state {
    padding: 4rem 2rem;
    text-align: center;
    color: #64748b;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-state h3 {
    margin: 0 0 1rem 0;
    color: #dc2626;
  }

  .error-state p {
    margin: 0 0 2rem 0;
  }

  /* Lobby Content */
  .lobby-content {
    padding: 2rem;
  }

  /* Info Section */
  .info-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .countdown-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border: 2px solid #f1f5f9;
    text-align: center;
  }

  .countdown-header {
    margin-bottom: 1.5rem;
  }

  .countdown-header h2 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 1.5rem;
  }

  .starting-soon {
    color: #dc2626;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .countdown-timer {
    font-size: 3.5rem;
    font-weight: 800;
    color: #3b82f6;
    margin-bottom: 2rem;
    font-family: 'Courier New', monospace;
  }

  .tournament-details {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .detail-item {
    text-align: center;
  }

  .detail-item .label {
    display: block;
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 0.25rem;
  }

  .detail-item .value {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
  }

  /* Ready Section */
  .ready-section {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border: 2px solid #f1f5f9;
    text-align: center;
  }

  .ready-header {
    margin-bottom: 1.5rem;
  }

  .ready-header h3 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }

  .ready-stats {
    color: #64748b;
    font-size: 0.9rem;
  }

  .ready-button {
    width: 100%;
    padding: 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
  }

  .ready-button.ready {
    background: #d1fae5;
    color: #065f46;
    border: 2px solid #10b981;
  }

  .ready-button.not-ready {
    background: #fef3c7;
    color: #92400e;
    border: 2px solid #f59e0b;
  }

  .ready-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .ready-description {
    color: #64748b;
    margin: 0;
    font-size: 0.9rem;
  }

  /* Interaction Section */
  .interaction-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  /* Players Section */
  .players-section h3,
  .chat-section h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1.25rem;
  }

  .players-list {
    background: white;
    border-radius: 12px;
    border: 2px solid #f1f5f9;
    max-height: 400px;
    overflow-y: auto;
  }

  .player-card {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.3s ease;
  }

  .player-card:hover {
    background: #f8fafc;
  }

  .player-card:last-child {
    border-bottom: none;
  }

  .player-card.current-user {
    background: #dbeafe;
    border-left: 4px solid #3b82f6;
  }

  .player-avatar {
    font-size: 1.5rem;
    margin-right: 1rem;
  }

  .player-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .player-name {
    font-weight: 600;
    color: #1f2937;
  }

  .you-badge {
    background: #3b82f6;
    color: white;
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .player-status {
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
  }

  .player-status.ready {
    background: #d1fae5;
    color: #065f46;
  }

  .player-status.not-ready {
    background: #fef3c7;
    color: #92400e;
  }

  /* Chat Section */
  .chat-section {
    display: flex;
    flex-direction: column;
  }

  .chat-messages {
    background: white;
    border: 2px solid #f1f5f9;
    border-radius: 12px;
    padding: 1rem;
    flex: 1;
    min-height: 300px;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 1rem;
  }

  .chat-message {
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: #f8fafc;
  }

  .chat-message:last-child {
    margin-bottom: 0;
  }

  .message-user {
    font-weight: 600;
    color: #3b82f6;
    margin-right: 0.5rem;
  }

  .message-text {
    color: #374151;
  }

  .message-time {
    display: block;
    font-size: 0.7rem;
    color: #9ca3af;
    margin-top: 0.25rem;
  }

  .chat-input {
    display: flex;
    gap: 0.5rem;
  }

  .message-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .message-input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .send-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .send-button:hover {
    background: #2563eb;
  }

  /* Description Section */
  .description-section h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
  }

  .description-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 2px solid #f1f5f9;
  }

  .description-card p {
    margin: 0 0 1.5rem 0;
    color: #374151;
    line-height: 1.5;
  }

  .tournament-rules h4 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }

  .tournament-rules ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #374151;
  }

  .tournament-rules li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .info-section {
      grid-template-columns: 1fr;
    }
    
    .interaction-section {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .lobby-container {
      margin: 0.5rem;
    }
    
    .lobby-content {
      padding: 1rem;
    }
    
    .lobby-header {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }
    
    .countdown-timer {
      font-size: 2.5rem;
    }
    
    .tournament-details {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .tournament-lobby {
      padding: 0.5rem;
    }
    
    .countdown-card,
    .ready-section {
      padding: 1.5rem;
    }
    
    .player-card {
      padding: 0.75rem 1rem;
    }
  }
</style>