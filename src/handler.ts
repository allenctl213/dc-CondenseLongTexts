import { Message } from 'discord.js';
import { ResultAsync } from 'neverthrow';
import 'dotenv/config';
 
// ===================================================
// 設定區塊 — 填入你的 AI 回覆專屬頻道 ID
// ===================================================
const CHANNEL_ID = process.env.CHANNEL_ID as string;
 
/**
 * 主處理函式
 * @param message    - 用戶回覆長文時發出的觸發訊息
 * @param customText - !ai 後面的自訂說明文字（可為空）
 */
export function handleAIReply(
  message: Message,
  long:string,
  short?:string
): ResultAsync<void, string> {
  return ResultAsync.fromPromise(
    (async () => {
      
      // --- 取得 AI 專屬頻道 ---
      const fixChannel = (message.client.channels.cache.get(CHANNEL_ID)) as 
      { send: (content: string) => Promise<Message> };
      const rawChannel = message.channel as
      { send: (content: string) => Promise<Message> };
     
 
      // --- 把長文發到特定頻道 ---
      // 將!ai後的長文發送至AI頻道
      const sentMsg = await fixChannel.send(long);

      // --- 刪除原頻道的觸發訊息 ---
      await message.delete().catch(() => {});
      
      const jumpURL = sentMsg.url;
      // --- 在原頻道發跳轉連結 ---
      const displayText = short
        ? `💬 ${short} → ${jumpURL}`
        : `💬 **${message.author.displayName}** 新增註解→ ${jumpURL}`;
      const originMsg= await rawChannel.send(displayText);

      const originURL=originMsg.url;
      sentMsg.edit(`${long}→ ${originURL}`);

    })(),
    (e) => (e instanceof Error ? e.message : String(e))
  );
}
