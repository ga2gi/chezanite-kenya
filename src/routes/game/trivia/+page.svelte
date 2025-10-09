<script>
	import { onMount, onDestroy } from 'svelte';
	import { supabase } from '$lib/supabase';
	
	let roomCode = '';
	let players = [];
	let isHost = false;
	
	// Trivia game state
	let currentQuestion = null;
	let playerAnswers = {};
	let scores = {};
	let gamePhase = 'waiting';
	let timeRemaining = 0;
	let questionIndex = 0;
	let totalQuestions = 5;
	let selectedAnswer = null;
	let hasAnswered = false;
	let questions = [];
	
	let triviaSubscription;
	let timerInterval;

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		roomCode = urlParams.get('room');
		
		if (!roomCode) {
			alert('No room code provided. Please join a room first.');
			window.location.href = '/';
			return;
		}
		
		loadRoomAndGame();
	});

	onDestroy(() => {
		if (triviaSubscription) {
			triviaSubscription.unsubscribe();
		}
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	});

	async function loadRoomAndGame() {
		// Load room data
		const { data: roomData, error: roomError } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (roomError || !roomData) {
			alert('Room not found! Please check the room code.');
			window.location.href = '/';
			return;
		}

		// Check if trivia game is properly started
		if (!roomData.game_started || roomData.current_game !== 'trivia') {
			alert('No active trivia game found! Please start a game from the room.');
			window.location.href = `/room/${roomCode}`;
			return;
		}

		players = roomData.players || [];
		
		// Get current user and check if host
		const currentUser = localStorage.getItem(`player-${roomCode}`);
		isHost = roomData.created_by === currentUser;
		
		// Check if trivia game state exists
		if (roomData.game_state?.trivia) {
			updateGameState(roomData.game_state.trivia);
			if (roomData.game_state.trivia.gamePhase === 'question') {
				startTimer();
			}
		} else {
			await startNewGame();
		}

		subscribeToGame();
	}

	function updateGameState(state) {
		currentQuestion = state.currentQuestion;
		playerAnswers = state.playerAnswers || {};
		scores = state.scores || {};
		gamePhase = state.gamePhase || 'waiting';
		timeRemaining = state.timeRemaining || 0;
		questionIndex = state.questionIndex || 0;
		totalQuestions = state.totalQuestions || 5;
		questions = state.questions || [];
		
		const currentUser = localStorage.getItem(`player-${roomCode}`);
		hasAnswered = playerAnswers[currentUser] !== undefined;
		selectedAnswer = playerAnswers[currentUser];
	}

	async function updateGameStateInDB(gameState = null) {
		const stateToUpdate = gameState || {
			currentQuestion,
			playerAnswers,
			scores,
			gamePhase,
			timeRemaining,
			questionIndex,
			totalQuestions,
			questions
		};

		await supabase
			.from('rooms')
			.update({ 
				game_state: { 
					trivia: stateToUpdate,
					type: 'trivia'
				}
			})
			.eq('code', roomCode);
	}

	function subscribeToGame() {
		triviaSubscription = supabase
			.channel(`trivia-game-${roomCode}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'rooms',
					filter: `code=eq.${roomCode}`
				},
				(payload) => {
					if (payload.new.game_state?.trivia) {
						updateGameState(payload.new.game_state.trivia);
					}
				}
			)
			.subscribe();
	}

	async function startNewGame() {
		// Get random questions
		const { data: questionsData, error } = await supabase
			.from('trivia_questions')
			.select('*')
			.limit(totalQuestions);

		if (error || !questionsData || questionsData.length === 0) {
			alert('Error loading trivia questions!');
			return;
		}

		questions = questionsData;
		
		const gameState = {
			currentQuestion: questions[0],
			playerAnswers: {},
			scores: {},
			gamePhase: 'question',
			timeRemaining: 30,
			questionIndex: 0,
			totalQuestions: questions.length,
			questions: questions
		};

		await updateGameStateInDB(gameState);
		startTimer();
	}

	async function submitAnswer(answerIndex) {
		if (hasAnswered) return;

		selectedAnswer = answerIndex;
		hasAnswered = true;

		const playerId = localStorage.getItem(`player-${roomCode}`);
		const newPlayerAnswers = { ...playerAnswers, [playerId]: answerIndex };

		// Calculate new scores
		const newScores = { ...scores };
		if (answerIndex === currentQuestion.correct_answer) {
			newScores[playerId] = (newScores[playerId] || 0) + 100;
		}

		playerAnswers = newPlayerAnswers;
		scores = newScores;

		await updateGameStateInDB();
	}

	function startTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
		
		timerInterval = setInterval(async () => {
			if (timeRemaining <= 0) {
				clearInterval(timerInterval);
				await nextQuestionOrResults();
			} else {
				timeRemaining--;
			}
		}, 1000);
	}

	async function nextQuestionOrResults() {
		const nextIndex = questionIndex + 1;
		
		if (nextIndex < totalQuestions) {
			// Move to next question
			const gameState = {
				currentQuestion: questions