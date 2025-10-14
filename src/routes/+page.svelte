<script>
  import { goto } from '$app/navigation';

  function navigateTo(path) {
    goto(path);
  }
</script>

<div class="homepage">
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">Game Nights Made Awesome!</h1>
        <p class="hero-subtitle">
          Play with friends in rooms or compete nationwide. Fun guaranteed! ❤️
        </p>
        
        <div class="hero-cards">
          <div class="feature-card">
            <div class="card-icon">🇰🇪</div>
            <h3>Nationwide</h3>
            <p>Compete with players across Kenya!</p>
            <button on:click={() => navigateTo('/nationwide')} class="btn-card">
              Play Now
            </button>
          </div>

          <div class="feature-card">
            <div class="card-icon">👨‍👩‍👧‍👦</div>
            <h3>Rooms</h3>
            <p>Play with friends & family!</p>
            <button on:click={() => navigateTo('/rooms')} class="btn-card">
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- How to Play Section -->
  <section class="how-to-play">
    <div class="container">
      <h2 class="section-title">How to Play</h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Choose Your Mode</h3>
            <p>Play with friends in private rooms or compete nationwide</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Join the Fun</h3>
            <p>Enter a room code or jump into a nationwide tournament</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Play & Connect</h3>
            <p>Enjoy exciting games and make unforgettable memories</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .homepage {
    padding-bottom: 0;
  }

  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    color: white;
    padding: 100px 0;
    text-align: center;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 20px;
    margin-bottom: 60px;
    opacity: 0.9;
    line-height: 1.6;
  }

  .hero-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 700px;
    margin: 0 auto;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 40px 30px;
    text-align: center;
    transition: transform 0.3s, background 0.3s;
  }

  .feature-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }

  .card-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .feature-card h3 {
    font-size: 24px;
    margin-bottom: 15px;
    font-weight: 600;
  }

  .feature-card p {
    margin-bottom: 25px;
    opacity: 0.9;
    line-height: 1.5;
  }

  .btn-card {
    background: white;
    color: #7c3aed;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-card:hover {
    background: #f8fafc;
    transform: scale(1.05);
  }

  /* How to Play Section */
  .how-to-play {
    padding: 100px 0;
    background: #f8fafc;
  }

  .section-title {
    text-align: center;
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 60px;
    color: #1a1a1a;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .step {
    text-align: center;
    padding: 0 20px;
  }

  .step-number {
    width: 60px;
    height: 60px;
    background: #7c3aed;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    margin: 0 auto 25px;
  }

  .step-content h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #1a1a1a;
    font-weight: 600;
  }

  .step-content p {
    color: #666;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 36px;
    }

    .hero-subtitle {
      font-size: 18px;
    }

    .hero-cards {
      grid-template-columns: 1fr;
    }

    .steps {
      grid-template-columns: 1fr;
    }

    .how-to-play {
      padding: 60px 0;
    }
  }
</style>