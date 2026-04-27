const { IgApiClient } = require('instagram-private-api');

const ig = new IgApiClient();

// 🔐 তোমার info
const USERNAME = "your_username";
const PASSWORD = "your_password";
const ADMINS = ["your_user_id"];

// 🧠 memory
let seenMessages = new Set();

// 🎯 command system
const commands = {

  ping: async () => "🏓 Pong!",

  help: async () => `
📜 Commands:
!ping
!help
!echo <text>
!time
!random
!hi
!love
!joke
!flip
!math 2+2
!info
!admin
`,

  echo: async (args) => args.join(" ") || "Nothing to echo!",

  time: async () => "🕒 " + new Date().toLocaleString(),

  random: async () => "🎲 " + Math.floor(Math.random() * 100),

  hi: async () => "Hello 👋",

  love: async () => "❤️ Love you!",

  joke: async () => "😂 I tried to fix bugs... now I have more bugs!",

  flip: async () => Math.random() > 0.5 ? "🪙 Head" : "🪙 Tail",

  math: async (args) => {
    try {
      let result = eval(args.join(" "));
      return "🧮 " + result;
    } catch {
      return "❌ Invalid math!";
    }
  },

  info: async (args, userId) => {
    return `👤 User ID: ${userId}`;
  },

  admin: async (args, userId) => {
    if (!ADMINS.includes(userId)) return "❌ Not admin!";
    return "👑 Admin access granted!";
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
        const threadId = thread.thread_id;
        const lastMsg = thread.items[0];

        if (!lastMsg || !lastMsg.text) continue;

        // 🚫 duplicate avoid
        if (seenMessages.has(lastMsg.item_id)) continue;
        seenMessages.add(lastMsg.item_id);

        const text = lastMsg.text.trim();
        const userId = lastMsg.user_id?.toString();

        console.log(`📩 ${text}`);

        // 🎯 command detect
        if (text.startsWith("!")) {
          const parts = text.slice(1).split(" ");
          const cmdName = parts[0].toLowerCase();
          const args = parts.slice(1);

          const cmd = commands[cmdName];

          if (cmd) {
            let reply = await cmd(args, userId);

            await ig.entity
              .directThread(threadId)
              .broadcastText(reply);
          } else {
            await ig.entity
              .directThread(threadId)
              .broadcastText("❓ Unknown command");
          }
        }

        // 🤖 auto reply
        else {
          if (text.toLowerCase().includes("hello")) {
            await ig.entity
              .directThread(threadId)
              .broadcastText("Hey there! 👋");
          }

          if (text.toLowerCase().includes("bye")) {
            await ig.entity
              .directThread(threadId)
              .broadcastText("Goodbye 👋");
          }

          if (text.toLowerCase().includes("thanks")) {
            await ig.entity
              .directThread(threadId)
              .broadcastText("Welcome 😊");
          }
        }
      }
    } catch (err) {
      console.log("⚠️ Error:", err.message);
    }
  }, 5000);
}

startBot();
