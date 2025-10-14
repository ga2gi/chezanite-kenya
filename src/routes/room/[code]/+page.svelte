<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let roomCode = '';
	let players = [];
	let currentUser = null;
	let isHost = false;
	let chatMessages = [];
	let newMessage = '';
	let roomSubscription;
	let loading = true;
	let roomData = null;

	// Available games
	const games = [
		{
			id: 'trivia',
			name: '🎯 Trivia Night',
			description: 'Test your knowledge with fun questions',
			color: 'blue',
			minPlayers: 1
		},
		{
			id: 'quick_draw',
			name: '🎨 Quick Draw',
			description: 'Draw and guess with friends',
			color: 'green',
			minPlayers: 2,
			comingSoon: true
		},
		{
			id: 'word_race',
			name: '📝 Word Race',
			description: 'Race to find words in categories',
			color: 'purple',
			minPlayers: 2,
			comingSoon: true
		}
	];

	onMount(async () => {
		roomCode = $page.params.code;
		await joinRoom();
		await fixHostAssignment();
		subscribeToRoom();
	});

	onDestroy(() => {
		if (roomSubscription) {
			supabase.removeChannel(roomSubscription);
		}
	});

	async function joinRoom() {
		try {
			loading = true;
			
			// Get or create user ID
			currentUser = localStorage.getItem(`player-${roomCode}`) || generateUserId();
			localStorage.setItem(`player-${roomCode}`, currentUser);

			console.log('Joining room:', roomCode, 'Current user:', currentUser);
			
			// Load room data
			const { data: room, error } = await supabase
				.from('rooms')
				.select('*')
				.eq('code', roomCode)
				.single();

			if (error) {
				console.error('Room fetch error:', error);
				throw new Error('Room not found in database');
			}

			if (!room) {
				throw new Error('Room does not exist');
			}

			roomData = room;
			console.log('Room data:', room);
			console.log('Room created_by:', room.created_by);
			console.log('Current user:', currentUser);
			
			// Check if user is host - compare with created_by
			isHost = room.created_by === currentUser;
			console.log('Is host:', isHost, 'because created_by:', room.created_by, '=== currentUser:', currentUser);

			// Add player to room if not already there
			if (!room.players || !room.players.includes(currentUser)) {
				players = [...(room.players || []), currentUser];
				console.log('Adding player to room. New players:', players);
				await updatePlayers();
			} else {
				players = room.players || [];
			}
			
			loading = false;
			
		} catch (error) {
			console.error('Error joining room:', error);
			alert('Room not found! Please check the room code.');
			window.location.href = '/rooms';
		}
	}

	async function fixHostAssignment() {
		// If created_by is null and we're the first player, assign ourselves as host
		if (roomData && !roomData.created_by && players.length > 0 && players[0] === currentUser) {
			console.log('Fixing host assignment...');
			const { error } = await supabase
				.from('rooms')
				.update({ created_by: currentUser })
				.eq('code', roomCode);
			
			if (error) {
				console.error('Error fixing host:', error);
			} else {
				console.log('Host assignment fixed');
				isHost = true;
				// Reload room data
				const { data: updatedRoom } = await supabase
					.from('rooms')
					.select('*')
					.eq('code', roomCode)
					.single();
				roomData = updatedRoom;
			}
		}
	}

	async function updatePlayers() {
		try {
			console.log('Updating players in room:', players);
			const { error } = await supabase
				.from('rooms')
				.update({ players: players })
				.eq('code', roomCode);

			if (error) throw error;
			console.log('Players updated successfully');
		} catch (error) {
			console.error('Error updating players:', error);
		}
	}

	function subscribeToRoom() {
		try {
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
						console.log('Room updated:', payload.new);
						players = payload.new.players || [];
						roomData = payload.new;
						// Update host status
						isHost = payload.new.created_by === currentUser;
					}
				)
				.subscribe((status) => {
					console.log('Subscription status:', status);
				});
		} catch (error) {
			console.error('Error subscribing to room:', error);
		}
	}

	function generateUserId() {
		const timestamp = Date.now().toString(36);
		const random = Math.random().toString(36).substring(2, 8);
		return `player-${timestamp}-${random}`;
	}

	function copyRoomCode() {
		navigator.clipboard.writeText(roomCode);
		alert('Room code copied! Share it with friends.');
	}

	async function startGame(gameId) {
		if (!isHost) return;

		try {
			console.log('Starting game:', gameId, 'in room:', roomCode);
			const { error } = await supabase
				.from('rooms')
				.update({
					current_game: gameId,
					game_started: true,
					game_state: {
						started_at: new Date().toISOString(),
						game_type: gameId
					}
				})
				.eq('code', roomCode);

			if (error) throw error;

			// Use SvelteKit navigation to ensure room code is passed correctly
			console.log('Navigating to game with room:', roomCode);
			await goto(`/game/trivia?room=${roomCode}`);
			
		} catch (error) {
			console.error('Error starting game:', error);
			alert('Error starting game. Please try again.');
		}
	}

	async function sendMessage() {
		if (!newMessage.trim()) return;

		const message = {
			id: Date.now().toString(),
			text: newMessage,
			player: currentUser,
			timestamp: new Date().toISOString(),
			type: 'chat'
		};

		chatMessages = [...chatMessages, message];
		newMessage = '';

		// Scroll to bottom of chat
		setTimeout(() => {
			const chatContainer = document.querySelector('.chat-messages');
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	function leaveRoom() {
		window.location.href = '/rooms';
	}

	function getPlayerDisplayName(player) {
		if (player === currentUser) return 'You';
		return `Player ${players.indexOf(player) + 1}`;
	}

	function getPlayerRole(player) {
		if (player === currentUser && isHost) return 'You (Host)';
		if (player === currentUser) return 'You';
		if (roomData && player === roomData.created_by) return 'Host';
		return 'Player';
	}

	function isPlayerHost(player) {
		return roomData && player === roomData.created_by;
	}
</script>

<div class="lobby-container">
	{#if loading}
		<div class="loading-screen">
			<div class="loading-spinner"></div>
			<p>Loading room {roomCode}...</p>
		</div>
	{:else}
		<!-- Header -->
		<header class="lobby-header">
			<div class="header-left">
				<h1>Room: {roomCode}</h1>
				<div class="room-info">
					<span class="players-count">👥 {players.length} player{players.length !== 1 ? 's' : ''}</span>
					{#if isHost}
						<span class="host-badge">You are Host 👑</span>
					{:else if roomData && roomData.created_by && players.includes(roomData.created_by)}
						<span class="host-badge">Host: {getPlayerDisplayName(roomData.created_by)}</span>
					{/if}
				</div>
			</div>
			<div class="header-actions">
				<button class="btn btn-outline" on:click={copyRoomCode}>
					📋 Copy Code
				</button>
				<button class="btn btn-secondary" on:click={leaveRoom}>
					Leave
				</button>
			</div>
		</header>

		<div class="lobby-content">
			<!-- Left Sidebar - Players -->
			<aside class="players-sidebar">
				<h3>Players ({players.length})</h3>
				<div class="players-list">
					{#each players as player}
						<div class="player-item {isPlayerHost(player) ? 'host-player' : ''}">
							<div class="player-avatar {player === currentUser ? 'you' : ''} {isPlayerHost(player) ? 'host-avatar' : ''}">
								{getPlayerDisplayName(player).charAt(0)}
							</div>
							<div class="player-info">
								<span class="player-name">{getPlayerDisplayName(player)}</span>
								<span class="player-role">{getPlayerRole(player)}</span>
							</div>
							{#if isPlayerHost(player)}
								<span class="host-crown">👑</span>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Quick Join Section for Mobile -->
				<div class="mobile-join-section">
					<h4>Invite Friends</h4>
					<div class="invite-box">
						<p>Share this code:</p>
						<div class="room-code-display">{roomCode}</div>
						<button class="btn btn-outline btn-small" on:click={copyRoomCode}>
							📋 Copy Code
						</button>
					</div>
				</div>

				<!-- Debug info (remove in production) -->
				<div class="debug-info">
					<details>
						<summary>Debug Info</summary>
						<small>
							<p>Room Created By: {roomData?.created_by || 'null'}</p>
							<p>Your ID: {currentUser}</p>
							<p>Is Host: {isHost ? 'Yes' : 'No'}</p>
							<p>Players: {players.join(', ')}</p>
						</small>
					</details>
				</div>
			</aside>

			<!-- Main Content - Games -->
			<main class="games-section">
				<div class="section-header">
					<h2>Select a Game</h2>
					<p>{#if isHost}Choose a game to start{:else}Waiting for host to start a game{/if}</p>
				</div>

				<div class="games-grid">
					{#each games as game}
						<div class="game-card {game.comingSoon ? 'coming-soon' : ''}">
							<div class="game-header">
								<div class="game-icon">{game.name.split(' ')[0]}</div>
								<div class="game-badges">
									{#if game.comingSoon}
										<span class="badge coming-soon">Soon</span>
									{/if}
								</div>
							</div>
							<div class="game-content">
								<h3>{game.name}</h3>
								<p>{game.description}</p>
								<div class="game-meta">
									<span class="players-req">👥 {game.minPlayers}+ players</span>
									{#if players.length >= game.minPlayers}
										<span class="ready-badge">✅ Ready to play</span>
									{:else}
										<span class="waiting-badge">⏳ Need {game.minPlayers - players.length} more</span>
									{/if}
								</div>
							</div>
							{#if !game.comingSoon}
								<div class="game-actions">
									{#if isHost}
										<button 
											class="btn btn-primary" 
											on:click={() => startGame(game.id)}
											disabled={players.length < game.minPlayers}
										>
											{#if players.length < game.minPlayers}
												Need {game.minPlayers - players.length} more
											{:else}
												Start Game
											{/if}
										</button>
									{:else}
										<button class="btn btn-outline" disabled>
											Waiting for Host
										</button>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				{#if isHost}
					<div class="host-notice">
						<p>💡 <strong>Host Tip:</strong> You can start Trivia Night even if you're the only player! Perfect for testing or solo play.</p>
					</div>
				{/if}
			</main>

			<!-- Right Sidebar - Chat -->
			<aside class="chat-sidebar">
				<h3>Chat</h3>
				<div class="chat-messages">
					{#each chatMessages as message}
						<div class="chat-message {message.player === currentUser ? 'own-message' : ''}">
							<div class="message-header">
								<span class="sender">{getPlayerDisplayName(message.player)}</span>
								<span class="time">
									{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
								</span>
							</div>
							<div class="message-text">{message.text}</div>
						</div>
					{:else}
						<div class="no-messages">
							<p>No messages yet. Say hello! 👋</p>
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
					<button class="btn btn-primary" on:click={sendMessage} disabled={!newMessage.trim()}>
						Send
					</button>
				</div>
			</aside>
		</div>
	{/if}
</div>

<style>
	:root {
		--color-primary: #3b82f6;
		--color-primary-dark: #2563eb;
		--color-success: #10b981;
		--color-warning: #f59e0b;
		--color-error: #ef4444;
		--color-white: #ffffff;
		--color-gray-50: #f9fafb;
		--color-gray-100: #f3f4f6;
		--color-gray-200: #e5e7eb;
		--color-gray-300: #d1d5db;
		--color-gray-400: #9ca3af;
		--color-gray-600: #4b5563;
		--color-gray-800: #1f2937;
		--space-sm: 0.5rem;
		--space-md: 1rem;
		--space-lg: 1.5rem;
		--space-xl: 2rem;
		--radius-md: 0.5rem;
		--radius-lg: 0.75rem;
	}

	.btn {
		padding: var(--space-md) var(--space-lg);
		border: none;
		border-radius: var(--radius-md);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.9rem;
	}

	.btn-small {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.8rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.btn-secondary {
		background: var(--color-gray-200);
		color: var(--color-gray-800);
	}

	.btn-secondary:hover {
		background: var(--color-gray-300);
	}

	.btn-outline {
		background: transparent;
		color: var(--color-primary);
		border: 2px solid var(--color-primary);
	}

	.btn-outline:hover {
		background: var(--color-primary);
		color: white;
	}

	.lobby-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-gray-50);
	}

	/* Loading Screen */
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		gap: var(--space-lg);
		text-align: center;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--color-gray-200);
		border-top: 4px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.lobby-header {
		background: var(--color-white);
		padding: var(--space-lg) var(--space-xl);
		border-bottom: 1px solid var(--color-gray-200);
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.header-left h1 {
		color: var(--color-primary);
		margin-bottom: var(--space-sm);
		font-size: 1.5rem;
	}

	.room-info {
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	.players-count {
		color: var(--color-gray-600);
		font-weight: 600;
	}

	.host-badge {
		background: #f59e0b;
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

	.lobby-content {
		flex: 1;
		display: grid;
		grid-template-columns: 280px 1fr 280px;
		gap: 0;
		height: calc(100vh - 80px);
	}

	/* Players Sidebar */
	.players-sidebar {
		background: var(--color-white);
		border-right: 1px solid var(--color-gray-200);
		padding: var(--space-lg);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.players-sidebar h3 {
		margin-bottom: var(--space-lg);
		color: var(--color-gray-800);
		font-size: 1.1rem;
	}

	.players-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		flex: 1;
	}

	.player-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-gray-50);
		border-radius: var(--radius-md);
		transition: all 0.2s ease;
	}

	.player-item.host-player {
		background: #fefce8;
		border: 1px solid #fef08a;
	}

	.player-avatar {
		width: 36px;
		height: 36px;
		background: var(--color-primary);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.player-avatar.you {
		background: #10b981;
	}

	.player-avatar.host-avatar {
		background: #f59e0b;
	}

	.player-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.player-name {
		font-weight: 600;
		color: var(--color-gray-800);
		font-size: 0.9rem;
	}

	.player-role {
		font-size: 0.8rem;
		color: var(--color-gray-500);
	}

	.host-crown {
		font-size: 1rem;
	}

	/* Mobile Join Section */
	.mobile-join-section {
		display: none;
		margin-top: var(--space-lg);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-gray-200);
	}

	.mobile-join-section h4 {
		margin-bottom: var(--space-md);
		color: var(--color-gray-800);
		font-size: 1rem;
	}

	.invite-box {
		background: var(--color-gray-50);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		text-align: center;
	}

	.invite-box p {
		margin-bottom: var(--space-sm);
		color: var(--color-gray-600);
		font-size: 0.9rem;
	}

	.room-code-display {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: var(--space-md);
		letter-spacing: 2px;
	}

	/* Debug Info */
	.debug-info {
		margin-top: var(--space-lg);
		padding: var(--space-md);
		background: var(--color-gray-100);
		border-radius: var(--radius-md);
		font-size: 0.8rem;
	}

	.debug-info details {
		cursor: pointer;
	}

	.debug-info summary {
		font-weight: 600;
		color: var(--color-gray-600);
	}

	.debug-info p {
		margin: var(--space-sm) 0;
		color: var(--color-gray-600);
	}

	/* Games Section */
	.games-section {
		padding: var(--space-xl);
		overflow-y: auto;
		background: var(--color-white);
	}

	.section-header {
		text-align: center;
		margin-bottom: var(--space-2xl);
	}

	.section-header h2 {
		color: var(--color-gray-800);
		margin-bottom: var(--space-sm);
		font-size: 1.8rem;
	}

	.section-header p {
		color: var(--color-gray-600);
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}

	.game-card {
		background: var(--color-gray-50);
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		transition: all 0.2s ease;
	}

	.game-card:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
	}

	.game-card.coming-soon {
		opacity: 0.6;
		filter: grayscale(0.5);
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-md);
	}

	.game-icon {
		font-size: 2rem;
	}

	.game-badges {
		display: flex;
		gap: var(--space-sm);
	}

	.badge {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.badge.coming-soon {
		background: var(--color-gray-300);
		color: var(--color-gray-600);
	}

	.ready-badge {
		color: var(--color-success);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.waiting-badge {
		color: var(--color-warning);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.game-content h3 {
		font-size: 1.2rem;
		color: var(--color-gray-800);
		margin-bottom: var(--space-sm);
	}

	.game-content p {
		color: var(--color-gray-600);
		margin-bottom: var(--space-md);
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.game-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.players-req {
		font-size: 0.8rem;
		color: var(--color-gray-500);
	}

	.game-actions {
		margin-top: var(--space-lg);
	}

	.host-notice {
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: var(--radius-md);
		padding: var(--space-md);
		text-align: center;
	}

	.host-notice p {
		color: #0369a1;
		font-size: 0.9rem;
		margin: 0;
	}

	/* Chat Sidebar */
	.chat-sidebar {
		background: var(--color-white);
		border-left: 1px solid var(--color-gray-200);
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.chat-sidebar h3 {
		padding: var(--space-lg);
		margin: 0;
		color: var(--color-gray-800);
		font-size: 1.1rem;
		border-bottom: 1px solid var(--color-gray-200);
	}

	.chat-messages {
		flex: 1;
		padding: var(--space-lg);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.chat-message {
		background: var(--color-gray-50);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-gray-200);
	}

	.chat-message.own-message {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		margin-left: var(--space-xl);
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-sm);
	}

	.sender {
		font-weight: 600;
		font-size: 0.8rem;
	}

	.own-message .sender {
		color: rgba(255, 255, 255, 0.9);
	}

	.time {
		font-size: 0.7rem;
		color: var(--color-gray-500);
	}

	.own-message .time {
		color: rgba(255, 255, 255, 0.7);
	}

	.message-text {
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.no-messages {
		text-align: center;
		color: var(--color-gray-500);
		font-style: italic;
		padding: var(--space-xl);
	}

	.chat-input {
		padding: var(--space-lg);
		border-top: 1px solid var(--color-gray-200);
		display: flex;
		gap: var(--space-md);
	}

	.chat-input input {
		flex: 1;
		padding: var(--space-md);
		border: 1px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		font-size: 0.9rem;
	}

	.chat-input input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.lobby-content {
			grid-template-columns: 250px 1fr;
		}
		
		.chat-sidebar {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.lobby-content {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
		
		.players-sidebar {
			display: none;
		}
		
		.mobile-join-section {
			display: block;
		}
		
		.lobby-header {
			flex-direction: column;
			gap: var(--space-md);
			text-align: center;
			padding: var(--space-md);
		}
		
		.header-actions {
			width: 100%;
			justify-content: center;
		}
		
		.games-section {
			padding: var(--space-lg);
		}
		
		.games-grid {
			grid-template-columns: 1fr;
		}
		
		.section-header h2 {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.lobby-header h1 {
			font-size: 1.3rem;
		}
		
		.games-section {
			padding: var(--space-md);
		}
		
		.game-card {
			padding: var(--space-md);
		}
		
		.room-code-display {
			font-size: 1.3rem;
		}
	}
</style>