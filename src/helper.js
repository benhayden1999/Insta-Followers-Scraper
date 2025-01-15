import { sendTelegramMessage } from "./telegram.js";

export const errorMessages = {
  errorCookies: "Bad Cookies.",
  errorFollowersLink: "Didin't find the num followers link.",
  errorLoadingFollowersmodal: "Unable to load the followers modal.",
  errorGetNumFollowers: "Didn't get the num followers from followers link.",
  errorGetScrollerFollowers: "Unable to get the scroller in followers modal.",
  errorAddingFollowersSupabase: "Error adding followers to Supabase.",
};

export async function handleError(errorCode, slaveUsername) {
  const message = errorMessages[errorCode] || "Unknown error occurred.";
  await sendTelegramMessage(
    `🚨 Error scraping followers for <b><a href="https://www.instagram.com/${slaveUsername}/">${slaveUsername}</a></b>\n\nℹ️ ${message}`
  );
}

export async function getNumFollowersFromScroller(page, scroller) {
  const count = await page.evaluate((scroller) => {
    const followersContainer = scroller.children[0]?.children[0];
    return followersContainer ? followersContainer.childElementCount : null;
  }, scroller);

  if (count === null) {
    throw new Error("errorGetScrollerFollowers");
  }

  return count;
}
