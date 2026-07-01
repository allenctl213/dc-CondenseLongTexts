import { Client, GatewayIntentBits, Events } from 'discord.js';
import 'dotenv/config';
import { handleAIReply } from './handler.js';
import { Result} from 'neverthrow';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


const PREFIX = '!ai';
const SEPERATOR='---';

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

  let result:Result<void, string>;
  let short:string;
  let long:string;

  const index = message.content.indexOf("---");

  if(index===-1){
    long=message.content.slice(PREFIX.length).trim();
    result = await handleAIReply(message,long);
  }
  else{
    short=message.content.slice(PREFIX.length,index).trim();
    long=message.content.slice(index+SEPERATOR.length).trim();
    if(short.length===0)result = await handleAIReply(message,long);
    else result= await handleAIReply(message,long,short);
  }

  result.match(
    () => {},
    async (err) => {
      console.error('handleAIReply 失敗：', err);
      await message.channel.send(`❌ 發生錯誤：${err}`).catch(() => {});
    }
  );
});

client.login(process.env.BOT_TOKEN);
