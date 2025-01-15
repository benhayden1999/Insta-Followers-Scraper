import { scrapeFollowers } from "./src/puppeteer.js";
import { addFollowersToDb } from "./src/subpabase.js";
import { errorMessages, handleError } from "./src/helper.js";

//_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

const cookies = [
  {
    name: "dpr",
    value: "1",
    domain: ".instagram.com",
    path: "/",
    expires: 1737563474,
    httpOnly: false,
    secure: true,
  },
  {
    name: "datr",
    value: "j3WFZ_JQ5HL5YZAp1dAA2UrZ",
    domain: ".instagram.com",
    path: "/",
    expires: 1771359636.714017,
    httpOnly: true,
    secure: true,
  },
  {
    name: "ig_did",
    value: "26B64EDE-47B8-4EAB-A118-61FEF9DE0DFC",
    domain: ".instagram.com",
    path: "/",
    expires: 1768335641.687222,
    httpOnly: true,
    secure: true,
  },
  {
    name: "mid",
    value: "Z4V1jwAEAAGEcPvhzfaz7pewBjpJ",
    domain: ".instagram.com",
    path: "/",
    expires: 1771359636.714104,
    httpOnly: true,
    secure: true,
  },
  {
    name: "csrftoken",
    value: "qkozo7qwC2zuODkdWeu0xiylCmD0lKij",
    domain: ".instagram.com",
    path: "/",
    expires: 1768408274.773664,
    httpOnly: false,
    secure: true,
  },
  {
    name: "ds_user_id",
    value: "71531765872",
    domain: ".instagram.com",
    path: "/",
    expires: 1744734674.773718,
    httpOnly: false,
    secure: true,
  },
  {
    name: "wd",
    value: "1660x698",
    domain: ".instagram.com",
    path: "/",
    expires: 1737563474,
    httpOnly: false,
    secure: true,
    sameSite: "Lax",
  },
  {
    name: "sessionid",
    value:
      "71531765872%3AHFloDbD9qZqyBR%3A26%3AAYehBKMy51JoxhQJKgwVZziJIMIgADM289WhyyWExg",
    domain: ".instagram.com",
    path: "/",
    expires: 1768494674.727598,
    httpOnly: true,
    secure: true,
  },
  {
    name: "rur",
    value:
      '"CLN\\05471531765872\\0541768494674:01f752030007dba18e18bbb704c27d508406620db4e18695b8df0d34ed69f28ba136225a"',
    domain: ".instagram.com",
    path: "/",
    expires: -1,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  },
];

const slaveUsername = "katebentleyx";

(async () => {
  const usernamesArray = await scrapeFollowers(slaveUsername, cookies);
  console.log(usernamesArray);

  if (usernamesArray.status === "error") {
    await handleError(usernamesArray.message, slaveUsername);
    return;
  }

  const newFollowers = await addFollowersToDb(slaveUsername, usernamesArray);
  if (errorMessages[newFollowers]) {
    await handleError(newFollowers, slaveUsername);
    return;
  }

  console.log(newFollowers);
})();
