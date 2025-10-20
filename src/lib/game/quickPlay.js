import { supabase } from '$lib/supabase.js';

/**
 * @typedef {Object} Question
 * @property {string|number} id
 * @property {string} question_text
 * @property {string} option1
 * @property {string} option2
 * @property {string} option3
 * @property {string} option4
 * @property {number} correct_answer
 * @property {string} [category]
 */

export class QuickPlayGame {
  constructor() {
    /** @type {string|null} */
    this.sessionId = null;

    /** @type {Question[]} */
    this.questions = [];

    /** @type {number} */
    this.currentQuestionIndex = 0;

    /** @type {number} */
    this.score = 0;

    /** @type {number} */
    this.streak = 0;

    /** @type {number} */
    this.timeRemaining = 20;

    /**
     * In browsers setInterval returns a number; in Node it returns a Timeout object.
     * Use a nullable any here to be compatible with both runtimes when checkJs is enabled.
     * @type {number|object|null}
     */
    this.interval = null;

    /** @type {string|null} */
    this.userId = null;
  }

  // Start a new quick play session
  /**
   * Start a new quick play session
   * @param {string} userId
   */
  async startGame(userId) {
    try {
      console.log('Starting game for user:', userId);
      this.userId = userId;

      // 1. Create game session - SIMPLIFIED VERSION
      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert([
          {
            game_type: 'quick_play',
            status: 'active', 
            title: 'Quick Play',
            created_by: userId
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating game session:', error);
        throw error;
      }
      
      this.sessionId = session.id;
      console.log('Game session created:', this.sessionId);

      // 2. Get questions for the game
      await this.loadQuestions();
      console.log('Questions loaded:', this.questions.length);
      
      // 3. Start the game timer
      this.startTimer();
      
      return { 
        success: true, 
        sessionId: this.sessionId, 
        questions: this.questions,
        currentQuestion: this.questions[0]
      };
      
    } catch (err) {
      console.error('Error starting game:', err);
      const message = (err && typeof err === 'object' && 'message' in err) ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  // Load questions from database
  /**
   * Load questions from DB or use sample fallback
   * @returns {Promise<void>}
   */
  async loadQuestions() {
    try {
      console.log('Loading questions...');
      
      // Try to get questions from database first
      const { data: questions, error } = await supabase
        .from('trivia_questions')
        .select('*')
        .limit(10);

      if (error) {
        console.log('Database error, using sample questions:', error);
        this.questions = this.getSampleQuestions();
      } else if (questions && questions.length > 0) {
        console.log('Found questions in database:', questions.length);
        this.questions = questions;
      } else {
        console.log('No questions in database, using samples');
        this.questions = this.getSampleQuestions();
      }

    } catch (err) {
      console.error('Error in loadQuestions:', err);
      this.questions = this.getSampleQuestions();
    }
  }

  // Sample questions as fallback
  getSampleQuestions() {
    console.log('Using sample questions');
    return [
      {
        id: '1',
        question_text: "What is the capital city of Kenya?",
        option1: "Nairobi",
        option2: "Mombasa", 
        option3: "Kisumu",
        option4: "Nakuru",
        correct_answer: 0,
        category: "Geography"
      },
      {
        id: '2', 
        question_text: "Which mountain is the highest in Kenya?",
        option1: "Mount Kenya",
        option2: "Mount Kilimanjaro",
        option3: "Mount Elgon",
        option4: "Mount Longonot",
        correct_answer: 0,
        category: "Geography"
      },
      {
        id: '3',
        question_text: "What is the official language of Kenya?",
        option1: "Swahili",
        option2: "English", 
        option3: "Kikuyu",
        option4: "Luo",
        correct_answer: 1,
        category: "Culture"
      },
      {
        id: '4',
        question_text: "Which lake in Kenya is known for flamingos?",
        option1: "Lake Nakuru",
        option2: "Lake Victoria",
        option3: "Lake Naivasha", 
        option4: "Lake Bogoria",
        correct_answer: 0,
        category: "Geography"
      },
      {
        id: '5',
        question_text: "What year did Kenya gain independence?",
        option1: "1960",
        option2: "1963",
        option3: "1965",
        option4: "1970",
        correct_answer: 1,
        category: "History"
      }
    ];
  }

  startTimer() {
    console.log('Starting timer');
    this.timeRemaining = 20;
    
    if (this.interval != null) {
      try { clearInterval(/** @type {any} */ (this.interval)); } catch (e) { /* ignore */ }
    }
    
    // assign the interval (may be number in browser or object in Node)
    this.interval = setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.handleTimeUp();
      }
    }, 1000);
  }

  handleTimeUp() {
    console.log('Time up!');
    if (this.interval != null) {
      try { clearInterval(/** @type {any} */ (this.interval)); } catch (e) { /* ignore */ }
      this.interval = null;
    }
    this.submitAnswer(-1);
  }

  // Handle player answer
  /**
   * Submit an answer for the current question
   * @param {number} selectedOptionIndex
   */
  async submitAnswer(selectedOptionIndex) {
    console.log('Submitting answer:', selectedOptionIndex);
    if (this.interval != null) {
      try { clearInterval(/** @type {any} */ (this.interval)); } catch (e) { /* ignore */ }
      this.interval = null;
    }
    
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const isCorrect = selectedOptionIndex === currentQuestion.correct_answer;
    
    // Calculate score (skip if time up)
  const points = selectedOptionIndex === -1 ? 0 : this.calculateScore(isCorrect);
    this.score += points;
    
    // Update streak
    if (isCorrect && selectedOptionIndex !== -1) {
      this.streak++;
    } else {
      this.streak = 0;
    }

    console.log('Answer result:', { isCorrect, points, streak: this.streak, score: this.score });

    // Record answer in database (non-blocking)
    if (this.sessionId && this.userId && selectedOptionIndex !== -1) {
      this.recordAnswer(selectedOptionIndex, isCorrect, points).catch((e) => console.error('recordAnswer error', e));
    }

    // Move to next question or end game
    const result = await this.nextQuestion();
    
    return { 
      isCorrect, 
      points, 
      streak: this.streak, 
      result,
      correctAnswer: currentQuestion.correct_answer,
      currentScore: this.score
    };
  }

  /**
   * Calculate score for a single question
   * @param {boolean} isCorrect
   * @returns {number}
   */
  calculateScore(isCorrect) {
    if (!isCorrect) return 0;
    
    const basePoints = 10;
    const timeBonus = Math.floor(this.timeRemaining * 0.5);
    const streakBonus = this.streak * 2;
    
    return basePoints + timeBonus + streakBonus;
  }

  /**
   * Record an answer in the database (best-effort)
   * @param {number} selectedOption
   * @param {boolean} isCorrect
   * @param {number} points
   */
  async recordAnswer(selectedOption, isCorrect, points) {
    try {
      const { error } = await supabase
        .from('trivia_answers')
        .insert([
          {
            session_id: this.sessionId,
            user_id: this.userId,
            question_id: this.questions[this.currentQuestionIndex].id,
            selected_answer: selectedOption,
            is_correct: isCorrect,
            points_earned: points,
            response_time: 20 - this.timeRemaining
          }
        ]);

      if (error) {
        console.error('Error recording answer:', error);
      } else {
        console.log('Answer recorded successfully');
      }
    } catch (error) {
      const msg = (error && typeof error === 'object' && 'message' in error) ? error.message : String(error);
      console.error('Error recording answer:', msg);
    }
  }

  async nextQuestion() {
    console.log('Moving to next question. Current:', this.currentQuestionIndex, 'Total:', this.questions.length);
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex >= this.questions.length) {
      console.log('Game finished! Final score:', this.score);
      await this.endGame();
      return 'finished';
    } else {
      console.log('Next question:', this.currentQuestionIndex);
      this.startTimer();
      return 'next_question';
    }
  }

  async endGame() {
    console.log('Ending game...');
    if (this.interval != null) {
      try { clearInterval(/** @type {any} */ (this.interval)); } catch (e) { /* ignore */ }
      this.interval = null;
    }
    
    // Update game session as completed
    if (this.sessionId) {
      try {
        const { error } = await supabase
          .from('game_sessions')
          .update({ 
            status: 'completed',
            final_score: this.score
          })
          .eq('id', this.sessionId);

        if (error) {
          console.error('Error ending game session:', error);
        } else {
          console.log('Game session completed with score:', this.score);
        }
      } catch (error) {
        console.error('Error updating game session:', error);
      }
    }
    
    return this.score;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  getProgress() {
    return {
      current: this.currentQuestionIndex + 1,
      total: this.questions.length,
      percentage: ((this.currentQuestionIndex + 1) / this.questions.length) * 100
    };
  }

  cleanup() {
    if (this.interval != null) {
      try { clearInterval(/** @type {any} */ (this.interval)); } catch (e) { /* ignore */ }
      this.interval = null;
    }
  }
}