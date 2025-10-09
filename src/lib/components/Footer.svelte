<footer class="footer">
  <div class="footer-content">
    <!-- Logo and Description -->
    <div class="footer-section">
      <h3 class="footer-logo">ChezaNite</h3>
      <p class="footer-description">
        Kenya's favorite social gaming platform. Play with friends, make new ones, and have unforgettable game nights! 🎮
      </p>
    </div>

    <!-- Quick Links -->
    <div class="footer-section">
      <h4 class="footer-heading">Quick Links</h4>
      <div class="footer-links">
        <a href="/" class="footer-link">Home</a>
        <a href="/nationwide" class="footer-link">Nationwide</a>
        <a href="/rooms" class="footer-link">Rooms</a>
        <a href="/rooms/join" class="footer-link">Join Room</a>
      </div>
    </div>

    <!-- Games -->
    <div class="footer-section">
      <h4 class="footer-heading">Games</h4>
      <div class="footer-links">
        <span class="footer-game">Trivia Night</span>
        <span class="footer-game">Charades</span>
        <span class="footer-game">Broken Paragraph</span>
        <span class="footer-game">Imposter Game</span>
      </div>
    </div>

    <!-- Social -->
    <div class="footer-section">
      <h4 class="footer-heading">Connect</h4>
      <div class="social-links">
        <span class="social-link">📘 Facebook</span>
        <span class="social-link">📷 Instagram</span>
        <span class="social-link">🐦 Twitter</span>
      </div>
    </div>
  </div>

  <!-- Copyright -->
  <div class="footer-bottom">
    <p class="copyright">
      © 2024 ChezaNite. Made with ❤️ for Kenya.
    </p>
  </div>
</footer>

<style>
  .footer {
    background: var(--color-gray-800);
    color: white;
    margin-top: auto;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-lg);
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: var(--space-xl);
  }

  .footer-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .footer-logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .footer-description {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
    margin: 0;
  }

  .footer-heading {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .footer-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-link:hover {
    color: white;
  }

  .footer-game {
    color: rgba(255, 255, 255, 0.7);
  }

  .social-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .social-link {
    color: rgba(255, 255, 255, 0.7);
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: var(--space-lg);
  }

  .copyright {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: var(--space-lg);
      text-align: center;
    }

    .footer-links,
    .social-links {
      align-items: center;
    }
  }
</style>