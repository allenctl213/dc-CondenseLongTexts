import { Message } from 'discord.js';
import { ResultAsync } from 'neverthrow';
 
// ===================================================
// 設定區塊 — 填入你的 AI 回覆專屬頻道 ID
// ===================================================
const AI_CHANNEL_ID = '1520743474843091044';
 
/**
 * 主處理函式
 * @param message    - 用戶回覆長文時發出的觸發訊息
 * @param customText - !ai 後面的自訂說明文字（可為空）
 */
export function handleAIReply(
  message: Message,
  customText: string
): ResultAsync<void, string> {
  return ResultAsync.fromPromise(
    (async () => {
      // --- 取得被回覆的長文訊息 ---
      const targetMsg = await message.channel.messages.fetch(
        message.reference!.messageId!
      );
 
      const content = targetMsg.content;
      if (!content) throw new Error('被回覆的訊息沒有文字內容');
 
      // --- 取得 AI 專屬頻道 ---
      const rawChannel = message.client.channels.cache.get(AI_CHANNEL_ID);
      // 用「是否具備 send 能力」判斷，涵蓋 TextChannel、ThreadChannel、
      // NewsChannel 等所有可發訊息的頻道類型，不侷限於單一型別
      if (!rawChannel || typeof (rawChannel as any).send !== 'function') {
        throw new Error('找不到 AI 回覆專屬頻道，或該頻道不支援發送訊息，請確認 AI_CHANNEL_ID 是否正確');
      }
      const aiChannel = rawChannel as { send: (content: string) => Promise<Message> };
 
      // --- 把長文發到 AI 頻道 ---
      // 前提：內容來自「回覆訊息」，單則訊息本就不超過 2000 字，故不處理分段
      const sentMsg = await aiChannel.send(content);
 
      // --- 刪除原頻道的長文和觸發訊息 ---
      await targetMsg.delete().catch(() => {});
      await message.delete().catch(() => {});
 
      // --- 在原頻道發跳轉連結 ---
      const jumpURL = sentMsg.url;
      const displayText = customText
        ? `💬 **${message.author.displayName}**：${customText} → ${jumpURL}`
        : `💬 **${message.author.displayName}** 分享了一則 AI 回覆 → ${jumpURL}`;
      
      const chatChannel=message.channel as { send: (content: string) => Promise<Message> };
      await chatChannel.send(displayText);
    })(),
    (e) => (e instanceof Error ? e.message : String(e))
  );
}
