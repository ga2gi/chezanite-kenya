<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';

  export let data;

  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      if (data.token_hash && data.type === 'magiclink') {
        // Verify the magic link token with Supabase
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'magiclink'
        });

        if (verifyError) {
          throw verifyError;
        }

        // Success! Redirect to the intended page
        await goto(data.next, { replace: true });
      } else {
        throw new Error('Invalid authentication parameters');
      }
    } catch (err) {
      console.error('Magic link verification error:', err);
      error = err.message;
      loading = false;
    }
  });
</script>

<div class="callback-container">
  <div class="callback-card">
    {#if loading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <h2>Completing Sign In...</h2>
        <p>Please wait while we verify your magic link.</p>
      </div>
    {:else if error}
      <div class="error-state">
        <div class="error-icon">❌</div>
        <h2>Sign In Failed</h2>
        <p>{error}</p>
        <div class="action-buttons">
          <button on:click={() => goto('/auth')} class="auth-button primary">
            Back to Sign In
          </button>
          <button on:click={() => location.reload()} class="auth-button secondary">
            Try Again
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .callback-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .callback-card {
    background: white;
    border-radius: 20px;
    padding: 50px 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    width: 100%;
    text-align: center;
  }

  .loading-state h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 10px;
  }

  .loading-state p {
    color: #718096;
    margin-bottom: 30px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #4299e1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 25px;
  }

  .error-state {
    color: #2d3748;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .error-state h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: #e53e3e;
  }

  .error-state p {
    color: #718096;
    margin-bottom: 25px;
    line-height: 1.5;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .auth-button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 120px;
  }

  .auth-button.primary {
    background: #4299e1;
    color: white;
  }

  .auth-button.primary:hover {
    background: #3182ce;
  }

  .auth-button.secondary {
    background: #718096;
    color: white;
  }

  .auth-button.secondary:hover {
    background: #4a5568;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .callback-card {
      padding: 40px 25px;
      margin: 0 10px;
    }

    .action-buttons {
      flex-direction: column;
    }

    .auth-button {
      width: 100%;
    }
  }
</style>