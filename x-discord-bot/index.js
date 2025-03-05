require("dotenv").config()
const { Client, GatewayIntentBits } = require("discord.js")
const { TwitterApi } = require("twitter-api-v2")

// Configuration
const CONFIG = {
  TWITTER_USER_ID: process.env.TWITTER_USER_ID,
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  CHECK_INTERVAL: 20 * 60 * 1000, // 20 minutes
  TWEET_PARAMS: {
    exclude: ["replies"],
    max_results: 5,
    start_time: new Date().toISOString(), // Only get tweets from bot start
  },
}

// Initialize Discord client
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
})

// Helper function to send tweet to Discord
async function sendTweetToDiscord(channel, tweet) {
  try {
    await channel.send({
      content: `🔔 New post alert @everyone\nhttps://x.com/user/status/${tweet.id}`,
    })
    console.log(`Tweet ${tweet.id} sent to Discord`)
  } catch (error) {
    console.error("Error sending tweet to Discord:", error.message)
  }
}

// Main function to check for new tweets
async function checkForNewTweets() {
  try {
    console.log("Checking for new tweets...")

    // Get tweets
    const tweets = await twitterClient.v2.userTimeline(
      CONFIG.TWITTER_USER_ID,
      CONFIG.TWEET_PARAMS
    )

    // Log rate limit info
    console.log("Rate limits:", {
      remaining: tweets.rateLimit.remaining,
      reset: new Date(tweets.rateLimit.reset * 1000).toLocaleTimeString(),
    })

    // If no tweets, return early
    if (!tweets.data.data?.length) {
      return console.log("No new tweets found")
    }

    // Get Discord channel
    const channel = discordClient.channels.cache.get(CONFIG.DISCORD_CHANNEL_ID)
    if (!channel) {
      return console.error("Discord channel not found!")
    }

    // Send new tweets to Discord (newest last)
    for (const tweet of tweets.data.data.reverse()) {
      await sendTweetToDiscord(channel, tweet)
    }
  } catch (error) {
    if (error.code === 429) {
      const resetTime = error.rateLimit.reset * 1000
      const waitTime = resetTime - Date.now()
      console.warn(`Rate limit hit, waiting ${Math.ceil(waitTime / 1000)}s`)
      setTimeout(checkForNewTweets, waitTime)
      return
    }
    console.error("Error:", error.message)
  }
}

// Discord bot initialization
discordClient.once("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}`)

  const channel = discordClient.channels.cache.get(CONFIG.DISCORD_CHANNEL_ID)
  if (!channel) {
    console.error("Invalid Discord channel ID!")
    process.exit(1)
  }

  console.log(`Connected to channel: #${channel.name}`)
  console.log(
    `Checking for tweets every ${CONFIG.CHECK_INTERVAL / 1000 / 60} minutes`
  )

  // Start tweet checking
  checkForNewTweets()
  setInterval(checkForNewTweets, CONFIG.CHECK_INTERVAL)
})

// Start the bot
discordClient.login(process.env.DISCORD_TOKEN)
