<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<div class="app-layout">
  <Header />
  
  <main class="main-content">
    <slot />
  </main>
  
  <Footer />
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 0 var(--space-md) var(--space-lg) var(--space-md);
  }
</style>