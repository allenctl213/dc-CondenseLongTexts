import { Client, GatewayIntentBits, Events } from 'discord.js';
import 'dotenv/config';
import { handleAIReply } from './handler.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ===================================================
// 觸發方式區塊 — 目前使用前綴指令 !ai
// 如果要改成斜線指令 /ai，請參考 handler.ts 底部的說明
// ===================================================
const PREFIX = '!ai';

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot 已上線：${client.user!.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // ===================================================
  // 觸發判斷 — 回覆某則訊息，並以 PREFIX 開頭
  // 若改用斜線指令，這整個 MessageCreate 事件要替換掉
  // ===================================================
  if (!message.content.startsWith(PREFIX)) return;
  if (!message.reference?.messageId) {
    await message.reply('請**回覆**你想轉發的長文訊息，再輸入 `!ai 自訂說明`');
    return;
  }

  const customText = message.content.slice(PREFIX.length).trim();

  const result = await handleAIReply(message, customText);

  result.match(
    () => {},
    async (err) => {
      console.error('handleAIReply 失敗：', err);
      await message.channel.send(`❌ 發生錯誤：${err}`).catch(() => {});
    }
  );
});

client.login(process.env.BOT_TOKEN);
