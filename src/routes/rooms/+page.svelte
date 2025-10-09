<script>
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  let roomName = '';
  let isLoading = false;

  async function createRoom() {
    if (!roomName.trim()) {
      alert('Please give your room a name!');
      return;
    }

    isLoading = true;

    try {
      const roomCode = generateRoomCode();
      
      console.log('🔧 Creating room with code:', roomCode);
      
      // Save room to database
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert([
          { 
            code: roomCode, 
            name: roomName.trim(),
            // No game_type - room has access to all games!
          }
        ])
        .select();

      if (roomError) {
        console.error('❌ Room creation failed:', roomError);
        
        // If room code already exists, try again
        if (roomError.code === '23505') {
          console.log('Room code collision, trying again...');
          createRoom(); // Recursively try with new code
          return;
        }
        
        // Show specific error message
        if (roomError.code === '42501') {
          alert('Permission denied. Check your Supabase RLS policies.');
        } else {
          alert(`Failed to create room: ${roomError.message} (Code: ${roomError.code})`);
        }
        return;
      }

      console.log('✅ Room created successfully:', roomData);

      // Add the host as first player
      const { error: playerError } = await supabase
        .from('room_players')
        .insert([
          {
            room_code: roomCode,
            player_name: 'Host',
            is_host: true
          }
        ]);

      if (playerError) {
        console.error('❌ Host player creation failed:', playerError);
        // Continue anyway - room was created
        console.log('⚠️ Continuing to room without host player...');
      } else {
        console.log('✅ Host player added successfully');
      }

      // Navigate to the room page
      console.log('🚀 Navigating to room:', roomCode);
      await goto(`/room/${roomCode}`);
      
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      alert('Unexpected error creating room. Check console for details.');
    } finally {
      isLoading = false;
    }
  }

  function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
</script>

<div class="rooms-page">
  <div class="page-header">
    <h2>Game Rooms</h2>
    <p>Create a room and get access to ALL games!</p>
  </div>

  <div class="rooms-options">
    <!-- Create Room Card -->
    <div class="card room-card">
      <div class="room-icon create-icon">
        <span>🎮</span>
      </div>
      <h3>Create Game Room</h3>
      <p>One room = All games! Players can join and choose what to play.</p>
      
      <div class="create-form">
        <div class="form-group">
          <label for="roomName">Room Name</label>
          <input 
            type="text" 
            id="roomName"
            bind:value={roomName}
            placeholder="e.g., Family Game Night"
            class="input-field"
            disabled={isLoading}
          />
        </div>

        <button class="btn-primary" on:click={createRoom} disabled={isLoading}>
          {#if isLoading}
            ⏳ Creating Room...
          {:else}
            🎯 Create Game Room
          {/if}
        </button>
      </div>
    </div>

    <!-- Join Room Card -->
    <div class="card room-card">
      <div class="room-icon join-icon">
        <span>👥</span>
      </div>
      <h3>Join Room</h3>
      <p>Enter a room code to join the fun!</p>
      <a href="/rooms/join" class="btn-primary">Join Room</a>
    </div>
  </div>

  <!-- Games Preview -->
  <div class="games-preview">
    <h3>All Games Included:</h3>
    <div class="games-grid">
      <div class="game-preview">
        <div class="game-icon">🎯</div>
        <h4>Trivia Night</h4>
        <p>Test your knowledge with fun questions</p>
      </div>
      <div class="game-preview">
        <div class="game-icon">🎭</div>
        <h4>Charades</h4>
        <p>Act it out without saying the word!</p>
      </div>
      <div class="game-preview">
        <div class="game-icon">📝</div>
        <h4>Broken Paragraph</h4>
        <p>Fill in the blanks and reveal the story</p>
      </div>
      <div class="game-preview">
        <div class="game-icon">🕵️</div>
        <h4>Imposter Game</h4>
        <p>Find the imposter among you</p>
      </div>
    </div>
  </div>
</div>

<style>
  .rooms-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-lg) 0;
  }

  .page-header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .page-header h2 {
    font-size: 2.5rem;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-sm) 0;
  }

  .page-header p {
    font-size: 1.2rem;
    color: var(--color-gray-800);
    margin: 0;
  }

  .rooms-options {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    margin: 0 auto var(--space-xl) auto;
  }

  @media (min-width: 768px) {
    .rooms-options {
      grid-template-columns: 2fr 1fr;
    }
  }

  .room-card {
    text-align: center;
    padding: var(--space-xl);
  }

  .room-icon {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    margin: 0 auto var(--space-md) auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
  }

  .create-icon {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  }

  .join-icon {
    background: linear-gradient(135deg, var(--color-accent), var(--color-success));
  }

  .room-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-sm) 0;
  }

  .room-card p {
    font-size: 1rem;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-lg) 0;
  }

  .create-form {
    text-align: left;
  }

  .form-group {
    margin-bottom: var(--space-lg);
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: var(--color-gray-800);
    margin-bottom: var(--space-sm);
  }

  .input-field {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .input-field:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .btn-primary {
    display: inline-block;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: var(--color-white);
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    transition: all 0.3s ease;
    text-decoration: none;
    text-align: center;
    width: 100%;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .card {
    background: var(--color-white);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--color-gray-100);
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  /* Games Preview */
  .games-preview {
    text-align: center;
    padding: var(--space-xl);
    background: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .games-preview h3 {
    font-size: 1.8rem;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-lg) 0;
  }

  .games-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    .games-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .game-preview {
    text-align: center;
    padding: var(--space-lg);
  }

  .game-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-lg);
    margin: 0 auto var(--space-md) auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    background: var(--color-gray-100);
  }

  .game-preview h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-sm) 0;
  }

  .game-preview p {
    font-size: 0.9rem;
    color: var(--color-gray-600);
    margin: 0;
    line-height: 1.4;
  }
</style>