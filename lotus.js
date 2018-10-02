const Discord = require('discord.js');
const fs = require('fs');
var configRaw = fs.readFileSync("../codes/lotus/code.json");
const config = JSON.parse(configRaw);

const userManager = require('./notifierDelegate.js');
// notifier manages all of the users that need to be notified.
// userbase manager



const alertsDelegate = require('./alertsDelegate.js');
// checks for alerts and alerts users


const scrapeManager = require('./scrapeManager.js');
// scrapes


const client = new Discord.Client();

const prefix = ".lotus ";





client.on('ready', () => {
  console.log('I am ready!');
});

client.on('guildDelete', (leavingGuild) => {
  console.log("I'm leaving the guild " + leavingGuild.name + '!');
  userManager.deleteLeavingChannels(leavingGuild.id);
});

client.on('message', message => {

  if(message.content.substring(0, prefix.length) != prefix) {
    return;
  }

  var command = message.content.split(" ")[1];
  var properArgs = message.content.substring(prefix.length + command.length + 1);
  var args = message.content.substring(prefix.length + command.length + 1).toLowerCase();
  console.log(command);
  console.log(args);



  if(command === 'alertme') {

      if(!userManager.alreadyNotifyingUser(args, message.author.id) ) {

        // user is not being notified already
        if (args == 'all') {
          // notify user about all alerts
          message.channel.send("I'll notify you about every alert, Tenno.");
        } else {
          // notify user about specific alertsDelegate
          message.channel.send("I'll notify you about alerts for <" + args.toUpperCase() + ">.");
        }

        userManager.newNotify(args, message.author.id)

      } else {
        // user is being notified already
        message.channel.send("You're already being notified about <" + args.toUpperCase() + ">, Tenno.");
      }

  };

  if(command === 'stopalertme') {

    if(userManager.alreadyNotifyingUser(args, message.author.id) ) {
      // user is being notified already

      if (args == 'all') {
        message.channel.send("I'll stop notifying you about every alert.");
      } else {
        message.channel.send("I'll stop notifying you about alerts for <" + args.toUpperCase() + ">.");
      }

      userManager.stopNotifyingUser(args, message.author.id);

    } else {
      // user is already not being notified
      message.channel.send("You're not being notified about <" + args.toUpperCase() + ">.");
    }

  }


  if(command === 'alertchannel') {

    if(message.guild == null) {
      message.channel.send('Sorry, you need to use this command in a server!');
      return;
    }

    if(!userManager.alreadyNotifyingChannel(args, message.channel.id) ) {

      // user is not being notified already
      if (args == 'all') {
        // notify user about all alerts
        message.channel.send("I'll notify this channel about every alert.");
      } else {
        // notify user about specific alertsDelegate
        message.channel.send("I'll notify this channel about alerts for <" + args.toUpperCase() + ">.");
      }

      userManager.newNotifyChannel(args, message.channel.id, message.guild.id);

    } else {
      // user is being notified already
      message.channel.send("This channel will is already being notified about <" + args.toUpperCase() + ">.");
    }

  };

  if(command === 'stopalertchannel') {

    if(message.guild == null) {
      message.channel.send('Sorry, you need to use this command in a server!');
      return;
    }

    if(userManager.alreadyNotifyingChannel(args, message.channel.id) ) {

      // user is being notified already
      if (args == 'all') {
        // stop notify user about all alerts
        message.channel.send("I'll stop notifying this channel about every alert.");
      } else {
        // notify user about specific alertsDelegate
        message.channel.send("I'll stop notifying this channel about alerts for <" + args.toUpperCase() + ">");
      }

      userManager.stopNotifyingChannel(args, message.channel.id, message.guild.id);

    } else {
      // user is being notified already
      message.channel.send("This channel isn't being notified about <" + args.toUpperCase() + ">.");
    }

  }

  if(command === 'active') {
    message.channel.send(alertsDelegate.returnActiveAlerts());
  }


  if(command === 'stats') {
    scrapeManager.returnScrape(properArgs, message)
  }


  if(command == 'alertingme') {
    userManager.notifyingUserAbout(message.author.id, message);
  }

  if(command == 'alertingchannel') {
    if(message.guild == null) {
      message.channel.send('Sorry, you need to use this command in a server!');
      return;
    }

    userManager.notifyingChannelAbout(message.channel.id, message.guild.id, message);
  }




});



client.login(config.token);

setInterval(function() { alertsDelegate.checkForAlerts(client) }, 1000 * 15 );
