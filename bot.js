const { IgApiClient } = require('instagram-private-api');

const ig = new IgApiClient();

// 🔐 তোমার info
const USERNAME = "your_username";
const PASSWORD = "your_password";

// 👑 admin user ids (নিজেরটা বসাও)
const ADMINS = ["your_user_id"];

// 🧠 memory
let seenMessages = new Set();

// 🔹 command system
const commands = {

  ping: async () => "Pong! 🏓",

  help: async () => {
    return `
Commands:
!ping
!help
!echo <text>
!time
!random
!hi
!admin (admin only)
`;
  },

  echo: async (args) => args.join(" ") || "Nothing to echo!",

  time: async () => new Date().toLocaleString(),

  random: async () => "🎲 " + Math.floor(Math.random() * 100),

  hi: async () => "Hello 👋",

  admin: async (args, userId) => {
    if (!ADMINS.includes(userId)) {
      return "❌ You are not admin!";
    }
    return "👑 Admin command executed!";
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

        // ❌ duplicate avoid
        if (seenMessages.has(lastMsg.item_id)) continue;
        seenMessages.add(lastMsg.item_id);

        const text = lastMsg.text.trim();
        const userId = lastMsg.user_id?.toString();

        console.log(`📩 ${text} (from ${userId})`);

        // 🔹 command check
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
              .broadcastText("❓ Unknown command. Type !help");
          }
        }

        // 🔹 auto reply (non-command)
        else {
          if (text.toLowerCase().includes("hello")) {
            await ig.entity
              .directThread(threadId)
              .broadcastText("Hey there! 👋");
          }
        }
      }
    } catch (err) {
      console.log("⚠️ Error:", err.message);
    }
  }, 5000);
}

startBot();
