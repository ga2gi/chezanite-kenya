import { supabase } from '$lib/supabase.js';

export class QuickPlayGame {
  constructor() {
    this.sessionId = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.timeRemaining = 20;
    this.interval = null;
    this.userId = null;
  }

  // Start a new quick play session
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
      
    } catch (error) {
      console.error('Error starting game:', error);
      return { success: false, error: error.message };
    }
  }

  // Load questions from database
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

    } catch (error) {
      console.error('Error in loadQuestions:', error);
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
    
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    this.interval = setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.handleTimeUp();
      }
    }, 1000);
  }

  handleTimeUp() {
    console.log('Time up!');
    clearInterval(this.interval);
    this.submitAnswer(-1);
  }

  // Handle player answer
  async submitAnswer(selectedOptionIndex) {
    console.log('Submitting answer:', selectedOptionIndex);
    clearInterval(this.interval);
    
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
      this.recordAnswer(selectedOptionIndex, isCorrect, points).catch(console.error);
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

  calculateScore(isCorrect) {
    if (!isCorrect) return 0;
    
    const basePoints = 10;
    const timeBonus = Math.floor(this.timeRemaining * 0.5);
    const streakBonus = this.streak * 2;
    
    return basePoints + timeBonus + streakBonus;
  }

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
      console.error('Error recording answer:', error);
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
    clearInterval(this.interval);
    
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
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}