const Parser = require("rss-parser");
const cron = require("node-cron");
const axios = require("axios");
const parser = new Parser();
const seenArticleIds = new Set();

//Replace 'apiUrl', 'brand_id' and 'auth_token' with your own API POST URL, Brand Id and Token
const apiUrl =
  "https://scheduler.dashhudson.com/facebook/scheduled_posts?media_v2=true";
const brand_id = 16909;
const auth_token =
  "a87a0932bfdc493b189c5dde0ffbfbd71664d8938460037fb0ab65bf950f";

// Fetching articles from RSS Feed
async function rssFeedFetcher() {
  try {
    let succes = 0;
    let duplicate = 0;

    // Replace 'feedUrl' with the actual RSS feed URL
    const feedUrl = "https://www.homebeautiful.com.au/feed/";

    // Parse the RSS feed
    const feed = await parser.parseURL(feedUrl);

    // Iterate through the feed items
    feed.items.forEach((item) => {
      // Check if the article ID is already seen
      if (!seenArticleIds.has(item.guid)) {

        //Calling function to schedule article to Dash Hudson
        rssFeedScheduler(item.title, item.link);
        succes++;
        // Store the article ID in the set to check duplicate articles in next schedule
        seenArticleIds.add(item.guid);
      } else {
        duplicate++;
      }
    });

    const month = new Date().getMonth() + 1; // Months are zero-based

    console.log(
      "Articles fetching completed - Time ",
      new Date().getFullYear() +
        "/" +
        month +
        "/" +
        new Date().getDate() +
        "  " +
        new Date().getHours() +
        ":" +
        new Date().getMinutes()
    );
    console.log("---------------------------------------------------------");
    console.log("New articles pushed : ", succes);
    console.log("Duplicate articles found : ", duplicate);
    console.log("---------------------------------------------------------");
  } catch (error) {
    if (error?.response) {
      // The request was made and the server responded with a status code
      console.log(`Error: ${error?.response?.data.description}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.log(`Error: No response received from ${feedUrl}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(`Error: ${error.message}`);
    }
  }
}

//Function to push new feed article to Dash Hudson
async function rssFeedScheduler(title, link) {
  try {
    const response = axios.post(apiUrl, dataFormation(title, link), {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
    });
  } catch (error) {
    if (error?.response) {
      // The request was made and the server responded with a status code
      console.log(`Error: ${error?.response?.data.description}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.log(`Error: No response received from ${apiUrl}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(`Error: ${error.message}`);
    }
  }
}

//Data Formation for API body
const dataFormation = (title, link) => {
  return {
    auto_publish: false,
    board_ids: [],
    campaign_ids: [],
    brand_id: `${brand_id}`,
    media: [],
    media_ids: [],
    message: `${title}`,
    location: null,
    location_id: null,
    link: `${link}`,
    timestamp: null,
    video_title: "",
    thumb_offset: null,
    thumbnail_url: null,
    alt_text_media_map: {},
    shorten_link: false,
    custom_utms: false,
    link_preview: {
      title: null,
      description: null,
      image_media_id: null,
    },
  };
};

// Schedupling articles to Dash Hudson has been started
console.log("Scheduling articles to Dash Hudson has been started\n");
cron.schedule("*/1 * * * *", rssFeedFetcher);
