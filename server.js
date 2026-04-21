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
    await sendMessage(chatId, "✅ Green");
  }

  if (text === "/red") {
    stats.red++;
    await sendMessage(chatId, "❌ Red");
  }

  if (text === "/stats") {
    await sendMessage(chatId, `📊 Green: ${stats.green} | Red: ${stats.red}`);
  }

  res.sendStatus(200);
});

const API_KEY = process.env.API_KEY;
async function getGames() {
  const res = await axios.get(
    "https://v3.football.api-sports.io/fixtures?live=all",
    {
      headers: { "x-apisports-key": API_KEY }
    }
  );

  return res.data.response;
}
function hasRedCard(events) {
  return events?.some(e => e.type === "Card" && e.detail === "Red Card");
}
setInterval(async () => {
  const games = await getGames();

  for (const g of games) {
    if (hasRedCard(g.events)) {
      const msg = `🚨 JOGO COM EXPULSÃO\n\n${g.teams.home.name} vs ${g.teams.away.name}`;

      await sendMessage(SEU_CHAT_ID, msg);
    }
  }
}, 20000);
app.listen(PORT, () => console.log("Rodando"));
