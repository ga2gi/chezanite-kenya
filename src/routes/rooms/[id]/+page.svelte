<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  // Basic runtime types to satisfy TS checking in Svelte components.
  let user: any = null;
  let profile: any = null;
  let room: any = null;
  let players: any[] = [];
  let messages: any[] = [];
  let newMessage: string = '';
  let selectedGame: string | null = null;
  let isLoading: boolean = true;
  let isHost: boolean = false;

  // Real-time subscriptions (supabase Realtime channels)
  let roomSubscription: any;
  let playersSubscription: any;
  let messagesSubscription: any;

  // Games available
  const games = [
    { id: 'trivia', name: 'Trivia Night', icon: '❓', description: 'Test your knowledge' },
    { id: 'charades', name: 'Charades', icon: '🎭', description: 'Act it out!' },
    { id: 'broken-paragraph', name: 'Broken Paragraph', icon: '📝', description: 'Complete the story' },
    { id: 'imposter', name: 'Imposter Game', icon: '🕵️', description: 'Find the imposter' }
  ];

  $: roomId = $page.params.roomId;

  // Don't make the onMount callback itself async if it returns a cleanup function.
  onMount(() => {
    (async () => {
      await checkAuth();
      await loadRoomData();
      setupRealTimeSubscriptions();
    })();

    return () => {
      // Cleanup subscriptions
      roomSubscription?.unsubscribe();
      playersSubscription?.unsubscribe();
      messagesSubscription?.unsubscribe();
    };
  });

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
    
    if (!user) {
      goto('/auth/signin');
      return;
    }
    
    await loadUserProfile();
  }

  async function loadUserProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  async function loadRoomData() {
    try {
      // Load room info
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        alert('Room not found');
        goto('/rooms');
        return;
      }

      room = roomData;

      // Load players
      const { data: playersData, error: playersError } = await supabase
        .from('room_players')
        .select(`
          is_host,
          profiles (
            id,
            display_name,
            email
          )
        `)
        .eq('room_id', roomId);

      if (!playersError) {
        players = playersData.map(p => ({
          ...p.profiles,
          is_host: p.is_host
        }));
        
        // Check if current user is host
        isHost = players.some(p => p.id === user.id && p.is_host);
      }

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('room_messages')
        .select(`
          id,
          message,
          created_at,
          profiles (
            display_name
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!messagesError) {
        messages = messagesData;
      }

    } catch (error) {
      console.error('Error loading room data:', error);
    } finally {
      isLoading = false;
    }
  }

  function setupRealTimeSubscriptions() {
    // Subscribe to room changes
    roomSubscription = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            room = { ...room, ...payload.new };
          } else if (payload.eventType === 'DELETE') {
            alert('Room has been closed');
            goto('/rooms');
          }
        }
      )
      .subscribe();

    // Subscribe to player changes
    playersSubscription = supabase
      .channel('player-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          // Reload players when someone joins/leaves
          const { data: playersData } = await supabase
            .from('room_players')
            .select(`
              is_host,
              profiles (
                id,
                display_name,
                email
              )
            `)
            .eq('room_id', roomId);

          if (playersData) {
            players = playersData.map(p => ({
              ...p.profiles,
              is_host: p.is_host
            }));
            isHost = players.some(p => p.id === user.id && p.is_host);
          }
        }
      )
      .subscribe();

    // Subscribe to new messages
    messagesSubscription = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          messages = [...messages, payload.new];
          // Auto-scroll to bottom
          setTimeout(() => {
            const chatContainer = document.querySelector('.chat-messages');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          }, 100);
        }
      )
      .subscribe();
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('room_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        message: newMessage.trim()
      });

    if (!error) {
      newMessage = '';
    }
  }

  async function startGame() {
    if (!selectedGame) {
      alert('Please select a game to start');
      return;
    }

    if (!isHost) {
      alert('Only the room host can start games');
      return;
    }

    // Update room status to playing and set current game
    const { error } = await supabase
      .from('rooms')
      .update({
        status: 'playing',
        current_game: selectedGame,
        game_started_at: new Date()
      })
      .eq('id', roomId);

    if (!error) {
      // Redirect to the game page
      goto(`/games/${selectedGame}?room=${roomId}`);
    }
  }

  async function leaveRoom() {
    // Remove player from room
    const { error } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (!error) {
      // Update player count
      await supabase
        .from('rooms')
        .update({ current_players: room.current_players - 1 })
        .eq('id', roomId);

      goto('/rooms');
    }
  }

  function copyRoomCode() {
    navigator.clipboard.writeText(roomId);
    alert('Room code copied!');
  }

  function handleMessageKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="room-lobby">
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading room...</p>
    </div>
  {:else if room}
    <div class="lobby-container">
      <!-- Header -->
      <header class="lobby-header">
        <div class="header-left">
          <h1>{room.name}</h1>
          <div class="room-info">
            <span class="room-code">Code: <strong>{room.id}</strong></span>
            <button on:click={copyRoomCode} class="btn-copy-small" title="Copy code">📋</button>
            <span class="player-count">{room.current_players}/{room.max_players} players</span>
          </div>
        </div>
        <div class="header-right">
          <button on:click={leaveRoom} class="btn-leave">Leave Room</button>
        </div>
      </header>

      <div class="lobby-content">
        <!-- Players Panel -->
        <section class="players-panel">
          <h2>Players ({players.length})</h2>
          <div class="players-list">
            {#each players as player}
              <div class="player-card">
                <div class="player-avatar">
                  {player.display_name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div class="player-info">
                  <span class="player-name">{player.display_name || player.email}</span>
                  {#if player.is_host}
                    <span class="host-badge">Host</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </section>

        <!-- Main Area -->
        <div class="main-area">
          <!-- Game Selection -->
          <section class="game-selection">
            <h2>Choose a Game</h2>
            <div class="games-grid">
              {#each games as game}
                <button
                  type="button"
                  class="game-card {selectedGame === game.id ? 'selected' : ''}"
                  on:click={() => (selectedGame = game.id)}
                >
                  <div class="game-icon">{game.icon}</div>
                  <div class="game-info">
                    <h3>{game.name}</h3>
                    <p>{game.description}</p>
                  </div>
                </button>
              {/each}
            </div>
            
            {#if isHost}
              <button 
                on:click={startGame}
                class="btn-start-game"
                disabled={!selectedGame}
              >
                Start Game
              </button>
            {:else}
              <p class="waiting-host">Waiting for host to start the game...</p>
            {/if}
          </section>

          <!-- Chat -->
          <section class="chat-panel">
            <h2>Chat</h2>
            <div class="chat-messages">
              {#each messages as message}
                <div class="message">
                  <span class="message-sender">{message.profiles.display_name}:</span>
                  <span class="message-text">{message.message}</span>
                  <span class="message-time">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
              {/each}
            </div>
            <div class="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                bind:value={newMessage}
                on:keypress={handleMessageKeyPress}
                class="message-input"
              />
              <button on:click={sendMessage} class="btn-send" disabled={!newMessage.trim()}>
                Send
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  {:else}
    <div class="error-state">
      <h2>Room Not Found</h2>
      <p>The room you're looking for doesn't exist or you don't have access.</p>
      <a href="/rooms" class="btn-back">Back to Rooms</a>
    </div>
  {/if}
</div>

<style>
  .room-lobby {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 1rem;
  }

  .lobby-container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  /* Header */
  .lobby-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
  }

  .header-left h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }

  .room-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
  }

  .btn-copy-small {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .btn-leave {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-leave:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Main Content */
  .lobby-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    height: calc(100vh - 120px);
  }

  /* Players Panel */
  .players-panel {
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
    padding: 1.5rem;
    overflow-y: auto;
  }

  .players-panel h2 {
    margin: 0 0 1rem 0;
    color: #1e293b;
    font-size: 1.25rem;
  }

  .players-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .player-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  .player-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    display: block;
    font-weight: 500;
    color: #1e293b;
  }

  .host-badge {
    background: #f59e0b;
    color: white;
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  /* Main Area */
  .main-area {
    display: flex;
    flex-direction: column;
  }

  /* Game Selection */
  .game-selection {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .game-selection h2 {
    margin: 0 0 1rem 0;
    color: #1e293b;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .game-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .game-card:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
  }

  .game-card.selected {
    border-color: #3b82f6;
    background: #dbeafe;
  }

  .game-icon {
    font-size: 2rem;
  }

  .game-info h3 {
    margin: 0 0 0.25rem 0;
    color: #1e293b;
    font-size: 1rem;
  }

  .game-info p {
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
  }

  .btn-start-game {
    background: linear-gradient(135deg, #10b981, #34d399);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-start-game:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  .btn-start-game:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .waiting-host {
    text-align: center;
    color: #64748b;
    font-style: italic;
    padding: 1rem;
  }

  /* Chat Panel */
  .chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 2rem;
  }

  .chat-panel h2 {
    margin: 0 0 1rem 0;
    color: #1e293b;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
    background: #f8fafc;
    margin-bottom: 1rem;
  }

  .message {
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: white;
  }

  .message-sender {
    font-weight: 600;
    color: #3b82f6;
    margin-right: 0.5rem;
  }

  .message-text {
    color: #1e293b;
  }

  .message-time {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .chat-input {
    display: flex;
    gap: 0.5rem;
  }

  .message-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
  }

  .message-input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .btn-send {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
  }

  .btn-send:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Loading and Error States */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    color: #64748b;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .error-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #64748b;
  }

  .btn-back {
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    display: inline-block;
    margin-top: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .lobby-content {
      grid-template-columns: 1fr;
    }

    .players-panel {
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
      max-height: 200px;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }

    .lobby-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
</style>