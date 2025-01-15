import puppeteer from "puppeteer";

async function getNumFollowersFromScroller(page, scroller) {
  return await page.evaluate((scroller) => {
    try {
      const followersContainer = scroller.children[0].children[0];
      if (followersContainer) {
        return followersContainer.childElementCount; // Return the number of children of this element
      }
      return "errorGetScrollerFollowers"; // Return error if followersContainer is not found
    } catch (error) {
      console.error("Error evaluating followers count:", error);
      return "errorGetScrollerFollowers"; // Return error in case of an exception
    }
  }, scroller);
}

async function scrapeFollowers(slaveUsername, cookies) {
  const browser = await puppeteer.launch({ headless: true }); // Set to true in production
  const page = await browser.newPage();

  // Set User-Agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
  );

  // Set cookies to maintain authenticated session
  await browser.setCookie(...cookies);

  // Navigate to the target user's profile
  await page.goto(`https://www.instagram.com/${slaveUsername}/`);

  // Check if the user is logged in by looking for the profile icon
  try {
    await page.waitForSelector('a[href="/accounts/edit/"]', { timeout: 5000 });
  } catch (error) {
    await browser.close();
    return "errorCookies";
  }

  // Click on the "followers" link
  try {
    await page.waitForSelector('a[href$="/followers/"]', { timeout: 5000 });
  } catch (error) {
    await browser.close();
    return "errorFollowersLink";
  }

  // Extract the number of followers from the 'title' attribute
  let followersCount;
  try {
    followersCount = await page.evaluate(() => {
      const followersElement = document.querySelector(
        'a[href$="/followers/"] span[title]'
      );
      return followersElement
        ? parseInt(followersElement.getAttribute("title").replace(/,/g, ""))
        : null;
    });
  } catch (error) {
    await browser.close();
    return "errorGetNumFollowers"; // Indicate failure
  }

  // Click on the 'followers' link
  await page.click('a[href$="/followers/"]');

  // Wait for scroller element to appear
  let scroller;
  try {
    scroller = await page.waitForSelector(
      ".xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6",
      { timeout: 5000 }
    );
  } catch (error) {
    await browser.close();
    return "errorLoadingFollowersModel";
  }

  // Get num followers from scroller
  let searchedNumFollowers = await getNumFollowersFromScroller(page, scroller);
  if (searchedNumFollowers === "errorGetScrollerFollowers") {
    await browser.close();
    return searchedNumFollowers;
  }

  while (followersCount !== searchedNumFollowers) {
    console.log(`Followers loaded: ${searchedNumFollowers}/${followersCount}`);

    // Scroll the scroller to the bottom
    await page.evaluate((scroller) => {
      scroller.scrollTop = scroller.scrollHeight; // Scroll to the bottom
    }, scroller);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Recalculate the number of searched followers
    searchedNumFollowers = await getNumFollowersFromScroller(page, scroller);
    if (searchedNumFollowers === "errorGetScrollerFollowers") {
      await browser.close();
      return "errorGetScrollerFollowers";
    }
  }

  // Get all the usernames from the followers list
  const usernames = await page.evaluate(() => {
    const usernameElements = document.querySelectorAll(
      'a._a6hd:not([href="#"]) > div > div > span'
    );
    return Array.from(usernameElements).map((el) => el.innerText);
  });

  //Close Browser
  await browser.close();
  return usernames;
}

export { scrapeFollowers };
