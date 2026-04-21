const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

let stats = { green: 0, red: 0 };

async function sendMessage(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: text,
  });
}

app.post("/bot", async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await sendMessage(chatId, "🤖 Bot ativo!");
  }

  if (text === "/green") {
    stats.green++;
    await sendMessage(chatId, "✅ Green!");
  }

  if (text === "/red") {
    stats.red++;
    await sendMessage(chatId, "❌ Red!");
  }

  if (text === "/stats") {
    await sendMessage(
      chatId,
      `📊 Green: ${stats.green} | Red: ${stats.red}`
    );
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log("Rodando"));
