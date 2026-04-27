const { IgApiClient } = require('instagram-private-api');

const ig = new IgApiClient();

async function startBot() {
  ig.state.generateDevice("your_username");

  await ig.account.login("your_username", "your_password");

  console.log("✅ Logged in");

  setInterval(async () => {
    const inbox = ig.feed.directInbox();
    const threads = await inbox.items();

    for (let thread of threads) {
      const threadId = thread.thread_id;

      const messages = thread.items;
      const lastMsg = messages[0];

      if (lastMsg.text === "!ping") {
        await ig.entity
          .directThread(threadId)
          .broadcastText("Pong!");
      }
    }
  }, 5000);
}

startBot();
