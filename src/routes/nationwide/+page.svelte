<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user = null;
  let upcomingTournaments = [];
  let quickPlayStats = null;
  let isLoading = true;

  // Sample tournaments data
  const tournamentSchedule = [
    {
      id: 'monday-trivia',
      name: "Monday Night Trivia",
      time: "Mon, 8:00 PM",
      status: "upcoming",
      players: 0,
      duration: "10 mins",
      entry: "Premium",
      description: "20 questions, 30 seconds each"
    },
    {
      id: 'wednesday-challenge', 
      name: "Midweek Challenge",
      time: "Wed, 8:00 PM",
      status: "upcoming",
      players: 0,
      duration: "10 mins",
      entry: "Premium",
      description: "General knowledge & fun facts"
    },
    {
      id: 'friday-game-night',
      name: "Friday Game Night",
      time: "Fri, 8:00 PM", 
      status: "upcoming",
      players: 0,
      duration: "10 mins",
      entry: "Premium",
      description: "Mix of pop culture & trivia"
    }
  ];

  onMount(async () => {
    await checkAuth();
    loadTournamentData();
    loadQuickPlayStats();
  });

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
    isLoading = false;
  }

  function loadTournamentData() {
    // For now, use sample data. Replace with real Supabase data later
    upcomingTournaments = tournamentSchedule.map(tournament => ({
      ...tournament,
      players: Math.floor(Math.random() * 50) + 10 // Random player count for demo
    }));
  }

  function loadQuickPlayStats() {
    // TODO: Fetch user's quick play stats from Supabase
    quickPlayStats = {
      rank: "Bronze",
      points: 450,
      gamesPlayed: 15,
      winStreak: 3
    };
  }

  function joinTournament(tournamentId) {
    if (!user) {
      goto('/auth/signin');
      return;
    }
    // Navigate to tournament lobby
    goto(`/nationwide/lobby?tournament=${tournamentId}`);
  }

  function playQuickGame() {
    if (!user) {
      goto('/auth/signin');
      return;
    }
    // Navigate to quick play page
    goto('/nationwide/quick-play');
  }

  function viewLeaderboard() {
    goto('/leaderboard');
  }

  function subscribeNow() {
    if (!user) {
      goto('/auth/signin');
      return;
    }
    // TODO: Implement subscription flow
    alert('Subscription coming soon!');
  }
</script>

<div class="nationwide-page">
  <div class="container">
    
    <!-- Hero Section -->
    <section class="hero-section">
      <h1 class="hero-title">Nationwide Games</h1>
      <p class="hero-subtitle">Compete with players across Kenya in real-time tournaments</p>
      
      {#if user && quickPlayStats}
        <div class="user-stats">
          <div class="stat-card">
            <div class="stat-value">{quickPlayStats.rank}</div>
            <div class="stat-label">Your Rank</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{quickPlayStats.points}</div>
            <div class="stat-label">Points</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{quickPlayStats.winStreak}</div>
            <div class="stat-label">Win Streak</div>
          </div>
        </div>
      {:else if user}
        <p class="guest-text">Play your first game to see your stats!</p>
      {/if}
    </section>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <div class="action-grid">
        <div class="action-card" on:click={playQuickGame}>
          <div class="action-icon">⚡</div>
          <div class="action-content">
            <h3>Quick Play</h3>
            <p>10 questions, 20 seconds each. Play anytime!</p>
            <div class="action-meta">
              <span class="badge free">FREE</span>
              <span>~5 mins</span>
            </div>
          </div>
          <div class="action-arrow">→</div>
        </div>

        <div class="action-card" on:click={viewLeaderboard}>
          <div class="action-icon">🏆</div>
          <div class="action-content">
            <h3>Leaderboard</h3>
            <p>See top players nationwide</p>
            <div class="action-meta">
              <span class="badge free">FREE</span>
              <span>Live rankings</span>
            </div>
          </div>
          <div class="action-arrow">→</div>
        </div>
      </div>
    </section>

    <!-- Scheduled Tournaments -->
    <section class="tournaments-section">
      <div class="section-header">
        <h2>Weekly Tournaments</h2>
        <p>Join scheduled events with players across Kenya</p>
      </div>

      <div class="tournaments-grid">
        {#each upcomingTournaments as tournament}
          <div class="tournament-card {tournament.status}">
            <div class="tournament-header">
              <h3>{tournament.name}</h3>
              <div class="tournament-status {tournament.status}">
                {tournament.status === 'upcoming' ? 'UPCOMING' : tournament.status === 'live' ? 'LIVE NOW' : 'ENDED'}
              </div>
            </div>
            
            <div class="tournament-details">
              <div class="detail-item">
                <span class="detail-icon">⏰</span>
                <span>{tournament.time}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">⏱️</span>
                <span>{tournament.duration}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">👥</span>
                <span>{tournament.players} players joined</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">❓</span>
                <span>{tournament.description}</span>
              </div>
            </div>

            <div class="tournament-footer">
              <div class="entry-type {tournament.entry.toLowerCase()}">
                {tournament.entry}
              </div>
              <button 
                on:click={() => joinTournament(tournament.id)}
                class="btn-join"
                disabled={tournament.status === 'ended' || !user}
              >
                {#if tournament.status === 'upcoming'}
                  Join Tournament
                {:else if tournament.status === 'live'}
                  Join Now
                {:else}
                  Ended
                {/if}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Premium CTA -->
    <section class="premium-cta">
      <div class="cta-content">
        <h2>Get Unlimited Access</h2>
        <p>Play all tournaments, climb leaderboards, and compete nationwide</p>
        <div class="pricing">
          <span class="price">KSH 100</span>
          <span class="price-note">first month, then KSH 299/month</span>
        </div>
        <button class="btn-premium" on:click={subscribeNow}>
          Subscribe Now
        </button>
      </div>
    </section>

  </div>
</div>

<style>
  .nationwide-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 2rem 0;
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
    margin-bottom: 2rem;
  }

  .user-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-width: 120px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #64748b;
    font-size: 0.9rem;
  }

  .guest-text {
    color: #64748b;
    font-style: italic;
  }

  /* Quick Actions */
  .quick-actions {
    margin-bottom: 4rem;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .action-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
  }

  .action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: #3b82f6;
  }

  .action-icon {
    font-size: 3rem;
    flex-shrink: 0;
  }

  .action-content {
    flex: 1;
  }

  .action-content h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }

  .action-content p {
    color: #64748b;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .action-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge.free {
    background: #d1fae5;
    color: #065f46;
  }

  .badge.premium {
    background: #dbeafe;
    color: #1e40af;
  }

  .action-arrow {
    font-size: 1.5rem;
    color: #3b82f6;
    font-weight: bold;
    transition: transform 0.3s ease;
  }

  .action-card:hover .action-arrow {
    transform: translateX(4px);
  }

  /* Tournaments Section */
  .tournaments-section {
    margin-bottom: 4rem;
  }

  .section-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .section-header h2 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }

  .section-header p {
    color: #64748b;
    font-size: 1.1rem;
  }

  .tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .tournament-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .tournament-card:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
  }

  .tournament-card.live {
    border-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4, white);
  }

  .tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
  }

  .tournament-header h3 {
    font-size: 1.25rem;
    color: #1e293b;
    margin: 0;
  }

  .tournament-status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .tournament-status.upcoming {
    background: #dbeafe;
    color: #1e40af;
  }

  .tournament-status.live {
    background: #d1fae5;
    color: #065f46;
  }

  .tournament-status.ended {
    background: #f1f5f9;
    color: #64748b;
  }

  .tournament-details {
    margin-bottom: 1.5rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: #64748b;
  }

  .detail-icon {
    font-size: 1rem;
    min-width: 20px;
  }

  .tournament-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .entry-type {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .entry-type.premium {
    background: #fef3c7;
    color: #92400e;
  }

  .entry-type.free {
    background: #d1fae5;
    color: #065f46;
  }

  .btn-join {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-join:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-join:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  /* Premium CTA */
  .premium-cta {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
  }

  .cta-content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .cta-content p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    opacity: 0.9;
  }

  .pricing {
    margin-bottom: 2rem;
  }

  .price {
    font-size: 3rem;
    font-weight: 800;
    display: block;
  }

  .price-note {
    font-size: 1rem;
    opacity: 0.8;
  }

  .btn-premium {
    background: white;
    color: #3b82f6;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s;
  }

  .btn-premium:hover {
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.25rem;
    }

    .user-stats {
      flex-direction: column;
      gap: 1rem;
    }

    .action-grid {
      grid-template-columns: 1fr;
    }

    .action-card {
      padding: 1.5rem;
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .action-icon {
      margin-bottom: 0;
    }

    .tournaments-grid {
      grid-template-columns: 1fr;
    }

    .tournament-header {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .tournament-footer {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
    
    .btn-join {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: 2rem;
    }

    .container {
      padding: 0 1rem;
    }

    .action-card {
      padding: 1.25rem;
    }

    .tournament-card {
      padding: 1.25rem;
    }

    .premium-cta {
      padding: 2rem 1.5rem;
    }
  }
</style>