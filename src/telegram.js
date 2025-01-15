import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const telegramApiKey = process.env.TELEGRAM_API_KEY;
const groupId = process.env.TELEGRAM_GROUP_ID;

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${telegramApiKey}/sendMessage`;
  const params = new URLSearchParams({
    chat_id: groupId,
    text: message,
    parse_mode: "HTML",
  });

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${url}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.floor(Math.random() * 10000) + 5000; // Random delay between 5000 and 15000 ms
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error; // Rethrow the error after the last attempt
      }
    }
  }
}

export { sendTelegramMessage };
