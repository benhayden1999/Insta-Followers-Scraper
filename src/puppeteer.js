import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getNumFollowersFromScroller } from "./helper.js";

const SELECTORS = {
  editProfile: 'a[href="/accounts/edit/"]',
  followersLink: 'a[href$="/followers/"]',
  followersScroller:
    ".xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6",
  followersUsernames: 'a._a6hd:not([href="#"]) > div > div > span',
};

async function scrapeFollowers(slaveUsername, cookies) {
  // Launch the browser using chrome-aws-lambda
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  let page;
  try {
    page = await browser.newPage();

    // Set User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
    );

    // Set cookies to maintain authenticated session
    await browser.setCookie(...cookies);

    // Navigate to the target user's profile
    await page.goto(`https://www.instagram.com/${slaveUsername}/`);

    // Check if user is logged in
    await page
      .waitForSelector(SELECTORS.editProfile, {
        timeout: 5000,
      })
      .catch(() => {
        throw new Error("errorCookies");
      });

    // Locate and click on followers link
    await page
      .waitForSelector(SELECTORS.followersLink, {
        timeout: 5000,
      })
      .catch(() => {
        throw new Error("errorFollowersLink");
      });

    // Wait for followers modal to load
    const scroller = await page
      .waitForSelector(SELECTORS.followersScroller, { timeout: 5000 })
      .catch(() => {
        throw new Error("errorLoadingFollowersmodal");
      });

    // Extract followers count
    const followersCount = await page.evaluate(() => {
      const followersElement = document.querySelector(
        'a[href$="/followers/"] span[title]'
      );
      return followersElement
        ? parseInt(followersElement.getAttribute("title").replace(/,/g, ""))
        : null;
    });

    if (!followersCount) {
      throw new Error("errorGetNumFollowers");
    }

    // Scroll and load followers
    let searchedNumFollowers = 0;
    while (followersCount !== searchedNumFollowers) {
      console.log(
        `Followers loaded: ${searchedNumFollowers}/${followersCount}`
      );
      searchedNumFollowers = await getNumFollowersFromScroller(page, scroller);

      await page.evaluate((scroller) => {
        scroller.scrollTop = scroller.scrollHeight;
      }, scroller);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Extract usernames
    const usernames = await page.evaluate((selector) => {
      const usernameElements = document.querySelectorAll(selector);
      return Array.from(usernameElements).map((el) => el.innerText);
    }, SELECTORS.followersUsernames);

    return usernames;
  } catch (error) {
    return { status: "error", message: error.message };
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

export { scrapeFollowers };
