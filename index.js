import { scrapeFollowers } from "./src/puppeteer.js";
import { addFollowersToDb } from "./src/subpabase.js";
import { errorMessages, handleError } from "./src/helper.js";

//_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

// const slaveUsername = "katebentleyx";

(async () => {
  const usernamesArray = await scrapeFollowers(slaveUsername, cookies);
  console.log(usernamesArray);

  if (errorMessages[usernamesArray]) {
    await handleError(usernamesArray, slaveUsername);
    return;
  }

  const newFollowers = await addFollowersToDb(slaveUsername, usernamesArray);
  if (errorMessages[newFollowers]) {
    await handleError(newFollowers, slaveUsername);
    return;
  }

  console.log(newFollowers);
})();
