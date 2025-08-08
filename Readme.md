# What is HOM Epoch Checker 
This is simply a bot that checks three servers from WOW Epoch:
- game.project-epoch.net:3724 (Auth Server)
- game.project-epoch.net:8085 (Kezan Server)
- game.project-epoch.net:8086 (Gurubashi Server)

If there is a change in the last server update it will remove any previous messages the bot has posted and post a new message of the server that has updated and when it updated. 

# How to install 

1. Ensure node.js is installed </br>
`https://nodejs.org/en/download`

2. Install node modules in the downloaded folder </br>
`npm install`

3. Create `.env` with necessary configurations.</br>
```javascript
DISCORD_TOKEN=''
CLIENT_ID=''
GUILD_ID=''
CHANNEL_ID=''
```
4. Start the bot with the following command: </br>
`node index.js`
