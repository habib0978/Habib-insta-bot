guess: async (args, userId) => {
  if (!gameState[userId]) {
    const num = Math.floor(Math.random() * 10) + 1;
    gameState[userId] = { number: num };

    return "🎯 Guess a number between 1-10";
  }

  const guess = parseInt(args[0]);
  const correct = gameState[userId].number;

  if (guess === correct) {
    delete gameState[userId];
    return "🎉 Correct! You win!";
  } else {
    return "❌ Wrong! Try again";
  }
},

rps: async (args) => {
  const choices = ["rock", "paper", "scissors"];
  const bot = choices[Math.floor(Math.random() * 3)];
  const user = args[0]?.toLowerCase();

  if (!choices.includes(user)) {
    return "✊ Use: !rps rock/paper/scissors";
  }

  if (user === bot) return `🤝 Draw! (${bot})`;

  if (
    (user === "rock" && bot === "scissors") ||
    (user === "paper" && bot === "rock") ||
    (user === "scissors" && bot === "paper")
  ) {
    return `🎉 You win! (${bot})`;
  } else {
    return `😢 You lose! (${bot})`;
  }
},

quiz: async (args, userId) => {
  const q = {
    question: "❓ Capital of France?",
    answer: "paris"
  };

  gameState[userId] = q;
  return q.question;
},

answer: async (args, userId) => {
  const userGame = gameState[userId];

  if (!userGame) return "❌ No active quiz!";

  const ans = args.join(" ").toLowerCase();

  if (ans === userGame.answer) {
    delete gameState[userId];
    return "🎉 Correct answer!";
  } else {
    return "❌ Wrong answer!";
  }
},
