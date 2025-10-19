<script>
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';

  let email = '';
  let loading = false;
  let error = null;
  let success = false;
  let step = 'input'; // input, sent, success

  async function handleMagicLink() {
    if (!email) {
      error = 'Please enter your email address';
      return;
    }

    if (!isValidEmail(email)) {
      error = 'Please enter a valid email address';
      return;
    }

    loading = true;
    error = null;

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signInError) {
        error = signInError.message;
      } else {
        step = 'sent';
        success = true;
      }
    } catch (err) {
      error = 'Failed to send magic link. Please try again.';
    } finally {
      loading = false;
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function resetForm() {
    email = '';
    step = 'input';
    success = false;
    error = null;
  }

  async function handleQuickTest() {
    // For testing, create a random test email
    email = `test${Math.floor(Math.random() * 10000)}@chezanie.com`;
    await handleMagicLink();
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    {#if step === 'input'}
      <!-- Input Email Step -->
      <div class="auth-header">
        <h1>Welcome to ChezaNite! 🎮</h1>
        <p>Enter your email to get started. We'll send you a magic link to sign in.</p>
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="auth-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email}
            placeholder="your.email@example.com"
            disabled={loading}
          />
        </div>

        <button 
          on:click={handleMagicLink}
          disabled={loading}
          class="auth-button primary"
        >
          {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <button 
          on:click={handleQuickTest}
          disabled={loading}
          class="auth-button secondary"
        >
          Quick Test Account
        </button>

        <p class="auth-note">
          No password needed! Check your email for the magic link to sign in.
        </p>
      </div>

    {:else if step === 'sent'}
      <!-- Magic Link Sent Step -->
      <div class="success-state">
        <div class="success-icon">✉️</div>
        <h2>Magic Link Sent! 🎉</h2>
        <p>We've sent a sign-in link to:</p>
        <p class="email-sent"><strong>{email}</strong></p>
        
        <div class="instructions">
          <h3>What's next?</h3>
          <ol>
            <li>Check your email inbox</li>
            <li>Click the "Sign in to ChezaNite" link</li>
            <li>You'll be automatically logged in and ready to play!</li>
          </ol>
        </div>

        <div class="action-buttons">
          <button on:click={resetForm} class="auth-button secondary">
            Use Different Email
          </button>
          <button on:click={handleMagicLink} class="auth-button primary">
            Resend Magic Link
          </button>
        </div>

        <p class="help-text">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .auth-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    width: 100%;
    text-align: center;
  }

  .auth-header h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 10px;
  }

  .auth-header p {
    color: #718096;
    margin-bottom: 30px;
    line-height: 1.5;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    text-align: left;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
  }

  .form-group input {
    width: 100%;
    padding: 15px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  .form-group input:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
  }

  .auth-button {
    padding: 15px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .auth-button.primary {
    background: #4299e1;
    color: white;
  }

  .auth-button.primary:hover:not(:disabled) {
    background: #3182ce;
    transform: translateY(-1px);
  }

  .auth-button.secondary {
    background: #48bb78;
    color: white;
  }

  .auth-button.secondary:hover:not(:disabled) {
    background: #38a169;
    transform: translateY(-1px);
  }

  .auth-button:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: #718096;
    margin: 10px 0;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
  }

  .divider span {
    padding: 0 15px;
    font-size: 0.9rem;
  }

  .error-message {
    background: #fed7d7;
    color: #c53030;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
    border: 1px solid #feb2b2;
    text-align: left;
  }

  .auth-note {
    font-size: 0.9rem;
    color: #718096;
    margin-top: 20px;
    line-height: 1.4;
  }

  /* Success State */
  .success-state {
    text-align: center;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .success-state h2 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 10px;
  }

  .email-sent {
    font-size: 1.1rem;
    color: #4299e1;
    margin: 20px 0;
    padding: 15px;
    background: #ebf8ff;
    border-radius: 10px;
    border: 1px solid #bee3f8;
  }

  .instructions {
    text-align: left;
    background: #f7fafc;
    padding: 20px;
    border-radius: 10px;
    margin: 25px 0;
  }

  .instructions h3 {
    color: #2d3748;
    margin-bottom: 15px;
    font-size: 1.1rem;
  }

  .instructions ol {
    color: #4a5568;
    padding-left: 20px;
  }

  .instructions li {
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    margin: 25px 0;
  }

  .action-buttons .auth-button {
    flex: 1;
  }

  .help-text {
    font-size: 0.9rem;
    color: #718096;
    margin-top: 20px;
  }

  @media (max-width: 768px) {
    .auth-card {
      padding: 30px 25px;
      margin: 0 10px;
    }

    .auth-header h1 {
      font-size: 1.7rem;
    }

    .action-buttons {
      flex-direction: column;
    }
  }
</style>