<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let displayName = '';
  let username = '';
  let isLoading = false;
  let error = '';

  async function handleSignUp(e) {
    e.preventDefault();
    isLoading = true;
    error = '';

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      isLoading = false;
      return;
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      isLoading = false;
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            username: username
          }
        }
      });

      if (signUpError) throw signUpError;

      // Successful sign up - redirect to home page
      console.log('Sign up successful, redirecting to home...');
      goto('/');

    } catch (err) {
      error = err.message;
      isLoading = false;
    }
  }

  // Clear error when user starts typing
  function clearError() {
    if (error) {
      error = '';
    }
  }
</script>

<div class="auth-page">
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <a href="/" class="logo">
          <div class="logo-icon">🎮</div>
          <span>ChezaNite</span>
        </a>
        <h1>Join ChezaNite!</h1>
        <p>Create your account to start playing</p>
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <form on:submit={handleSignUp} class="auth-form">
        <div class="form-group">
          <label for="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            bind:value={displayName}
            on:input={clearError}
            required
            placeholder="What should we call you?"
            class="form-input"
            disabled={isLoading}
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            bind:value={username}
            on:input={clearError}
            required
            placeholder="Choose a username"
            class="form-input"
            disabled={isLoading}
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            on:input={clearError}
            required
            placeholder="Enter your email"
            class="form-input"
            disabled={isLoading}
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            on:input={clearError}
            required
            placeholder="Create a password (min. 6 characters)"
            class="form-input"
            disabled={isLoading}
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            on:input={clearError}
            required
            placeholder="Confirm your password"
            class="form-input"
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          class="btn-primary" 
          disabled={isLoading}
          class:loading={isLoading}
        >
          {#if isLoading}
            <div class="button-spinner"></div>
            Creating Account...
          {:else}
            Create Account
          {/if}
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <a href="/auth/signin" class="auth-link">Sign in</a></p>
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
  }

  .auth-header {
    text-align: center;
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

  .auth-header h1 {
    font-size: 28px;
    margin-bottom: 8px;
    color: #1a1a1a;
  }

  .auth-header p {
    color: #666;
    margin: 0;
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
    border: 1px solid #fecaca;
  }

  .auth-form {
    margin-bottom: 25px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }

  .form-input {
    width: 100%;
    padding: 15px;
    border: 2px solid #eaeaea;
    border-radius: 12px;
    font-size: 16px;
    transition: border-color 0.3s;
  }

  .form-input:focus {
    outline: none;
    border-color: #7c3aed;
  }

  .form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    width: 100%;
    background: #7c3aed;
    color: white;
    border: none;
    padding: 15px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .btn-primary:hover:not(:disabled) {
    background: #6d28d9;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary.loading {
    opacity: 0.8;
  }

  .button-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .auth-footer {
    text-align: center;
    margin-top: 25px;
    padding-top: 25px;
    border-top: 1px solid #eaeaea;
  }

  .auth-footer p {
    color: #666;
    margin: 0;
  }

  .auth-link {
    color: #7c3aed;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-link:hover {
    text-decoration: underline;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>