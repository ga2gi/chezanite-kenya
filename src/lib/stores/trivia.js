import { writable } from 'svelte/store';

export const triviaState = writable({
  currentQuestion: null,
  playerAnswers: {},
  scores: {},
  gamePhase: 'waiting',
  timeRemaining: 0,
  questionIndex: 0,
  totalQuestions: 5
});