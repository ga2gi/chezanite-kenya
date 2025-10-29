<script>
  import { onMount } from "svelte";

  let currentQuestion = 0;
  let selected = null;
  let showAnswer = false;
  let score = 0;
  let timeLeft = 10;
  let timer;
  let progressWidth = 100;
  let gameOver = false;

  const questions = [
    {
      q: "Which planet has the most moons?",
      options: ["Jupiter", "Saturn", "Neptune", "Mars"],
      answer: "Saturn"
    },
    {
      q: "Who developed the theory of general relativity?",
      options: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Galileo Galilei"],
      answer: "Albert Einstein"
    },
    {
      q: "What is the hardest natural substance on Earth?",
      options: ["Gold", "Iron", "Diamond", "Obsidian"],
      answer: "Diamond"
    },
    {
      q: "Which country invented paper?",
      options: ["Greece", "China", "Egypt", "India"],
      answer: "China"
    },
    {
      q: "Who was the first woman to win a Nobel Prize?",
      options: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Jane Goodall"],
      answer: "Marie Curie"
    },
    {
      q: "What element does 'O' represent on the periodic table?",
      options: ["Oxygen", "Osmium", "Oganesson", "Opium"],
      answer: "Oxygen"
    },
    {
      q: "What is the capital city of Canada?",
      options: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
      answer: "Ottawa"
    },
    {
      q: "Which gas is most abundant in Earth’s atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
      answer: "Nitrogen"
    },
    {
      q: "Who painted the ceiling of the Sistine Chapel?",
      options: ["Raphael", "Da Vinci", "Michelangelo", "Donatello"],
      answer: "Michelangelo"
    },
    {
      q: "Which ocean is the largest?",
      options: ["Indian Ocean", "Atlantic Ocean", "Arctic Ocean", "Pacific Ocean"],
      answer: "Pacific Ocean"
    }
  ];

  function startTimer() {
    clearInterval(timer);
    timeLeft = 10;
    progressWidth = 100;
    timer = setInterval(() => {
      timeLeft -= 1;
      progressWidth -= 10;
      if (timeLeft <= 0) {
        clearInterval(timer);
        nextQuestion();
      }
    }, 1000);
  }

  function selectOption(option) {
    if (showAnswer) return;
    selected = option;
    showAnswer = true;
    if (option === questions[currentQuestion].answer) {
      score++;
    }
    clearInterval(timer);
    setTimeout(nextQuestion, 1500);
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      selected = null;
      showAnswer = false;
      startTimer();
    } else {
      gameOver = true;
    }
  }

  onMount(() => {
    startTimer();
  });
</script>

<style>
  main {
    background-color: #4C5CFF;
    color: white;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-family: "Poppins", sans-serif;
    padding: 1rem;
  }

  .question-box {
    background: white;
    color: #4C5CFF;
    border-radius: 1.5rem;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    animation: pop 0.4s ease;
  }

  .options {
    display: grid;
    gap: 0.8rem;
    margin-top: 1rem;
  }

  button.option {
    background: white;
    border: 2px solid #4C5CFF;
    color: #4C5CFF;
    border-radius: 1rem;
    padding: 0.8rem;
    font-weight: 600;
    transition: all 0.3s;
  }

  button.option:hover {
    background: #e0e3ff;
  }

  .correct {
    background: #00c851 !important;
    color: white;
    border: none;
  }

  .wrong {
    background: #ff4444 !important;
    color: white;
    border: none;
  }

  .progress {
    height: 6px;
    background: white;
    border-radius: 3px;
    margin-top: 1rem;
    overflow: hidden;
  }

  .progress-bar {
    height: 6px;
    background: #00c851;
    width: 100%;
    transition: width 1s linear;
  }

  @keyframes pop {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .game-over {
    font-size: 1.3rem;
    text-align: center;
  }
</style>

<main>
  {#if !gameOver}
    <div class="question-box">
      <h2>Question {currentQuestion + 1} / {questions.length}</h2>
      <p>{questions[currentQuestion].q}</p>

      <div class="options">
        {#each questions[currentQuestion].options as option}
          <button
            class="option
              {showAnswer && option === questions[currentQuestion].answer ? 'correct' : ''}
              {showAnswer && option === selected && option !== questions[currentQuestion].answer ? 'wrong' : ''}"
            on:click={() => selectOption(option)}
          >
            {option}
          </button>
        {/each}
      </div>

      <div class="progress">
        <div
          class="progress-bar"
          style="width: {progressWidth}%;"
        ></div>
      </div>

      <p style="margin-top:0.5rem;font-size:0.9rem;">⏳ {timeLeft}s left</p>
    </div>
  {:else}
    <div class="question-box game-over">
      <h2>🎉 Game Over 🎉</h2>
      <p>Your Score: {score} / {questions.length}</p>
      <button on:click={() => location.reload()}>Play Again</button>
    </div>
  {/if}
</main>
