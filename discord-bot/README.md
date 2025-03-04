# Discord Bot Setup Guide

## Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name your bot
3. Go to the "Bot" tab
4. Under the Token section:
   - Click "Reset Token" if not yet generated
   - Click "Copy" to get your bot token (you'll add this to the `.env` file)
5. Scroll down and enable "Message Content Intent" under Privileged Gateway Intents
6. Go to the "OAuth2" tab:
   - Select "bot" under scopes
   - For permissions, select:
     - Embed Links
     - Read Messages/View Channels
     - Send Messages
7. Use the generated URL to add the bot to your server

## Step 2: Get Twitter API Access

1. Sign up for a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new project and app
3. Generate API keys and tokens
4. Find your Twitter user ID:
   - Use a tool like [tweeterid.com](https://tweeterid.com)
   - Or run the script:
     ```bash
     node getTwitterUserId.js
     ```

## Step 3: Set Up Your Bot

1. Create a new folder for your project
2. Install required packages:
   ```bash
   npm init -y
   npm install discord.js twitter-api-v2 dotenv
   ```
3. Create a `.env` file and add your credentials:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_SECRET=your_twitter_access_secret
   DISCORD_CHANNEL_ID=your_discord_channel_id
   ```

## Step 4: Get Discord Channel ID

### 🛠️ Enable Developer Mode
1. Open Discord
2. Go to User Settings (⚙️ gear icon next to your username)
3. Scroll down to Advanced
4. Enable Developer Mode

### 🔍 Find the Channel ID
1. Right-click on the channel where you want to post tweets
2. Click "Copy Channel ID"
3. Paste it into your `.env` file

## Step 5: Run Your Bot

```bash
node index.js
```

## Additional Notes

- Keep your `.env` file secure and never share your tokens
- Make sure to add `.env` to your `.gitignore` file
- The bot requires Node.js version 16.0.0 or higher