<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import GameLauncher from '$lib/components/GameLauncher.svelte';

	let roomCode = '';
	let roomData = null;
	let players = [];
	let currentUser = null;
	let isHost = false;
	let currentGame = null;
	let gameStarted = false;
	
	let roomSubscription;
	let chatMessages = [];
	let newMessage = '';

	onMount(async () => {
		roomCode = $page.params.code;
		await loadRoom();
		subscribeToRoom();
	});

	onDestroy(() => {
		if (roomSubscription) {
			roomSubscription.unsubscribe();
		}
	});

	async function loadRoom() {
		const { data, error } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (error) {
			alert('Room not found!');
			window.location.href = '/';
			return;
		}

		roomData = data;
		players = data.players || [];
		currentGame = data.current_game;
		gameStarted = data.game_started;
		
		// Get current user from localStorage
		currentUser = localStorage.getItem(`player-${roomCode}`);
		if (!currentUser) {
			// If no user ID, generate one and add to room
			currentUser = generateUserId();
			localStorage.setItem(`player-${roomCode}`, currentUser);
			players.push(currentUser);
			await updatePlayersInRoom();
		}

		// Check if current user is the host (room creator)
		isHost = data.created_by === currentUser;

		// Redirect to game if active
		if (gameStarted && currentGame === 'trivia') {
			setTimeout(() => {
				window.location.href = `/game/trivia?room=${roomCode}`;
			}, 500);
		}
	}

	async function updatePlayersInRoom() {
		const { error } = await supabase
			.from('rooms')
			.update({ players: players })
			.eq('code', roomCode);

		if (error) {
			console.error('Error updating players:', error);
		}
	}

	function subscribeToRoom() {
		roomSubscription = supabase
			.channel(`room-${roomCode}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'rooms',
					filter: `code=eq.${roomCode}`
				},
				(payload) => {
					roomData = payload.new;
					players = payload.new.players || [];
					
					const newCurrentGame = payload.new.current_game;
					const newGameStarted = payload.new.game_started;

					currentGame = newCurrentGame;
					gameStarted = newGameStarted;

					// Redirect if game started
					if (newGameStarted && newCurrentGame === 'trivia') {
						setTimeout(() => {
							window.location.href = `/game/trivia?room=${roomCode}`;
						}, 1000);
					}
				}
			)
			.subscribe();
	}

	function generateUserId() {
		return 'player-' + Math.random().toString(36).substring(2, 9);
	}

	async function sendMessage() {
		if (!newMessage.trim()) return;

		const message = {
			id: Date.now().toString(),
			text: newMessage,
			player: currentUser,
			timestamp: new Date().toISOString()
		};

		chatMessages = [...chatMessages, message];
		newMessage = '';
	}

	async function leaveRoom() {
		if (roomSubscription) {
			roomSubscription.unsubscribe();
		}
		
		// Remove player from room
		const updatedPlayers = players.filter(player => player !== currentUser);
		await supabase
			.from('rooms')
			.update({ players: updatedPlayers })
			.eq('code', roomCode);

		window.location.href = '/';
	}

	function copyRoomLink() {
		const roomLink = `${window.location.origin}/room/${roomCode}`;
		navigator.clipboard.writeText(roomLink);
		alert('Room link copied to clipboard!');
	}
</script>

<div class="room-container">
	<header class="room-header">
		<div class="room-info">
			<h1>Room: {roomCode}</h1>
			<div class="room-meta">
				<span class="players-count">👥 {players.length} players</span>
				{#if isHost}
					<span class="host-badge">Host 👑</span>
				{/if}
			</div>
		</div>
		<div class="header-actions">
			<button class="btn btn-secondary" on:click={copyRoomLink}>
				Copy Invite Link
			</button>
			<button class="btn btn-secondary" on:click={leaveRoom}>
				Leave Room
			</button>
		</div>
	</header>

	<div class="room-content">
		<section class="players-section">
			<h2>Players</h2>
			<div class="players-list">
				{#each players as player}
					<div class="player-card">
						<div class="player-avatar">
							{player.charAt(0).toUpperCase()}
						</div>
						<span class="player-name">
							{player === currentUser ? 'You' : player}
							{#if player === roomData?.created_by}
								<span class="host-indicator">👑</span>
							{/if}
						</span>
					</div>
				{/each}
			</div>
		</section>

		<section class="game-section">
			<GameLauncher 
				{roomCode} 
				{isHost} 
				{currentGame} 
				{gameStarted} 
			/>
		</section>

		<section class="chat-section">
			<h2>Chat</h2>
			<div class="chat-messages">
				{#each chatMessages as message}
					<div class="chat-message {message.player === currentUser ? 'own-message' : ''}">
						<div class="message-sender">
							{message.player === currentUser ? 'You' : 'Player'}
						</div>
						<div class="message-text">{message.text}</div>
						<div class="message-time">
							{new Date(message.timestamp).toLocaleTimeString()}
						</div>
					</div>
				{/each}
			</div>
			<div class="chat-input">
				<input 
					type="text" 
					bind:value={newMessage}
					placeholder="Type a message..."
					on:keydown={(e) => e.key === 'Enter' && sendMessage()}
				/>
				<button class="btn btn-primary" on:click={sendMessage}>
					Send
				</button>
			</div>
		</section>
	</div>
</div>

<style>
	:root {
		--color-primary: #3b82f6;
		--color-primary-light: #dbeafe;
		--color-secondary: #6b7280;
		--color-success: #10b981;
		--color-warning: #f59e0b;
		--color-error: #ef4444;
		--color-white: #ffffff;
		--color-gray-50: #f9fafb;
		--color-gray-100: #f3f4f6;
		--color-gray-200: #e5e7eb;
		--color-gray-300: #d1d5db;
		--color-gray-500: #6b7280;
		--color-gray-600: #4b5563;
		--color-gray-800: #1f2937;
		
		--space-sm: 0.5rem;
		--space-md: 1rem;
		--space-lg: 1.5rem;
		--space-xl: 2rem;
		
		--radius-sm: 0.25rem;
		--radius-md: 0.5rem;
		--radius-lg: 0.75rem;
	}

	.btn {
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-md);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background: #2563eb;
	}

	.btn-secondary {
		background: var(--color-gray-200);
		color: var(--color-gray-800);
	}

	.btn-secondary:hover {
		background: var(--color-gray-300);
	}

	.room-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-lg);
		min-height: 100vh;
	}

	.room-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xl);
		padding: var(--space-lg);
		background: var(--color-white);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.room-info h1 {
		color: var(--color-primary);
		margin-bottom: var(--space-sm);
		font-size: 2rem;
	}

	.room-meta {
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	.players-count {
		color: var(--color-gray-600);
		font-weight: 600;
	}

	.host-badge {
		background: var(--color-warning);
		color: white;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.header-actions {
		display: flex;
		gap: var(--space-md);
	}

	.room-content {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: var(--space-lg);
		align-items: start;
	}

	.players-section, .chat-section {
		background: var(--color-white);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.players-section h2, .chat-section h2 {
		margin-bottom: var(--space-lg);
		color: var(--color-gray-800);
		border-bottom: 2px solid var(--color-gray-100);
		padding-bottom: var(--space-sm);
	}

	.players-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.player-card {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-gray-50);
		border-radius: var(--radius-md);
	}

	.player-avatar {
		width: 32px;
		height: 32px;
		background: var(--color-primary);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.player-name {
		flex: 1;
		color: var(--color-gray-800);
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.host-indicator {
		font-size: 1rem;
	}

	.game-section {
		background: var(--color-white);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.chat-messages {
		height: 300px;
		overflow-y: auto;
		margin-bottom: var(--space-md);
		border: 1px solid var(--color-gray-200);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		background: var(--color-gray-50);
	}

	.chat-message {
		margin-bottom: var(--space-md);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		background: var(--color-white);
		border: 1px solid var(--color-gray-200);
	}

	.chat-message.own-message {
		background: var(--color-primary-light);
		border-color: var(--color-primary);
		margin-left: var(--space-xl);
	}

	.message-sender {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-gray-600);
		margin-bottom: var(--space-sm);
	}

	.message-text {
		color: var(--color-gray-800);
		margin-bottom: var(--space-sm);
	}

	.message-time {
		font-size: 0.8rem;
		color: var(--color-gray-500);
		text-align: right;
	}

	.chat-input {
		display: flex;
		gap: var(--space-md);
	}

	.chat-input input {
		flex: 1;
		padding: var(--space-md);
		border: 1px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		font-size: 1rem;
	}

	.chat-input input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	@media (max-width: 768px) {
		.room-content {
			grid-template-columns: 1fr;
		}
		
		.room-header {
			flex-direction: column;
			gap: var(--space-md);
			text-align: center;
		}

		.header-actions {
			flex-direction: column;
			width: 100%;
		}
	}
</style>