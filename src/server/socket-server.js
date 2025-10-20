const { Server } = require('socket.io');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your SvelteKit dev server
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();
/**
 * @typedef {{ id: string, question_text?: string, [key:string]: any }} Question
 */

/** @type {Question[]} */
const questions = []; // Your questions array

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join_room', (data) => {
    const { roomId, username, avatar } = data;
    
    socket.join(roomId);
    // attach custom properties; cast to any to avoid TypeScript/TS-check complaints
    /** @type {any} */ (socket).roomId = roomId;
    /** @type {any} */ (socket).username = username;
    /** @type {any} */ (socket).avatar = avatar;
    /** @type {any} */ (socket).score = 0;

    // Initialize room if doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        players: new Map(),
        gameState: 'waiting'
      });
    }

    const room = rooms.get(roomId);
    room.players.set(socket.id, socket);

    // Notify room
    socket.to(roomId).emit('player_joined', {
      playerId: socket.id,
      username,
      avatar,
      score: 0,
      connected: true
    });

    // Send room state to joining player
    const roomPlayers = Array.from(room.players.values()).map(player => ({
      id: player.id,
      username: /** @type {any} */ (player).username,
      avatar: /** @type {any} */ (player).avatar,
      score: /** @type {any} */ (player).score,
      connected: true
    }));

    socket.emit('room_state', {
      roomId,
      players: roomPlayers,
      gameState: room.gameState
    });
  });

  socket.on('start_game', () => {
    const roomId = /** @type {any} */ (socket).roomId;
    const room = rooms.get(roomId);
    
    if (room) {
      room.gameState = 'playing';
      io.to(roomId).emit('game_started', {
        question: questions[0],
        questionIndex: 0
      });
    }
  });

  socket.on('submit_answer', (data) => {
    // Handle answer submission
    const roomId = /** @type {any} */ (socket).roomId;
    const room = rooms.get(roomId);
    
    // ... scoring logic
    
    io.to(roomId).emit('answer_result', {
      playerId: socket.id,
      username: /** @type {any} */ (socket).username,
      pointsEarned: data.pointsEarned,
      newScore: /** @type {any} */ (socket).score
    });
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Handle player disconnect
  });
});

httpServer.listen(3001, () => {
  console.log('Socket.io server running on port 3001');
});