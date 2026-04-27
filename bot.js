const { IgApiClient } = require('instagram-private-api');

const ig = new IgApiClient();

// 🔐 env config
const USERNAME = process.env.habib_insta_chatbot;
const PASSWORD = process.env.78657865;
const ADMINS = process.env.ADMINS ? process.env.ADMINS.split(",") : [];

// 🧠 memory
let seenMessages = new Set();
let gameState = {};

// 🎯 commands
const commands = {

  ping: async () => "🏓 Pong!",

  help: async () => `
📜 Commands:
!ping !help !echo !time !random
!hi !love !joke !flip !math
!guess !rps !quiz !answer
!info !admin
`,

  echo: async (args) => args.join(" ") || "Nothing to echo!",

  time: async () => "🕒 " + new Date().toLocaleString(),

  random: async () => "🎲 " + Math.floor(Math.random() * 100),

  hi: async () => "Hello 👋",

  love: async () => "❤️ Love you!",

  joke: async () => "😂 Bot life = bug life!",

  flip: async () => Math.random() > 0.5 ? "🪙 Head" : "🪙 Tail",

  math: async (args) => {
    try {
      return "🧮 " + eval(args.join(" "));
    } catch {
      return "❌ Invalid math!";
    }
  },

  info: async (args, userId) => `👤 User ID: ${userId}`,

  admin: async (args, userId) => {
    if (!ADMINS.includes(userId)) return "❌ Not admin!";
    return "👑 Admin OK";
  },

  // 🎮 GAMES
  guess: async (args, userId) => {
    if (!gameState[userId]) {
      gameState[userId] = { number: Math.floor(Math.random() * 10) + 1 };
      return "🎯 Guess number (1-10)";
    }
    if (parseInt(args[0]) === gameState[userId].number) {
      delete gameState[userId];
      return "🎉 Correct!";
    }
    return "❌ Try again";
  },

  rps: async (args) => {
    const c = ["rock", "paper", "scissors"];
    const bot = c[Math.floor(Math.random() * 3)];
    const user = args[0]?.toLowerCase();
    if (!c.includes(user)) return "Use: !rps rock/paper/scissors";
    if (user === bot) return `🤝 Draw (${bot})`;
    if (
      (user === "rock" && bot === "scissors") ||
      (user === "paper" && bot === "rock") ||
      (user === "scissors" && bot === "paper")
    ) return `🎉 You win (${bot})`;
    return `😢 Lose (${bot})`;
  },

  quiz: async (args, userId) => {
    gameState[userId] = { answer: "paris" };
    return "❓ Capital of France?";
  },

  answer: async (args, userId) => {
    if (!gameState[userId]) return "❌ No quiz!";
    if (args.join(" ").toLowerCase() === gameState[userId].answer) {
      delete gameState[userId];
      return "🎉 Correct!";
    }
    return "❌ Wrong";
  }
};

// 🤖 bot start
async function startBot() {
  ig.state.generateDevice(USERNAME);
  await ig.account.login(USERNAME, PASSWORD);

  console.log("✅ Logged in");

  setInterval(async () => {
    try {
      const inbox = ig.feed.directInbox();
      const threads = await inbox.items();

      for (let thread of threads) {
        const lastMsg = thread.items[0];
        if (!lastMsg || !lastMsg.text) continue;

        if (seenMessages.has(lastMsg.item_id)) continue;
        seenMessages.add(lastMsg.item_id);

        const text = lastMsg.text.trim();
        const userId = lastMsg.user_id?.toString();
        const threadId = thread.thread_id;

        if (text.startsWith("!")) {
          const parts = text.slice(1).split(" ");
          const cmd = commands[parts[0].toLowerCase()];
          const args = parts.slice(1);

          let reply = cmd
            ? await cmd(args, userId)
            : "❓ Unknown command";

          await ig.entity.directThread(threadId).broadcastText(reply);
        } else {
          if (text.toLowerCase().includes("hello"))
            await ig.entity.directThread(threadId).broadcastText("Hey 👋");
        }
      }
    } catch (e) {
      console.log("⚠️ Error:", e.message);
    }
  }, 5000);
}

startBot();
