import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface RealPlayer {
  id: string;
  username: string;
  score: number;
  avatar: string;
  isCurrentPlayer: boolean;
  connected: boolean;
}

export const connectedPlayers = writable<RealPlayer[]>([]);
export const websocket = writable<WebSocket | null>(null);
export const isConnected = writable(false);
export const currentRoomId = writable<string | null>(null);
export const connectionError = writable<string | null>(null);

// Fallback to simulated mode if WebSocket fails
let useSimulatedMode = false;

export function initializeWebSocket(roomId: string, username: string, avatar: string): void {
  if (!browser) return;

  connectionError.set(null);
  useSimulatedMode = false;

  try {
    // Try to connect to WebSocket server
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('✅ Connected to WebSocket server');
      isConnected.set(true);
      currentRoomId.set(roomId);
      connectionError.set(null);
      
      // Join room
      ws.send(JSON.stringify({
        type: 'join_room',
        data: { roomId, username, avatar }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      isConnected.set(false);
      currentRoomId.set(null);
      
      // If connection failed, fall back to simulated mode
      if (!useSimulatedMode) {
        console.log('🔄 Falling back to simulated mode');
        useSimulatedMode = true;
        initializeSimulatedMode(roomId, username, avatar);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      connectionError.set('Failed to connect to game server');
      
      // Fall back to simulated mode
      if (!useSimulatedMode) {
        console.log('🔄 Falling back to simulated mode due to error');
        useSimulatedMode = true;
        initializeSimulatedMode(roomId, username, avatar);
      }
    };

    // Set timeout to fallback if connection takes too long
    setTimeout(() => {
      if (!useSimulatedMode && ws.readyState === WebSocket.CONNECTING) {
        console.log('⏰ WebSocket connection timeout, using simulated mode');
        useSimulatedMode = true;
        ws.close();
        initializeSimulatedMode(roomId, username, avatar);
      }
    }, 3000);

    websocket.set(ws);

  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    connectionError.set('WebSocket not supported');
    initializeSimulatedMode(roomId, username, avatar);
  }
}

// Simulated mode for when WebSocket server is not available
function initializeSimulatedMode(roomId: string, username: string, avatar: string): void {
  console.log('🎮 Starting simulated multiplayer mode');
  isConnected.set(true);
  currentRoomId.set(roomId);
  
  // Add current player
  connectedPlayers.set([{
    id: 'current-player',
    username,
    avatar,
    score: 0,
    isCurrentPlayer: true,
    connected: true
  }]);
  
  // Simulate other players joining
  simulateOtherPlayers();
}

function simulateOtherPlayers(): void {
  const mockPlayers = [
    { id: 'player-1', username: 'SuperPlayer', avatar: '🚀', score: 0 },
    { id: 'player-2', username: 'GameMaster', avatar: '🎮', score: 0 },
    { id: 'player-3', username: 'TriviaKing', avatar: '👑', score: 0 },
    { id: 'player-4', username: 'QuizWhiz', avatar: '⭐', score: 0 },
  ];

  // Add players gradually
  mockPlayers.forEach((player, index) => {
    setTimeout(() => {
      connectedPlayers.update(players => {
        if (players.find(p => p.id === player.id)) return players;
        
        const newPlayer = {
          ...player,
          isCurrentPlayer: false,
          connected: true
        };
        
        console.log('🤖 Simulated player joined:', newPlayer.username);
        return [...players, newPlayer];
      });
    }, (index + 1) * 1000);
  });
}

function handleWebSocketMessage(message: any): void {
  console.log('📨 WebSocket message:', message.type);
  
  switch (message.type) {
    case 'room_state':
      connectedPlayers.set(message.data.players);
      break;
      
    case 'player_joined':
      connectedPlayers.update(players => {
        const existing = players.find(p => p.id === message.data.playerId);
        return existing ? players : [...players, message.data];
      });
      break;
      
    case 'player_left':
      connectedPlayers.update(players => 
        players.filter(p => p.id !== message.data.playerId)
      );
      break;
      
    case 'answer_result':
      connectedPlayers.update(players =>
        players.map(player =>
          player.id === message.data.playerId
            ? { ...player, score: message.data.newScore }
            : player
        )
      );
      break;
      
    case 'ranking_update':
      connectedPlayers.set(message.data.players);
      break;
      
    case 'game_started':
      // Handle game start from server
      console.log('Game started by server');
      break;
  }
}

export function submitAnswer(answerData: any): void {
  if (useSimulatedMode) {
    // Simulate other players also answering
    setTimeout(() => {
      connectedPlayers.update(players => {
        return players.map(player => {
          if (!player.isCurrentPlayer && Math.random() > 0.3) {
            const pointsGained = Math.floor(Math.random() * 8) + 3;
            return {
              ...player,
              score: player.score + pointsGained
            };
          }
          return player;
        });
      });
    }, 1000);
    return;
  }

  websocket.update(ws => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'submit_answer',
        data: answerData
      }));
    }
    return ws;
  });
}

export function startGame(): void {
  if (useSimulatedMode) {
    console.log('🎯 Starting simulated game');
    return;
  }

  websocket.update(ws => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'start_game',
        data: {}
      }));
    }
    return ws;
  });
}

export function leaveRoom(): void {
  useSimulatedMode = false;
  isConnected.set(false);
  currentRoomId.set(null);
  connectedPlayers.set([]);
  
  websocket.update(ws => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'leave_room',
        data: {}
      }));
      ws.close();
    }
    return null;
  });
}