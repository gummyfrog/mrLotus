const fs = require('fs');
const Discord = require('discord.js');
var latestTweets = require('latest-tweets');


// formatting functions

function secondsToTime(secs)
{
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}



function alertFormat(string) {
  var alertData = string.split('-');
  //console.log(alertData);
  alertData = alertData.join('//');
  return alertData;
}

function richAlert(alert, file) {

  const embed = new Discord.RichEmbed()
  .setColor(0x00AE86)
  .addField("```Tenno, a time-limited mission is available.```","```md\n" + alert.join('\n* -') + "```")
  .setFooter('  -  ' + file);
  return({embed});

}



// loop function
exports.checkForAlerts = function(client) {

  latestTweets('warframeAlerts', function (err, tweets) {
    var alert = alertFormat(tweets[0].content);
    var oldAlert = fs.readFileSync('./lastAlert.txt', 'utf8');
    removeAlerts();

    if(alert != oldAlert && !alert.includes('Invasion') ) {
      // new alert
      fs.writeFileSync('./lastAlert.txt', alertFormat(tweets[0].content) );

      console.log(alert);
      alertUsers( alert.split('//'), client);
      alertChannels( alert.split('//'), client);

      alertUsersAll(alert.split('//'), client);
      alertChannelsAll(alert.split('//'), client);

      addCurrentAlert( alert.split('//') );
    } else {
      // same alert
    }


  })

}




// all user functions
function alertUsersAll(alert, client) {

  if(!fs.existsSync('./notifyUsers/all', 'utf8')) {
    console.slog('notifyUsers/all does not exist')
    return;
  }

  var data = fs.readFileSync('./notifyUsers/all', 'utf8').split(',');
  if(data.length > 1) {
    for(i=0;i<data.length-1;i++) {
      var discUser = client.users.get(data[i]);
      discUser.send(richAlert(alert, 'all'));

    }
  }
}

function alertChannelsAll(alert, client) {

  if(!fs.existsSync('./notifyChannels/all', 'utf8')) {
    console.log('notifyChannel/all does not exist')
    return;
  }

  var data = fs.readFileSync('./notifyChannels/all', 'utf8').split(',');
  if(data.length > 1) {
    for(i=0;i<data.length-1;i++) {
      var channelAndGuild = data[i].split('|');
      var channel = client.channels.get(channelAndGuild[0]);
      channel.send(richAlert(alert, 'all'));

    }
  }
}




// single user functions

function alertUsers(alert, client) {

  fs.readdir('./notifyUsers', function ( err, files) {
    if(err) {
      console.log("Sorry, I couldn't get the directory. ", err );
      process.exit( 1 );
    }

    files.forEach( function(file, index) {
      if(alert[alert.length-1].toLowerCase().includes(file.toLowerCase()) ) {

        var users = fs.readFileSync('./notifyUsers/' + file, 'utf8').split(',');

        // users.length-1 to ignore the empty item at end
        for(i=0;i<users.length-1;i++) {
          // get the user
          console.log('Messaging user...');
          var discUser = client.users.get(users[i]);
          console.log(discUser.username);

          // send the message
          discUser.send(richAlert(alert, file));



        }
      } else {

      }
    });

  });
}

function alertChannels(alert, client) {

  fs.readdir('./notifyChannels', function ( err, files) {
    if(err) {
      console.log("Sorry, I couldn't get the directory. ", err );
      process.exit( 1 );
    }

    files.forEach( function(file, index) {
      if(alert[alert.length-1].toLowerCase().includes(file.toLowerCase()) ) {

        var channels = fs.readFileSync('./notifyChannels/' + file, 'utf8').split(',');



        // channel.length-1 to ignore the empty item at end
        for(i=0;i<channels.length-1;i++) {
          // get the channel and guild
          var channelData = channels[i].split('|');
          var channel = client.channels.get(channelData[0]);
          var guild = client.guilds.get(channelData[1]);
          console.log('Messaging ' + channelData[0] + ' in ' + guild.name);

          channel.send(richAlert(alert, file));

        }
      } else {

      }
    });

  });
}



// active alert functions

addCurrentAlert = function(alert) {
  // time should be alert[1]
  console.log('alert1')

  alert[1] = alert[1].replace(/\s/g, '');

  var timeRemaining = alert[1].substr(0, alert[1].length -1);

  alert.splice(1, 1);
  var alertData = alert;

  var endTime = addMinutes(new Date(), parseInt(timeRemaining));

  console.log(alertData);
  console.log(timeRemaining);
  var endsAt = (endTime.getHours() + ':' + endTime.getMinutes());

  fs.appendFileSync('./currentAlerts.txt', alertData.join('-') + '|' + endsAt + '\n')

}

function removeAlerts() {

  var data = fs.readFileSync('./currentAlerts.txt', 'utf8').split('\n');
  var endingAlerts = [];
  var currentHour = new Date().getHours();
  var currentMinutes = new Date().getMinutes();

  for(i=0;i<data.length-1;i++) {
    //console.log('\nAlert ' + i)
    var info = data[i].split('|');
    var timeData = info[1].split(':');

    //console.log('It is:   ' + currentHour + ' // ' + currentMinutes);
    //console.log('Ends at: ' + timeData[0] + ' // ' + timeData[1]);

    if(timeData[0] == currentHour && timeData[1] == currentMinutes) {
      endingAlerts.push(data[i]);
    }

  }

  for(i=0;i<endingAlerts.length;i++) {
    data.splice(data.indexOf(endingAlerts[i]), 1);
  }


  fs.writeFileSync('./currentAlerts.txt', data.join('\n') );

}

exports.returnActiveAlerts = function() {

  const embed = new Discord.RichEmbed()
  .setColor(0x00AE86)
  .setTimestamp()

  var data = fs.readFileSync('./currentAlerts.txt', 'utf8').split('\n');
  var currentTime = new Date();

  for(i=0;i<data.length-1;i++) {
    var info = data[i].split('|');
    var timeData = info[1].split(':');
    var endTime = new Date();

    endTime.setHours(timeData[0]);
    endTime.setMinutes(timeData[1]);

    var endsInObj = ( secondsToTime((endTime.getTime() - currentTime.getTime()) / 1000) );

    embed.addField('```' + info[0] + '```', ("```md\n<" + endsInObj.h + 'h : ' + endsInObj.m + 'm>```\n') )
  }

  return({ embed });

}
