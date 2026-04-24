const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const API_KEY = process.env.API_KEY;

async function sendMessage(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: text,
  });
}

// 🔥 FUNÇÃO COM DEBUG FORÇADO
async function getGames() {
  try {
    console.log("🔥 FUNÇÃO getGames FOI CHAMADA");

    const today = new Date().toISOString().split("T")[0];

    const res = await axios.get(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: { "x-apisports-key": API_KEY }
      }
    );

    console.log("TOTAL JOGOS DO DIA:", res.data.response.length);

    return res.data.response;

  } catch (err) {
    console.log("ERRO NA API:", err.message);
    return [];
  }
}

app.post("/bot", async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  try {

    if (text === "/start") {
      await sendMessage(chatId, "🤖 Bot ativo!");
    }

    if (text === "/jogos") {
      console.log("COMANDO /jogos RECEBIDO");

      const games = await getGames();

      console.log("RESULTADO:", games);

      await sendMessage(chatId, "Teste executado");
    }

  } catch (err) {
    console.log("Erro:", err.message);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log("Rodando"));
