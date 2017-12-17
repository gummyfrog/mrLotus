const fs = require('fs');
const Discord = require('discord.js');


// single notify functions

exports.newNotify = function (args, userID) {
  console.log('Notifier reporting, your wish is my command...');
  fs.appendFileSync('./notifyUsers/' + args, userID + ',');
};

exports.newNotifyChannel = function (args, channelID, guildID) {
  console.log('Notifier reporting, your wish is my command...');
  fs.appendFileSync('./notifyChannels/' + args, channelID + '|' + guildID + ',');
};


// alreadyNotifying functions


exports.alreadyNotifyingUser = function (args, userID) {
  var returnBool = false;

  if(fs.existsSync('./notifyUsers/' + args)) {

    var data = fs.readFileSync('./notifyUsers/' + args, 'utf8');

    if(data != null) {
      data = data.split(',')

      for(i=0;i<data.length;i++) {
        if(data[i] == userID) {
          returnBool = true;
          break;
        }
      }


    }
  }

  return returnBool;

};

exports.alreadyNotifyingChannel = function (args, channelID) {
  var returnBool = false;
  console.log('Checking... ./notifyChannels/' + args);

  if(fs.existsSync('./notifyChannels/' + args)) {
    console.log('Exists...')
    var data = fs.readFileSync('./notifyChannels/' + args, 'utf8');

    console.log(data);
    if(data != null) {
      data = data.split(',')

      for(i=0;i<data.length;i++) {
        var channelAndGuild = data[i].split('|');
        console.log(channelAndGuild);
        if(channelAndGuild[0] == channelID) {
          returnBool = true;
          break;

        }
      }


    }
  }

  return returnBool;

};

// send what you are notifying a user or channel about

exports.notifyingUserAbout = function(userID, message) {
  var things = [];

  fs.readdir('./notifyUsers', function ( err, files) {
    if(err) {
    }
    files.forEach( function (file, index) {
      console.log('EACH');
      var data = fs.readFileSync('./notifyUsers/' + file, 'utf8');

      if(data.includes(userID)) {
        things.push(file);
        last = file;
      } else {
      }

    });

    console.log('Going');
    if(things.length == 0) {
      message.author.send("You're not being notified about anything... Yet.");
    } else {
      message.author.send("You're on these lists right now: " + things.join(' - ').toUpperCase());
    }
  });

}


exports.notifyingChannelAbout = function(channelID, guildID, message) {
  var things = [];
  var id = channelID + '|' + guildID;

  fs.readdir('./notifyChannels', function ( err, files) {
    if(err) {
    }
    files.forEach( function (file, index) {
      console.log('EACH');
      var data = fs.readFileSync('./notifyChannels/' + file, 'utf8');

      if(data.includes(id)) {
        things.push(file);
        last = file;
      } else {
      }

    });

    console.log('Going');
    if(things.length == 0) {
      message.channel.send("This channel isn't being notified about anything... Yet.");
    } else {
      message.channel.send("This channel is on these lists right now: " + things.join(' - ').toUpperCase());
    }
  });

}



// remove channels functions

exports.deleteLeavingChannels = function(guildID) {

  fs.readdir('./notifyChannels', function ( err, files) {
    if(err) {
      console.log("Sorry, I couldn't get the directory. ", err );
      process.exit( 1 );
    }

    files.forEach( function (file, index) {

      if(file != '.DS_Store') {

        console.log("\nNow Reading File: '" + file + "' ::'");
        var data = fs.readFileSync('./notifyChannels/' + file, 'utf8').split(',');
        var leftUsers = [];


        data.forEach( function (notifyUser, index) {
          guildAndUser = notifyUser.split('|');
          if(guildAndUser[1] == guildID) {
            leftUsers.push(notifyUser);
          }
        })

        console.log('Removing members of ' + guildID + ' ::');
        for(i=0;i<leftUsers.length;i++) {
          console.log("   " + leftUsers[i]);
          data.splice(data.indexOf(leftUsers[i]), 1)
        }


        if(data.length <= 1) {
          fs.unlink('./notifyChannels/' + file, function(err) {
             if(err) {
               console.log('Error unlinking file. Please check ' + file + '.', err);
             }
           });

          console.log('Removed all users in that file, now gone.');
        } else if (data.length > 1) {
          fs.writeFileSync('./notifyChannels/' + file, data.join(',') );
          console.log('Rewriting notification file...')
        }


      }


    })


  })

}

exports.stopNotifyingUser = function (args, userID) {


  var data = fs.readFileSync('./notifyUsers/' + args.toLowerCase(), 'utf8').split(',');
  console.log(data.length);

  data.splice(data.indexOf(userID), 1);

  console.log(data.length);
  if(data.length == 1) {
    fs.unlink('./notifyUsers/' + args.toLowerCase());
    console.log('File is empty. Cleaning up.');
  } else {
    fs.writeFileSync('./notifyUsers/' + args.toLowerCase(), data.join(','));
  }

}

exports.stopNotifyingChannel = function (args, channelID, guildID) {

  var lookFor = channelID + '|' + guildID;

  var data = fs.readFileSync('./notifyChannels/' + args.toLowerCase(), 'utf8').split(',');
  data.splice(data.indexOf(lookFor), 1);

  if(data.length == 1) {
    fs.unlink('./notifyChannels/' + args.toLowerCase());
    console.log('File is empty. Cleaning up.');
  } else {
    fs.writeFileSync('./notifyChannels/' + args.toLowerCase(), data.join(','));
  }

}
