<script>
	import { supabase } from '$lib/supabase';

	export let roomCode = '';
	export let isHost = false;
	export let currentGame = null;
	export let gameStarted = false;

	const availableGames = [
		{
			id: 'trivia',
			name: '🎯 Trivia Night',
			description: 'Test your knowledge with fun questions',
			minPlayers: 1,
			maxPlayers: 10
		}
	];

	async function startGame(gameId) {
		if (!isHost) {
			alert('Only the host can start games!');
			return;
		}

		const { error } = await supabase
			.from('rooms')
			.update({ 
				current_game: gameId,
				game_started: true,
				game_state: {
					phase: 'starting',
					started_at: new Date().toISOString(),
					game_type: gameId
				}
			})
			.eq('code', roomCode);

		if (error) {
			alert('Error starting game: ' + error.message);
			return;
		}

		// Redirect host to game
		setTimeout(() => {
			window.location.href = `/game/trivia?room=${roomCode}`;
		}, 1000);
	}

	async function endGame() {
		if (!isHost) return;

		const { error } = await supabase
			.from('rooms')
			.update({ 
				current_game: null,
				game_started: false,
				game_state: {}
			})
			.eq('code', roomCode);

		if (error) {
			alert('Error ending game: ' + error.message);
		}
	}

	function joinGame() {
		if (currentGame === 'trivia') {
			window.location.href = `/game/trivia?room=${roomCode}`;
		}
	}
</script>

<div class="game-launcher">
	{#if !gameStarted}
		<div class="game-selection">
			<h3>🎮 Select a Game</h3>
			<div class="games-grid">
				{#each availableGames as game}
					<div 
						class="game-card"
						on:click={() => startGame(game.id)}
					>
						<div class="game-icon">{game.name.split(' ')[0]}</div>
						<div class="game-info">
							<h4>{game.name}</h4>
							<p>{game.description}</p>
							<div class="game-meta">
								<span class="players">👥 {game.minPlayers}-{game.maxPlayers}</span>
								{#if isHost}
									<span class="badge available">Play Now</span>
								{:else}
									<span class="badge waiting">Waiting for host...</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
			
			{#if !isHost}
				<div class="waiting-message">
					<p>⏳ Waiting for host to start a game...</p>
				</div>
			{/if}
		</div>
	{:else}
		<div class="game-in-progress">
			<div class="current-game-header">
				<h3>🎮 {availableGames.find(g => g.id === currentGame)?.name || 'Game'} in Progress</h3>
				<div class="game-controls">
					{#if isHost}
						<button class="btn btn-secondary" on:click={endGame}>
							End Game
						</button>
					{/if}
					<button class="btn btn-primary" on:click={joinGame}>
						Join Game
					</button>
				</div>
			</div>
			<p>The game is currently running. Click "Join Game" to participate!</p>
		</div>
	{/if}
</div>

<style>
	.game-launcher {
		margin: 0;
	}

	.game-selection h3 {
		text-align: center;
		margin-bottom: var(--space-lg);
		color: var(--color-gray-800);
		font-size: 1.5rem;
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.game-card {
		background: var(--color-white);
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.game-card:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.game-icon {
		font-size: 2rem;
		margin-bottom: var(--space-md);
		text-align: center;
	}

	.game-info h4 {
		font-size: 1.2rem;
		color: var(--color-gray-800);
		margin-bottom: var(--space-sm);
	}

	.game-info p {
		color: var(--color-gray-600);
		margin-bottom: var(--space-md);
		line-height: 1.4;
	}

	.game-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.players {
		font-size: 0.9rem;
		color: var(--color-gray-500);
	}

	.badge {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.badge.available {
		background: var(--color-success);
		color: white;
	}

	.badge.waiting {
		background: var(--color-gray-300);
		color: var(--color-gray-600);
	}

	.waiting-message {
		text-align: center;
		padding: var(--space-lg);
		background: var(--color-gray-50);
		border-radius: var(--radius-lg);
		color: var(--color-gray-600);
	}

	.game-in-progress {
		text-align: center;
		padding: var(--space-xl);
		background: var(--color-gray-50);
		border-radius: var(--radius-lg);
	}

	.current-game-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
	}

	.current-game-header h3 {
		color: var(--color-primary);
		margin: 0;
	}

	.game-controls {
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	@media (max-width: 768px) {
		.games-grid {
			grid-template-columns: 1fr;
		}
		
		.current-game-header {
			flex-direction: column;
			gap: var(--space-md);
		}
		
		.game-controls {
			flex-direction: column;
			width: 100%;
		}
	}
</style>