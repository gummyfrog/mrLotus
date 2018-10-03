const Discord = require('discord.js');
const json = require('jsonfile');
const client = new Discord.Client();
const prefix = "!"

const config = json.readFileSync('../codes/lotus/code.json');
const alerts = require('./alerts.js');

const help = {
  "embed": {
  	"color": 3179153,
    "description": `Thank you for using Mr. Lotus. The prefix is ${prefix}.`,
    "fields": [
      {
        "name": "help",
        "value": "Sends you this message."
      },
      {
        "name": "alert [ me, channel ] { args }",
        "value": "Tells Lotus to forward alerts containing at least one { args } to you or a channel."
      },
      {
        "name": "stopalert [ me, channel] { args }",
        "value": "Tells Lotus to stop forwarding alerts."
      },
      {
        "name": "alerts [ me, channel ]",
        "value": "Tells you what alerts Lotus is forwarding to you or a channel."
      },
      {
        "name": "active",
        "value": "Shows the active alerts."
      }
    ]
  }
}


var lastCommandChannel;

exports.send = function(what) {
	lastCommandChannel.send(what);
}

client.on('ready', () => {
	console.log('I am ready!');
});

client.on('guildDelete', (leavingGuild) => {
	console.log("I'm leaving the guild " + leavingGuild.name + '!');
});


client.on('message', message => {
	if(message.channel.type == "dm" || message.author.bot || message.content.substr(0, prefix.length) != prefix) {
		return;
	}

	var args = message.content.substr(prefix.length).toLowerCase().split(' ');
	var command = args[0];

	args.splice(0, 1);
	var altArgs = args.slice(1);

	lastCommandChannel = message.channel;

	if(command == 'help') {
		message.author.send(help);
	}


	if(command == 'alert') {
		if(args[0] == 'me') {
			alerts.newSite('user', message, altArgs);
		} else if (args[0] == 'channel') {
			alerts.newSite('channel', message, altArgs);
		}
	}

	if(command == 'stopalert') {
		if(args[0] == 'me') {
			alerts.removeSite('user', message, altArgs);
		} else if (args[0] == 'channel') {
			alerts.removeSite('channel', message, altArgs);
		}
	}

	if(command == 'alerts') {
		if(args[0] == 'me') {
			alerts.sites('user', message);
		} else if (args[0] == 'channel') {
			alerts.sites('channel', message);
		}
	}


	// break

	if(command == 'ship') {
		alerts.watchAlerts(client);
	}

	if(command == 'active') {
		alerts.activeAlerts();
	}


});

setInterval(function() {alerts.watchAlerts(client)}, 12 * 1000);

client.login(config.token);