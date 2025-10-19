<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';
  
  let user = null;
  let playerStats = {
    rank: 15,
    points: 1250,
    streak: 3,
    totalGames: 18,
    winRate: 70,
    bestScore: 480
  };

  let featuredTournaments = [
    {
      id: 1,
      name: "Monday Night Trivia",
      status: "UPCOMING",
      schedule: "Mon, 8:00 PM",
      duration: "10 mins",
      playersJoined: 11,
      description: "20 questions, 30 seconds each",
      type: "premium",
      entryFee: "Premium",
      prize: "KSH 5,000"
    },
    {
      id: 2,
      name: "Midweek Challenge", 
      status: "UPCOMING",
      schedule: "Wed, 8:00 PM",
      duration: "10 mins",
      playersJoined: 33,
      description: "General knowledge & fun facts",
      type: "premium",
      entryFee: "Premium",
      prize: "KSH 3,000"
    },
    {
      id: 3,
      name: "Friday Game Night",
      status: "UPCOMING",
      schedule: "Fri, 8:00 PM",
      duration: "10 mins",
      playersJoined: 55,
      description: "Mix of pop culture & trivia",
      type: "premium",
      entryFee: "Premium",
      prize: "KSH 7,000"
    }
  ];

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
    
    if (user) {
      await loadPlayerStats();
    }
  });

  async function loadPlayerStats() {
    // In a real app, you'd fetch this from your database
    console.log('Loading player stats for:', user.id);
  }

  function goToAuth() {
    goto('/auth');
  }

  function joinTournament(tournamentId) {
    if (!user) {
      goto('/auth');
      return;
    }
    alert(`Joining tournament ${tournamentId} - Premium feature coming soon!`);
  }

  function viewAllTournaments() {
    goto('/nationwide/tournaments');
  }
</script>

<div class="nationwide-container">
  <!-- Header -->
  <header class="game-header">
    <div class="header-content">
      <h1>Nationwide Games</h1>
      <p>Compete with players across Kenya in real-time tournaments</p>
    </div>
  </header>

  <!-- Sign In Prompt -->
  {#if !user}
    <div class="signin-prompt">
      <div class="signin-card">
        <h3>Sign In to Play</h3>
        <p>Create an account to play games and compete on the leaderboard</p>
        <button on:click={goToAuth} class="signin-button">Sign In / Sign Up</button>
      </div>
    </div>
  {/if}

  <!-- Player Stats (only show if signed in) -->
  {#if user}
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number bronze">#{playerStats.rank}</div>
        <div class="stat-label">Your Rank</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{playerStats.points}</div>
        <div class="stat-label">Points</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{playerStats.streak}</div>
        <div class="stat-label">Win Streak</div>
      </div>
    </div>
  {/if}

  <!-- Quick Play Section -->
  <section class="game-section">
    <div class="game-card quick-play-card">
      <div class="game-info">
        <h2>Quick Play</h2>
        <p class="game-description">10 questions, 20 seconds each. Play anytime!</p>
        <div class="game-meta">
          <span class="price-tag free">FREE</span>
          <span class="time-estimate">~5 mins</span>
        </div>
      </div>
      <div class="game-action">
        {#if user}
          <a href="/nationwide/quick-play" class="play-button">Play Now</a>
        {:else}
          <button on:click={goToAuth} class="play-button">Sign In to Play</button>
        {/if}
      </div>
    </div>
  </section>

  <!-- Featured Tournaments Section -->
  <section class="tournaments-section">
    <div class="section-header">
      <h2 class="section-title">Featured Tournaments</h2>
      <p class="section-subtitle">Join scheduled events with players across Kenya</p>
      <button on:click={viewAllTournaments} class="view-all-button">View All Tournaments →</button>
    </div>

    <div class="tournaments-grid">
      {#each featuredTournaments as tournament}
        <div class="tournament-card">
          <div class="tournament-header">
            <h3>{tournament.name}</h3>
            <span class="tournament-status {tournament.status.toLowerCase()}">{tournament.status}</span>
          </div>
          
          <div class="tournament-details">
            <div class="detail-item">
              <span class="detail-icon">🕒</span>
              <span>{tournament.schedule}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⏱️</span>
              <span>{tournament.duration}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👥</span>
              <span>{tournament.playersJoined} players joined</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">💰</span>
              <span>Prize: {tournament.prize}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">❓</span>
              <span>{tournament.description}</span>
            </div>
          </div>

          <div class="tournament-footer">
            <span class="tournament-type {tournament.type}">{tournament.entryFee}</span>
            <button 
              on:click={() => joinTournament(tournament.id)}
              class="tournament-button {tournament.type}"
            >
              {tournament.type === 'premium' ? 'Premium Required' : 'Join Tournament'}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- How to Play Section -->
  <section class="how-to-play">
    <h2 class="section-title">How to Play</h2>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Choose Your Mode</h3>
        <p>Play with friends in private rooms or compete nationwide</p>
      </div>
      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Join the Fun</h3>
        <p>Enter a room code or jump into a nationwide tournament</p>
      </div>
      <div class="step-card">
        <div class="step-number">3</div>
        <h3>Play & Connect</h3>
        <p>Enjoy exciting games and make unforgettable memories</p>
      </div>
    </div>
  </section>

  <!-- Premium CTA Section -->
  <section class="premium-cta">
    <div class="premium-card">
      <div class="premium-content">
        <h2>Get Unlimited Access</h2>
        <p class="premium-description">Play all tournaments, climb leaderboards, and compete nationwide</p>
        
        <div class="pricing">
          <div class="price-amount">KSH 100</div>
          <div class="price-period">first month, then KSH 299/month</div>
        </div>

        <button class="premium-button">Subscribe Now</button>
      </div>
      
      <div class="premium-features">
        <div class="feature-item">✅ All Tournaments</div>
        <div class="feature-item">✅ Priority Matchmaking</div>
        <div class="feature-item">✅ Exclusive Badges</div>
        <div class="feature-item">✅ Ad-Free Experience</div>
      </div>
    </div>
  </section>
</div>

<style>
  .nationwide-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .game-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px 0;
  }

  .game-header h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .game-header p {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .signin-prompt {
    max-width: 500px;
    margin: 0 auto 40px;
  }

  .signin-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .signin-card h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-weight: 600;
  }

  .signin-card p {
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .signin-button {
    background: #48bb78;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .signin-button:hover {
    background: #38a169;
    transform: translateY(-1px);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 400px;
    margin: 0 auto 40px;
  }

  .stat-card {
    background: white;
    color: #2d3748;
    padding: 25px 15px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .stat-number.bronze {
    color: #cd7f32;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
    color: #4299e1;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #718096;
    font-weight: 500;
  }

  .game-section {
    margin-bottom: 40px;
  }

  .game-card {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
  }

  .quick-play-card {
    border-left: 5px solid #48bb78;
  }

  .game-info {
    flex: 1;
  }

  .game-info h2 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 8px;
  }

  .game-description {
    color: #718096;
    font-size: 1.1rem;
    margin-bottom: 15px;
  }

  .game-meta {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .price-tag {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .price-tag.free {
    background: #c6f6d5;
    color: #276749;
  }

  .time-estimate {
    color: #718096;
    font-size: 0.9rem;
  }

  .game-action {
    margin-left: 20px;
  }

  .play-button {
    background: #4299e1;
    color: white;
    padding: 12px 30px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease;
    display: inline-block;
    border: none;
    cursor: pointer;
  }

  .play-button:hover {
    background: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
  }

  /* Tournaments Section */
  .tournaments-section {
    margin-bottom: 50px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .section-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 20px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .view-all-button {
    background: transparent;
    color: white;
    border: 2px solid white;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .view-all-button:hover {
    background: white;
    color: #667eea;
  }

  .tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 25px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .tournament-card {
    background: white;
    border-radius: 15px;
    padding: 25px;
    color: #2d3748;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
  }

  .tournament-card:hover {
    transform: translateY(-3px);
  }

  .tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .tournament-header h3 {
    font-size: 1.4rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0;
  }

  .tournament-status {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .tournament-status.upcoming {
    background: #fff3cd;
    color: #856404;
  }

  .tournament-details {
    margin-bottom: 20px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 0.95rem;
    color: #718096;
  }

  .detail-icon {
    font-size: 1rem;
  }

  .tournament-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e2e8f0;
  }

  .tournament-type {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .tournament-type.premium {
    background: #fef3c7;
    color: #d97706;
  }

  .tournament-button {
    padding: 8px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tournament-button.premium {
    background: #f59e0b;
    color: white;
  }

  .tournament-button.premium:hover {
    background: #d97706;
  }

  /* How to Play Section */
  .how-to-play {
    margin-bottom: 50px;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
    max-width: 900px;
    margin: 0 auto;
  }

  .step-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 30px 25px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s ease;
  }

  .step-card:hover {
    transform: translateY(-2px);
  }

  .step-number {
    width: 50px;
    height: 50px;
    background: #4299e1;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0 auto 15px;
  }

  .step-card h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .step-card p {
    font-size: 0.95rem;
    opacity: 0.9;
    line-height: 1.5;
  }

  /* Premium CTA Section */
  .premium-cta {
    max-width: 800px;
    margin: 0 auto;
  }

  .premium-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    color: #2d3748;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    align-items: center;
  }

  .premium-content h2 {
    font-size: 2.2rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: #2d3748;
  }

  .premium-description {
    font-size: 1.1rem;
    color: #718096;
    margin-bottom: 25px;
    line-height: 1.5;
  }

  .pricing {
    margin-bottom: 25px;
  }

  .price-amount {
    font-size: 2.5rem;
    font-weight: bold;
    color: #4299e1;
    margin-bottom: 5px;
  }

  .price-period {
    font-size: 1rem;
    color: #718096;
  }

  .premium-button {
    background: #f59e0b;
    color: white;
    border: none;
    padding: 15px 40px;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .premium-button:hover {
    background: #d97706;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
  }

  .premium-features {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .feature-item {
    font-size: 1rem;
    font-weight: 500;
    color: #4a5568;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
      max-width: 250px;
    }

    .game-card {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }

    .game-action {
      margin-left: 0;
    }

    .tournaments-grid {
      grid-template-columns: 1fr;
    }

    .steps-grid {
      grid-template-columns: 1fr;
    }

    .premium-card {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 30px;
    }

    .tournament-header {
      flex-direction: column;
      gap: 10px;
    }

    .tournament-footer {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }

    .tournament-button {
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .nationwide-container {
      padding: 15px;
    }

    .game-header h1 {
      font-size: 2rem;
    }

    .game-header p {
      font-size: 1rem;
    }

    .section-title {
      font-size: 1.7rem;
    }

    .premium-card {
      padding: 25px 20px;
    }

    .premium-content h2 {
      font-size: 1.8rem;
    }
  }
</style>