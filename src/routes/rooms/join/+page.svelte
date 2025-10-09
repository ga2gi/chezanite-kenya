<script>
  let roomCode = '';
  let playerName = '';

  function joinGame() {
    if (roomCode && playerName) {
      alert(`Joining room ${roomCode} as ${playerName}!`);
    } else {
      alert('Please enter both room code and your name!');
    }
  }
</script>

<div class="join-page">
  <div class="join-card card">
    <h2>Join a Game Room</h2>
    <p>Enter the room code and your name to join the fun!</p>

    <div class="form-group">
      <label for="roomCode">Room Code</label>
      <input 
        type="text" 
        id="roomCode"
        bind:value={roomCode}
        placeholder="Enter 6-digit code"
        maxlength="6"
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="playerName">Your Name</label>
      <input 
        type="text" 
        id="playerName"
        bind:value={playerName}
        placeholder="What should we call you?"
        class="input-field"
      />
    </div>

    <button class="btn-primary" on:click={joinGame}>Join Game!</button>

    <p class="helper-text">
      Don't have a code? <a href="/rooms">Create a room instead</a>
    </p>
  </div>
</div>

<style>
  .join-page {
    max-width: 500px;
    margin: 0 auto;
    padding: var(--space-lg) 0;
  }

  .join-card {
    text-align: center;
    padding: var(--space-xl);
  }

  .join-card h2 {
    font-size: 2rem;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-sm) 0;
  }

  .join-card p {
    font-size: 1.1rem;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-lg) 0;
  }

  .form-group {
    text-align: left;
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

  .helper-text {
    margin-top: var(--space-lg);
    color: var(--color-gray-800);
  }

  .helper-text a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
  }

  .helper-text a:hover {
    text-decoration: underline;
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
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
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
</style>