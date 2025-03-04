require("dotenv").config()
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js")
const { TwitterApi } = require("twitter-api-v2")

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
})

// Twitter user ID to monitor
const TWITTER_USER_ID = process.env.TWITTER_USER_ID
// Discord channel ID to post tweets to
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID

let lastTweetId = null

async function checkForNewTweets() {
  try {
    const params = {
      exclude: ["replies"],
      max_results: 5,
    }

    if (lastTweetId) {
      params.since_id = lastTweetId
    }

    const tweets = await twitterClient.v2.userTimeline(TWITTER_USER_ID, params)

    // Process tweets first before checking rate limits
    if (tweets.data.data && tweets.data.data.length > 0) {
      const latestTweet = tweets.data.data[0]
      console.log("latestTweet", latestTweet) // Log the latest post

      // Store the latest post ID and send it to Discord on the first run
      if (lastTweetId === null) {
        console.log(`Initial post found: ${latestTweet.text}`)
        const channel = client.channels.cache.get(DISCORD_CHANNEL_ID)

        if (channel) {
          // For initial post
          await channel.send({
            content: `🔔 Hey @everyone check out this post!\nhttps://x.com/user/status/${latestTweet.id}`,
          })
          console.log("Initial post sent to Discord")
        }

        lastTweetId = latestTweet.id
        console.log(`Initial post ID set to: ${lastTweetId}`)
        return
      }

      // If there's a new post
      if (latestTweet.id !== lastTweetId) {
        console.log(`New post found: ${latestTweet.text}`)
        const channel = client.channels.cache.get(DISCORD_CHANNEL_ID)

        if (channel) {
          await channel.send({
            content: `🚨 New post alert @everyone!\nhttps://x.com/user/status/${latestTweet.id}`,
          })
          console.log("New post sent to Discord")
        }

        lastTweetId = latestTweet.id
      }
    }

    // Log rate limit info after processing tweets
    console.log("Rate limits:", {
      remaining: tweets.rateLimit.remaining,
      limit: tweets.rateLimit.limit,
      reset: new Date(tweets.rateLimit.reset * 1000).toLocaleTimeString(),
    })
  } catch (error) {
    if (error.code === 429) {
      const resetTime = error.rateLimit.reset * 1000 // Convert to ms
      const waitTime = resetTime - Date.now()
      console.warn(
        `Rate limit exceeded. Retrying in ${Math.ceil(
          waitTime / 1000
        )} seconds...`
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      return checkForNewTweets()
    }

    console.error("Error checking for tweets:", error)
  }
}

// When Discord bot is ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`)

  // Run initial check immediately
  checkForNewTweets()

  // Then run every 15 minutes
  setInterval(checkForNewTweets, 15 * 60 * 1000) // 15 minutes in milliseconds

  console.log(`Tweet checks scheduled every 15 minutes`)
})

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
