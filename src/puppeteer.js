import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
import getNumFollowersFromScroller from "./helper.js";

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
    try {
      await page.waitForSelector('a[href="/accounts/edit/"]', {
        timeout: 5000,
      });
    } catch (error) {
      throw new Error("errorCookies");
    }

    // Locate and click on followers link
    try {
      await page.waitForSelector('a[href$="/followers/"]', { timeout: 5000 });
      await page.click('a[href$="/followers/"]');
    } catch (error) {
      throw new Error("errorFollowersLink");
    }

    // Wait for followers modal to load
    let scroller;
    try {
      scroller = await page.waitForSelector(
        ".xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6",
        { timeout: 5000 }
      );
    } catch (error) {
      throw new Error("errorLoadingFollowersmodal");
    }

    // Extract followers count and scroll
    let followersCount = await page.evaluate(() => {
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

    // Get num followers from scroller
    let searchedNumFollowers;
    try {
      searchedNumFollowers = await getNumFollowersFromScroller(page, scroller);
    } catch (error) {
      throw new Error("errorGetScrollerFollowers");
    }

    while (followersCount !== searchedNumFollowers) {
      console.log(
        `Followers loaded: ${searchedNumFollowers}/${followersCount}`
      );

      // Scroll down
      await page.evaluate((scroller) => {
        scroller.scrollTop = scroller.scrollHeight; // Scroll to the bottom
      }, scroller);

      // Wait before re-evaluating
      await new Promise((resolve) => setTimeout(resolve, 100));

      searchedNumFollowers = await getNumFollowersFromScroller(page, scroller);
    }

    // Extract usernames
    const usernames = await page.evaluate(() => {
      const usernameElements = document.querySelectorAll(
        'a._a6hd:not([href="#"]) > div > div > span'
      );
      return Array.from(usernameElements).map((el) => el.innerText);
    });

    return usernames;
  } catch (error) {
    console.error("Error during scraping:", error);
    return { status: "error", message: error.message };
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

export { scrapeFollowers };
