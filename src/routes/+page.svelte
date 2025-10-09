<div class="landing-page">
  <!-- Big Title -->
  <div class="hero">
    <h2 class="hero-title">
      Game Nights Made <span class="hero-highlight">Awesome!</span>
    </h2>
    <p class="hero-text">
      Play with friends in rooms or compete nationwide. Fun guaranteed! ✨
    </p>
  </div>

  <!-- Two Big Game Buttons -->
  <div class="game-options">
    <!-- Nationwide Card -->
    <div class="card game-card">
      <div class="game-icon nationwide-icon">
        <span>🏆</span>
      </div>
      <h3 class="game-title">Nationwide</h3>
      <p class="game-description">Compete with players across Kenya!</p>
      <a href="/nationwide" class="btn-primary">Play Now</a>
    </div>

    <!-- Rooms Card -->
    <div class="card game-card">
      <div class="game-icon rooms-icon">
        <span>👥</span>
      </div>
      <h3 class="game-title">Rooms</h3>
      <p class="game-description">Play with friends & family!</p>
      <a href="/rooms" class="btn-primary">Create Room</a>
    </div>
  </div>

  <!-- How It Works Section -->
  <div class="how-it-works">
    <h3 class="section-title">How to Play</h3>
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <h4>Choose Your Mode</h4>
        <p>Play with friends in private rooms or compete nationwide</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <h4>Join the Fun</h4>
        <p>Enter a room code or jump into a nationwide tournament</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <h4>Play & Connect</h4>
        <p>Enjoy exciting games and make unforgettable memories</p>
      </div>
    </div>
  </div>
</div>

<style>
  .landing-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-lg) 0;
  }

  .hero {
    text-align: center;
    margin-bottom: var(--space-xl);
    padding: 0 var(--space-md);
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-md) 0;
    line-height: 1.2;
  }

  .hero-highlight {
    color: var(--color-secondary);
  }

  .hero-text {
    font-size: 1.4rem;
    color: var(--color-gray-800);
    margin: 0;
    opacity: 0.8;
  }

  .game-options {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    max-width: 800px;
    margin: 0 auto var(--space-xl) auto;
  }

  @media (min-width: 768px) {
    .game-options {
      grid-template-columns: 1fr 1fr;
    }
  }

  .game-card {
    text-align: center;
    padding: var(--space-xl);
  }

  .game-icon {
    width: 100px;
    height: 100px;
    border-radius: var(--radius-xl);
    margin: 0 auto var(--space-lg) auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
  }

  .nationwide-icon {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  }

  .rooms-icon {
    background: linear-gradient(135deg, var(--color-accent), var(--color-success));
  }

  .game-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-md) 0;
  }

  .game-description {
    font-size: 1.1rem;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-lg) 0;
    opacity: 0.8;
    line-height: 1.5;
  }

  .how-it-works {
    text-align: center;
    padding: var(--space-xl) var(--space-md);
    background: var(--color-white);
    border-radius: var(--radius-xl);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin: var(--space-xl) auto;
    max-width: 900px;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-xl) 0;
  }

  .steps {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    .steps {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .step {
    text-align: center;
    padding: var(--space-lg);
  }

  .step-number {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 auto var(--space-md) auto;
  }

  .step h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-gray-800);
    margin: 0 0 var(--space-sm) 0;
  }

  .step p {
    color: var(--color-gray-800);
    opacity: 0.8;
    line-height: 1.5;
    margin: 0;
  }

  .btn-primary {
    display: inline-block;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: var(--color-white);
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    transition: all 0.3s ease;
    text-decoration: none;
    text-align: center;
    min-width: 140px;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  }

  .card {
    background: var(--color-white);
    border-radius: var(--radius-xl);
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