const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.BOT_TOKEN;
const mongoUri = process.env.MONGO_URI;

// MongoDB ulanishi
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB ulandi ✅"))
.catch((err) => console.error("MongoDB ulanishda xatolik ❌", err));

// Telegram bot
const bot = new TelegramBot(botToken, { polling: true });

// Schemani yaratamiz (oddiy misol)
const WordSchema = new mongoose.Schema({
  english: String,
  uzbek: String,
});

const Word = mongoose.model("Word", WordSchema);

// /start komandasi
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "Assalomu alaykum! Inglizcha so'zlar botiga xush kelibsiz.");
});

// /add so'z qo‘shish komandasi
bot.onText(/\/add (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  const [english, uzbek] = text.split(" - ");
  if (!english || !uzbek) {
    return bot.sendMessage(chatId, "Iltimos, so‘zni quyidagicha yuboring:\n`/add apple - olma`", {
      parse_mode: "Markdown",
    });
  }

  const word = new Word({ english, uzbek });
  await word.save();
  await bot.sendMessage(chatId, `✅ So'z saqlandi: ${english} - ${uzbek}`);
});

// /all barcha so‘zlarni ko‘rsatish
bot.onText(/\/all/, async (msg) => {
  const chatId = msg.chat.id;
  const words = await Word.find();

  if (words.length === 0) {
    return bot.sendMessage(chatId, "📭 Hech qanday so‘z topilmadi.");
  }

  const formatted = words.map(w => `🔹 ${w.english} - ${w.uzbek}`).join("\n");
  await bot.sendMessage(chatId, formatted);
});

// Serverni ishga tushuramiz (Render uchun kerak)
app.get("/", (req, res) => {
  res.send("Bot ishga tushdi 🚀");
});

app.listen(port, () => {
  console.log(`Server ${port}-portda ishlayapti...`);
});
