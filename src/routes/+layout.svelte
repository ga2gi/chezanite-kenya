<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let user: any = null;
  let loading: boolean = true;

  onMount(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user;
      } catch (err) {
        console.error('Layout auth error:', err);
      } finally {
        loading = false;
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      user = session?.user;

      if (event === 'SIGNED_IN') {
        console.log('User signed in:', user?.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        user = null;
      }
    });

    return () => subscription.unsubscribe();
  });

  async function handleSignOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      user = null;
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }

  function navigateTo(path: string): void {
    goto(path);
  }
</script>

<svelte:head>
  <title>ChezaNite - Kenya's Favorite Social Gaming Platform</title>
  <meta name="description" content="Play with friends in rooms or compete nationwide. Fun guaranteed with ChezaNite Kenya!" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" />
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="ChezaNite - Game Nights Made Awesome!" />
  <meta property="og:description" content="Play with friends in rooms or compete nationwide. Fun guaranteed!" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://chezanie.com" />
  
  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ChezaNite - Kenya's Favorite Social Gaming Platform" />
  <meta name="twitter:description" content="Play with friends in rooms or compete nationwide. Fun guaranteed!" />
</svelte:head>

<div class="layout">
  <Header {user} {handleSignOut} {navigateTo} />

  {#if loading}
    <!-- Global Loading State -->
    <div class="global-loading">
      <div class="loading-spinner"></div>
      <p>Loading ChezaNite...</p>
    </div>
  {:else}
    <main class="main-content">
      <slot />
    </main>
    <Footer />
  {/if}

  <!-- Global Error Handler (optional) -->
  <div class="global-alerts">
    <!-- Can be used for global notifications -->
  </div>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #2d3748;
    background: #f7fafc;
    overflow-x: hidden;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  :global(button) {
    font-family: inherit;
    cursor: pointer;
  }

  :global(input, textarea, select) {
    font-family: inherit;
  }

  :global(.sr-only) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* Global Loading Styles */
  .global-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 70px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 40px 20px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .global-loading p {
    font-size: 1.2rem;
    font-weight: 500;
    opacity: 0.9;
  }

  /* Global Alerts */
  .global-alerts {
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 1100;
    max-width: 400px;
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  /* Utility Classes */
  :global(.container) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  :global(.text-center) {
    text-align: center;
  }

  :global(.text-left) {
    text-align: left;
  }

  :global(.text-right) {
    text-align: right;
  }

  :global(.flex) {
    display: flex;
  }

  :global(.flex-col) {
    flex-direction: column;
  }

  :global(.items-center) {
    align-items: center;
  }

  :global(.justify-center) {
    justify-content: center;
  }

  :global(.justify-between) {
    justify-content: space-between;
  }

  :global(.gap-4) {
    gap: 1rem;
  }

  :global(.gap-8) {
    gap: 2rem;
  }

  :global(.p-4) {
    padding: 1rem;
  }

  :global(.p-8) {
    padding: 2rem;
  }

  :global(.m-4) {
    margin: 1rem;
  }

  :global(.mt-8) {
    margin-top: 2rem;
  }

  :global(.mb-8) {
    margin-bottom: 2rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    :global(.container) {
      padding: 0 15px;
    }

    .global-alerts {
      right: 10px;
      left: 10px;
      max-width: none;
    }

    .global-loading {
      padding: 30px 15px;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
    }

    .global-loading p {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 480px) {
    :global(.container) {
      padding: 0 10px;
    }

    .global-loading {
      padding: 20px 10px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }

    .global-loading p {
      font-size: 1rem;
    }
  }

  /* Print Styles */
  @media print {
    .global-loading,
    .global-alerts {
      display: none;
    }

    .main-content {
      min-height: auto;
    }
  }

  /* Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }

    .loading-spinner {
      animation: none;
    }

    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High Contrast Support */
  @media (prefers-contrast: high) {
    :global(body) {
      background: white;
      color: black;
    }

    .global-loading {
      background: black;
      color: white;
    }
  }

  /* Dark Mode Support (optional) */
  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #1a202c;
      color: #e2e8f0;
    }
  }
</style>