const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const API_KEY = process.env.API_KEY;

let stats = { green: 0, red: 0 };

async function sendMessage(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: text,
  });
}

// 🔥 NOVA FUNÇÃO (FUNCIONA NO PLANO GRÁTIS)
async function getGames() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await axios.get(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: { "x-apisports-key": API_KEY }
      }
    );

    // 🔥 FILTRA SÓ JOGOS AO VIVO
    const liveGames = res.data.response.filter(g =>
      g.fixture.status.short === "1H" ||
      g.fixture.status.short === "2H"
    );

    return liveGames;

  } catch (err) {
    console.log("Erro API:", err.message);
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

    if (text === "/jogos") {
      const games = await getGames();

      if (!games || games.length === 0) {
        await sendMessage(chatId, "Nenhum jogo ao vivo agora.");
      } else {
        const lista = games
          .slice(0, 5)
          .map(g => `${g.teams.home.name} vs ${g.teams.away.name}`)
          .join("\n");

        await sendMessage(chatId, `⚽ Jogos ao vivo:\n\n${lista}`);
      }
    }

  } catch (err) {
    console.log("Erro:", err.message);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log("Rodando"));
