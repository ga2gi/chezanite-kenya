<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  let sessionId = $page.params.sessionId;
  let gameType = 'quickplay'; // quickplay or tournament
  let isLoading = true;
  
  onMount(() => {
    // Determine game type from session ID or URL params
    loadGameSession();
  });
  
  function loadGameSession() {
    // TODO: Fetch game session data from Supabase
    // const { data, error } = await supabase.from('game_sessions').select('*').eq('id', sessionId);
    isLoading = false;
  }
</script>

{#if isLoading}
  <div class="loading-screen">
    <div class="loading-spinner">⏳</div>
    <p>Loading game session...</p>
  </div>
{:else}
  <!-- Use the main game component but with session-specific data -->
  <div>Game Session: {sessionId}</div>
{/if}

<style>
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
    color: white;
  }
  
  .loading-spinner {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>