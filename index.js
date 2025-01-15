import { scrapeFollowers } from "./src/puppeteer.js";
import { addFollowersToDb } from "./src/subpabase.js";
import { errorMessages, handleError } from "./src/helper.js";

//_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

export const handler = async (event) => {
  const { slaveUsername, cookies, proxy } = JSON.parse(event.body);

  // Scrape followers
  const usernamesArray = await scrapeFollowers(slaveUsername, cookies, proxy);

  if (usernamesArray.status === "error") {
    await handleError(usernamesArray.message, slaveUsername);
    return; // Simply return, as the error is handled internally
  }

  // Add followers to the database
  const newFollowers = await addFollowersToDb(slaveUsername, usernamesArray);

  if (errorMessages[newFollowers]) {
    await handleError(newFollowers, slaveUsername);
    return; // Again, return since the error is handled
  }

  console.log("New followers added:", newFollowers);
};
