<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user: any = null;
  let profile: any = null;
  let roomCode: string = '';
  let roomName: string = '';
  let isLoading: boolean = false;
  let activeRooms: any[] = [];
  let isCreating: boolean = false;
  let isJoining: boolean = false;

  onMount(() => {
    (async () => {
      await checkAuth();
    })();
  });

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user;
      
      if (user) {
        await loadUserProfile();
        await loadActiveRooms();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  async function loadUserProfile() {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    } catch (error) {
      console.error('Profile error:', error);
    }
  }

  async function loadActiveRooms() {
    try {
      const { data, error } = await supabase
        .from('room_players')
        .select(`
          room_id,
          rooms (
            id,
            name,
            status,
            current_players,
            max_players,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('rooms.status', 'waiting');

      if (!error && data) {
        activeRooms = data.map(item => item.rooms).filter(room => room);
      }
    } catch (error) {
      console.error('Rooms load error:', error);
    }
  }

  async function createRoom() {
    if (!user) {
      goto('/auth/signin');
      return;
    }

    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    isCreating = true;

    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          name: roomName.trim(),
          game_type: 'multi',
          max_players: 8,
          is_private: false,
          created_by: user.id,
          status: 'waiting',
          current_players: 1
        })
        .select()
        .single();

      if (error) throw error;

      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          user_id: user.id,
          is_host: true
        });

      if (playerError) throw playerError;

      goto(`/rooms/${room.id}`);

    } catch (error) {
      console.error('Create room error:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      isCreating = false;
    }
  }

  async function joinRoom() {
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }

    if (!user) {
      goto('/auth/signin');
      return;
    }

    isJoining = true;

    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomCode.trim())
        .single();

      if (error || !room) {
        alert('Room not found. Please check the code.');
        return;
      }

      if (room.status !== 'waiting') {
        alert('Room not available for joining.');
        return;
      }

      if (room.current_players >= room.max_players) {
        alert('Room is full.');
        return;
      }

      const { error: joinError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          user_id: user.id,
          is_host: false
        });

      if (joinError && joinError.code !== '23505') {
        throw joinError;
      }

      if (!joinError || joinError.code === '23505') {
        await supabase
          .from('rooms')
          .update({ current_players: room.current_players + 1 })
          .eq('id', room.id);
      }

      goto(`/rooms/${room.id}`);

    } catch (error) {
      console.error('Join room error:', error);
      alert('Failed to join room. Please try again.');
    } finally {
      isJoining = false;
    }
  }

  function quickJoinRoom(roomId: string) {
    goto(`/rooms/${roomId}`);
  }

  function copyRoomCode(code: string) {
    navigator.clipboard.writeText(code);
    alert('Room code copied!');
  }

  function handleCreateKeyPress(e: KeyboardEvent) {
    if ((e as KeyboardEvent).key === 'Enter') createRoom();
  }

  function handleJoinKeyPress(e: KeyboardEvent) {
    if ((e as KeyboardEvent).key === 'Enter') joinRoom();
  }
</script>

<div class="rooms-page">
  <div class="container">
    <!-- Hero Section -->
    <section class="hero-section">
      <h1 class="hero-title">Game Rooms</h1>
      <p class="hero-subtitle">COMING SOON!</p>
      
      {#if user}
        <p class="welcome-text">Welcome, {profile?.display_name || user.email}!</p>
      {:else}
        <p class="guest-text">Sign in to create or join rooms</p>
      {/if}
    </section>

    <!-- Actions Grid -->
    <div class="actions-grid">
      <!-- Create Room Card -->
      <div class="action-card create-card">
        <div class="card-icon">🎮</div>
        <div class="card-content">
          <h2>Create Room</h2>
          <p class="card-description">Start a new game room with friends & family</p>
          
          <div class="form-group">
            <label for="roomName">Room Name</label>
            <input
              id="roomName"
              type="text"
              placeholder="e.g., Family Game Night"
              bind:value={roomName}
              on:keypress={handleCreateKeyPress}
              class="form-input"
              maxlength="50"
            />
          </div>

          <div class="games-preview">
            <h4>All Games Included:</h4>
            <div class="games-list">
              <div class="game-badge">❓ Trivia</div>
              <div class="game-badge">🎭 Charades</div>
              <div class="game-badge">📝 Broken Paragraph</div>
              <div class="game-badge">🕵️ Imposter</div>
            </div>
          </div>

          <button
            on:click={createRoom}
            class="btn btn-create"
            disabled={!roomName.trim() || !user || isCreating}
          >
            {#if isCreating}
              <span class="btn-loading">Creating Room...</span>
            {:else if user}
              Create Game Room
            {:else}
              Sign In to Create
            {/if}
          </button>
        </div>
      </div>

      <!-- Join Room Card -->
      <div class="action-card join-card">
        <div class="card-icon">🚀</div>
        <div class="card-content">
          <h2>Join Room</h2>
          <p class="card-description">Enter a code to join existing room</p>
          
          <div class="form-group">
            <label for="roomCode">Room Code</label>
            <input
              id="roomCode"
              type="text"
              placeholder="Enter room code"
              bind:value={roomCode}
              on:keypress={handleJoinKeyPress}
              class="form-input"
              maxlength="36"
            />
          </div>

          <div class="join-instructions">
            <h4>How to join:</h4>
            <div class="steps">
              <div class="step">
                <span class="step-number">1</span>
                <span>Get room code from friend</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span>Enter code above</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span>Click "Join Room"</span>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <span>Start playing!</span>
              </div>
            </div>
          </div>

          <button
            on:click={joinRoom}
            class="btn btn-join"
            disabled={!roomCode.trim() || !user || isJoining}
          >
            {#if isJoining}
              <span class="btn-loading">Joining Room...</span>
            {:else if user}
              Join Room
            {:else}
              Sign In to Join
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Active Rooms Section -->
    <section class="active-rooms-section">
      <div class="section-header">
        <h2>Your Active Rooms</h2>
        <p>Rooms you're currently playing in</p>
      </div>
      
      {#if user}
        {#if activeRooms.length > 0}
          <div class="rooms-grid">
            {#each activeRooms as room}
              <div class="room-card">
                <div class="room-header">
                  <h3>{room.name}</h3>
                  <div class="room-status {room.status}">
                    {room.current_players}/{room.max_players} players
                  </div>
                </div>
                
                <div class="room-details">
                  <div class="room-code">
                    <span>Room Code:</span>
                    <div class="code-display">
                      <strong>{room.id}</strong>
                      <button 
                        on:click={() => copyRoomCode(room.id)} 
                        class="btn-copy"
                        title="Copy code"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  on:click={() => quickJoinRoom(room.id)} 
                  class="btn btn-quick-join"
                >
                  Join Room
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-rooms">
            <div class="no-rooms-icon">🏠</div>
            <h3>No Active Rooms Yet</h3>
            <p>Create your first room or join one to start playing with friends!</p>
          </div>
        {/if}
      {:else}
        <div class="sign-in-prompt">
          <div class="sign-in-icon">👋</div>
          <h3>Join the Fun!</h3>
          <p>Sign in to create rooms, join games, and play with friends</p>
          <a href="/auth/signin" class="btn btn-signin">Sign In to Play</a>
        </div>
      {/if}
    </section>
  </div>
</div>

<style>
  /* Light & Cheerful Color Scheme */
  :global(body) {
    background: #f8fafc;
    color: #334155;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .rooms-page {
    min-height: 100vh;
    padding: 2rem 0;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* Hero Section */
  .hero-section {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem 0;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: #64748b;
    margin-bottom: 1rem;
  }

  .welcome-text {
    color: #059669;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .guest-text {
    color: #d97706;
    font-weight: 500;
  }

  /* Actions Grid */
  .actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .action-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .action-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
  }

  .action-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  }

  .card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .card-content h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #1e293b;
    text-align: center;
  }

  .card-description {
    color: #64748b;
    text-align: center;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #475569;
    font-weight: 600;
  }

  .form-input {
    width: 100%;
    padding: 1rem 1.25rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    color: #334155;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-input::placeholder {
    color: #94a3b8;
  }

  /* Games Preview */
  .games-preview {
    margin-bottom: 2rem;
  }

  .games-preview h4 {
    margin-bottom: 1rem;
    color: #475569;
    font-size: 1.1rem;
  }

  .games-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .game-badge {
    background: #f1f5f9;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    color: #475569;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .game-badge:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }

  /* Join Instructions */
  .join-instructions {
    margin-bottom: 2rem;
  }

  .join-instructions h4 {
    margin-bottom: 1rem;
    color: #475569;
    font-size: 1.1rem;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 10px;
    border-left: 3px solid #3b82f6;
  }

  .step-number {
    background: #3b82f6;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  /* Buttons */
  .btn {
    width: 100%;
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-create {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
  }

  .btn-create:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  .btn-join {
    background: linear-gradient(135deg, #10b981, #34d399);
    color: white;
  }

  .btn-join:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-loading::after {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Active Rooms Section */
  .active-rooms-section {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  .section-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .section-header h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }

  .section-header p {
    color: #64748b;
    font-size: 1.1rem;
  }

  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .room-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .room-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
  }

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
  }

  .room-header h3 {
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .room-status {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .room-details {
    margin-bottom: 1.5rem;
  }

  .room-code {
    color: #64748b;
  }

  .code-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .code-display strong {
    color: #1e293b;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.9rem;
    flex: 1;
  }

  .btn-copy {
    background: #f1f5f9;
    border: none;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;
  }

  .btn-copy:hover {
    background: #e2e8f0;
  }

  .btn-quick-join {
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
  }

  .btn-quick-join:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  /* Empty States */
  .no-rooms,
  .sign-in-prompt {
    text-align: center;
    padding: 3rem 2rem;
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
  }

  .no-rooms-icon,
  .sign-in-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .no-rooms h3,
  .sign-in-prompt h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }

  .no-rooms p,
  .sign-in-prompt p {
    color: #64748b;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .btn-signin {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    display: inline-block;
    transition: all 0.3s ease;
  }

  .btn-signin:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .rooms-page {
      padding: 1rem 0;
    }

    .hero-title {
      font-size: 2.25rem;
    }

    .actions-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .action-card {
      padding: 2rem;
    }

    .active-rooms-section {
      padding: 2rem;
    }

    .rooms-grid {
      grid-template-columns: 1fr;
    }

    .room-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .games-list {
      justify-content: center;
    }
  }
</style>