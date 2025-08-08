// Require the necessary discord.js classes
require('dotenv').config()
const token = process.env.DISCORD_TOKEN
const channelId = process.env.CHANNEL_ID

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const net = require('net');

const host = 'game.project-epoch.net';

const ports = [{
	portNumber:3724,
	serverName: "**AuthServer**",
	currentStatus: "",
	pastStatus: "",
	lastChange: "",
	messageDisplay: ""
}, {
	portNumber:8085,
	serverName: "**Kezan**",
	currentStatus: "",
	pastStatus: "",
	lastChange: "",
	messageDisplay: ""
}, {
	portNumber:8086,
	serverName: "**Gurubashi**",
	currentStatus: "",
	pastStatus: "",
	lastChange: "",
	messageDisplay: ""
}];



const client = new Client({ intents: [GatewayIntentBits.Guilds] });


// Runs only once client is first loaded.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	checkServerStatuses()
});


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to Erase Bots Old Message
async function clearMessages(channel) {
  // Fetch up to 100 messages
  fetched = await channel.messages.fetch({ limit: 100 });
  const botMessages = fetched.filter(msg => msg.author.id === channel.client.user.id);

  // Bulk delete messages (must be under 14 days old)
  await channel.bulkDelete(botMessages);

  console.log(`Deleted ${fetched.size} messages`);
}

async function checkServerStatuses() {
  try {

    ports.forEach(port => {
		const socket = new net.Socket();
		socket.setTimeout(3000);

		socket.on('connect', () => {
			port.currentStatus = "🟢"
			console.log(`Connected to ${host}:${port.portNumber}`);
			socket.destroy();
		});

		socket.on('timeout', () => {
			port.currentStatus = "🔴"
			console.log(`Timeout on ${host}:${port.portNumber}`);
			socket.destroy();
		});

		socket.on('error', (err) => {
			console.log(`Failed to connect to ${host}:${port.portNumber} - ${err.message}`);
		});

		socket.connect(port.portNumber, host);
	});
    
    // Wait 10 seconds before next run
    await wait(10000);
	
	const channel = client.channels.cache.get(channelId);
	let updateFound = false; 

    if (channel) {
	  ports.forEach(port => {
		if(port.pastStatus != port.currentStatus){ 
			updateFound = true; 
			let unixTimestamp = Math.floor(Date.now() / 1000);
			let discordTimeStamp = "<t:" + unixTimestamp + ":R>"
			port.messageDisplay = "⚠️ " + port.serverName + " status changed to " + port.currentStatus + " at " + discordTimeStamp;
		}
		port.pastStatus = port.currentStatus; 
	  });
	}

	if(updateFound) { 
		try {
    		await clearMessages(channel);
      		 ports.forEach(port => {
				channel.send(port.messageDisplay);
			})
    	} catch (error) {
      		console.error(error);
      		message.channel.send('Failed to clear messages.');
    	}
	}
    checkServerStatuses();
  } catch (error) {
		console.error('Error in checking server status:', error);
		await wait(10000);
		checkServerStatuses();
  }
}



client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

// Log in to Discord with your client's token
client.login(token);