import { scrapeFollowers } from "./src/puppeteer.js";
import { addFollowersToDb } from "./src/subpabase.js";
import { errorMessages, handleError } from "./src/helper.js";

//_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

// const accounts = await getAllSlaveAccounts();
// // const numSlaves = accounts.length;
// // for (let i = 0; i < numSlaves; i++) {
// //   console.log(accounts[i].username);
// // }

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
