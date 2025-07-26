const { Telegraf } = require('telegraf');
const fs = require('fs');
const LocalSession = require('telegraf-session-local');

const bot = new Telegraf('7973884067:AAGRAFB-6OD98SpckpTUccXaK4vwpyr3fj4');

// Sessiya o‘rnatish
bot.use(new LocalSession({ database: 'session.json' }).middleware());

bot.start((ctx) => ctx.reply('Salom! Soʻz yuboring: develop - rivojlantirmoq'));
bot.help((ctx) => ctx.reply('Yangi soʻz: word - tarjima\nTekshirish: /quiz'));

// So‘zni qo‘shish
bot.on('text', async (ctx, next) => {
  const msg = ctx.message.text;

  if (msg === '/quiz') {
    // So‘zlar bazasidan o‘qiladi
    const data = fs.readFileSync('data.json', 'utf-8');
    const words = JSON.parse(data);

    if (words.length === 0) {
      return ctx.reply('❌ Hozircha soʻz yoʻq.');
    }

    // Tasodifiy so‘z tanlash
    const randomWord = words[Math.floor(Math.random() * words.length)];

    // Sessiyada saqlaymiz
    ctx.session.currentWord = randomWord;

    return ctx.reply(`Inglizcha so‘z: *${randomWord.english}*\nTarjimasini yozing:`, {
      parse_mode: 'Markdown',
    });
  }

  // Tekshirish rejimi
  if (ctx.session.currentWord) {
    const userAnswer = msg.trim().toLowerCase();
    const correct = ctx.session.currentWord.uzbek.toLowerCase();

    if (userAnswer === correct) {
      ctx.reply('✅ To‘g‘ri!');
    } else {
      ctx.reply(`❌ Noto‘g‘ri. To‘g‘risi: ${ctx.session.currentWord.uzbek}`);
    }

    // Sessiyani tozalaymiz
    ctx.session.currentWord = null;
    return;
  }

  // Yangi so‘z qo‘shish
  if (msg.includes('-')) {
    const [english, uzbek] = msg.split('-').map(t => t.trim());

    if (!english || !uzbek) {
      return ctx.reply('❌ Format noto‘g‘ri. To‘g‘risi: word - tarjima');
    }

    let words = [];
    try {
      words = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    } catch (e) {}

    words.push({ english, uzbek });

    fs.writeFileSync('data.json', JSON.stringify(words, null, 2));
    return ctx.reply(`✅ Saqlandi:\n${english} - ${uzbek}`);
  }

  next();
});

bot.launch();
console.log('Bot ishga tushdi...');

// /next buyrug‘i — ketma-ket test
bot.command('next', async (ctx) => {
    const data = fs.readFileSync('data.json', 'utf-8');
    const words = JSON.parse(data);
  
    if (words.length === 0) return ctx.reply('❌ Hozircha soʻz yoʻq.');
  
    const randomWord = words[Math.floor(Math.random() * words.length)];
    ctx.session.currentWord = randomWord;
  
    return ctx.reply(`❓ Tarjimasini yozing:\n👉 *${randomWord.english}*`, {
      parse_mode: 'Markdown',
    });
  });
  
  // /list buyrug‘i — barcha so‘zlar ro‘yxati
  bot.command('list', (ctx) => {
    try {
      const data = fs.readFileSync('data.json', 'utf-8');
      const words = JSON.parse(data);
      if (words.length === 0) return ctx.reply('📂 So‘zlar roʻyxati boʻsh');
  
      const list = words.map((w, i) => `${i + 1}. ${w.english} - ${w.uzbek}`).join('\n');
      ctx.reply(`📚 Barcha so‘zlar:\n\n${list}`);
    } catch (e) {
      ctx.reply('❌ Xatolik yuz berdi.');
    }
  });
