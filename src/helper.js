import { sendTelegramMessage } from "./telegram.js";

export const errorMessages = {
  errorCookies: "Bad Cookies.",
  errorFollowersLink: "Didin't find the num followers link.",
  errorGetNumFollowers: "Didn't get the num followers from followers link.",
  errorLoadingFollowersModel: "Unable to load the followers model.",
  errorGetScrollerFollowers: "Unable to get the scroller in followers model.",
  errorAddingFollowersSupabase: "Error adding followers to Supabase.",
};

export async function handleError(errorCode, slaveUsername) {
  const message = errorMessages[errorCode] || "Unknown error occurred.";
  await sendTelegramMessage(
    `🚨 Error scraping followers for <b><a href="https://www.instagram.com/${slaveUsername}/">${slaveUsername}</a></b>\n\nℹ️ ${message}`
  );
}
