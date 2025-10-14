<script>
  import { goto } from '$app/navigation';

  let countdown = 5;

  setTimeout(() => {
    goto('/');
  }, 5000);

  setInterval(() => {
    if (countdown > 0) countdown--;
  }, 1000);
</script>

<div class="auth-page">
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <a href="/" class="logo">
          <div class="logo-icon">🎮</div>
          <span>ChezaNite</span>
        </a>
        <div class="success-icon">✅</div>
        <h1>Check Your Email!</h1>
        <p>We've sent a verification link to your email address.</p>
      </div>

      <div class="verify-content">
        <p>Click the link in the email to verify your account and start playing.</p>
        <p class="redirect-text">Redirecting to homepage in {countdown} seconds...</p>
      </div>

      <div class="auth-footer">
        <a href="/" class="btn-primary">Go Home Now</a>
      </div>
    </div>
  </div>
</div>

<style>
  .auth-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .auth-container {
    width: 100%;
    max-width: 400px;
  }

  .auth-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .auth-header {
    margin-bottom: 30px;
  }

  .auth-header .logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    text-decoration: none;
    font-weight: bold;
    font-size: 20px;
    color: #7c3aed;
  }

  .success-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .auth-header h1 {
    font-size: 28px;
    margin-bottom: 8px;
    color: #1a1a1a;
  }

  .auth-header p {
    color: #666;
    margin: 0;
  }

  .verify-content {
    margin-bottom: 30px;
  }

  .verify-content p {
    color: #666;
    margin-bottom: 15px;
    line-height: 1.5;
  }

  .redirect-text {
    color: #7c3aed !important;
    font-weight: 500;
  }

  .btn-primary {
    background: #7c3aed;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.3s;
    display: inline-block;
  }

  .btn-primary:hover {
    background: #6d28d9;
  }
</style>