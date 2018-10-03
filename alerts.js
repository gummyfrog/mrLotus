const latest = require('latest-tweets');
const json = require('jsonfile');
const moment = require('moment');
moment().format();

const datPath = "./storage/notification_sites.json";
const alertsPath = "./storage/alerts.json";

const lotus = require('./lotus.js');

var dat = json.readFileSync(datPath);
var storedAlerts = json.readFileSync(alertsPath);


function alertObj(data) {
	var split = data.split('-');
	var rewards = '';

	var exp = moment().add(parseInt(split[1].substr(0, 3)), 'm')

	for(i=2;i<split.length;i++) {
		rewards += (`\n+ _${split[i].trim()}_`);
	}

	return {
		"where":split[0].trim(),
		"exp": exp,
		"rewards": rewards
	}
}

function invoiceInfo(type, message, filter) {

	var guild = message.guild.id;
	var dest;

	if(type == 'channel') {
		dest = message.channel.id;
	} else {
		dest = message.author.id;
	}

	var sign = type+dest+guild+filter.join('-');
	var loc = type+dest+guild;

	return ({
		'type': type,
		'dest': dest,
		'guild': guild,
		'filt': filter,
		'sign': type+dest+guild+filter.join('-'),
		'loc': type+dest+guild
	})
}



// site management

exports.newSite = function(type, message, filter) {

	var matching = exists(type, message, filter);

	if(matching != false) {
		lotus.send('Already a request like that for this channel.');
		return;
	}

	var invoice = invoiceInfo(type, message, filter);

	dat.sites.push(invoice);
	lotus.send('Okay!');
	update();
}

exports.removeSite = function(type, message, filter) {

	var matching = exists(type, message, filter);

	if(matching != false) {
		// !!!! 			if there are multiple, ask to choose! 				!!!!
		dat.sites.splice(dat.sites.indexOf(matching[0]), 1);
		lotus.send('Okay.');
	} else {
		lotus.send('No requests like that found.');
	}
}


// site exists?


function exists(type, message, filter, loc) {
	var matching = [];

	var template = invoiceInfo(type, message, filter)

	for(i=0;i<dat.sites.length;i++) {
		var found = dat.sites[i];

		if(loc) {
			if(found.loc == template.loc) {
				matching.push(dat.sites[i]);
			}
		} else {
			if(found.sign == template.sign) {
				matching.push(dat.sites[i]);
			}
		}
	}

	if(matching.length > 0) {
		return matching;
	} else {
		return false;
	}
}


exports.sites = function(type, message) {
	var matching = exists(type, message, [], true);

	console.log(matching)

	if(matching.length > 0) {
		lotus.send(richInvoices(matching));
	}
}


// looping function

exports.watchAlerts = function(client) {
	console.log('watching...');
	latest('warframeAlerts', function (err, tweets) {
		// var alert = tweets[0].content;
		var alert = "Erpo (Earth): Enemy Escorts Located - 1m - 3500cr"

		if(alert != storedAlerts.last_recieved && !alert.includes('Invasion') && !alert.includes('Sortie') ) {
			storedAlerts.last_recieved = alert;

			for(q=0;q<dat.sites.length;q++) {
				if(dat.sites[q].filt.some(val => alert.toLowerCase().includes(val))) {
					ship(alert, dat.sites[q], client)
				}
			}
			
			addAlert(alert);
			updateAlerts();
		}
	});
}



// ship to

function ship(alertData, invoice, client) {
	var toRemove = [];

	var guild = client.guilds.find(val => val.id == invoice.guild);
	var resolved = undefined;

	if(guild.me != undefined) {
		if(invoice.type == 'channel') {
			resolved = guild.channels.find(val => val.id == invoice.dest);
		} else {
			resolved = guild.members.find(val => val.id == invoice.dest);
		}
	}

	if(resolved == undefined) {
		// remove this invoice
		console.log(`found broken invoice! short: ${i}\nlong: ${dat.sites[i]}`);
		toRemove.push(dat.sites[i]);

	} else {
		resolved.send(richAlertEmbed(alertData));
	}


	for(x=0;x<toRemove.length;x++) {
		console.log('removing invalids');
		dat.sites.splice(dat.sites.indexOf(toRemove[x]), 1);
	}
}


function addAlert(alert) {
	var obj = alertObj(alert);
	storedAlerts.active.push(obj);
}


exports.activeAlerts = function() {

	var obj = {
	  "embed": {
	    "color": 3179153,
	    "author": {
	      "name": "Active Alerts:"
	    },
	    "fields":[]
	  }
	}


	var toRemove = [];

	for(i=0;i<storedAlerts.active.length;i++) {
		console.log(i);
		var alert = storedAlerts.active[i];

		console.log(alert);

		if(moment().isAfter(alert.exp)) {
			toRemove.push(storedAlerts.active[i]);
		} else {
			obj.embed.fields.push({
				"name": `${alert.where}⌛${moment().to(alert.exp)}`,
				"value": `${alert.rewards}`
			})
		}
	}

	for(x=0;x<toRemove.length;x++) {
		console.log("Removing " + toRemove.length + " alerts")
		storedAlerts.active.splice(storedAlerts.active.indexOf(toRemove[x]), 1);
	}

	if(toRemove.length > 0) {
		updateAlerts();
	}

	lotus.send(obj);

}



// display nicely

function richAlertEmbed(data) {
	var alert = alertObj(data);

	console.log(alert);

	var obj = {
	  "embed": {
	    "color": 3179153,
	    "author": {
	      "name": "A new time-limited mission is available!"
	    },
	    "fields":[{
	    	"name": `${alert.where}⌛${moment().to(alert.exp)}`,
	    	"value": `${alert.rewards}`
	    }]
	  }
	}

	return obj;
}



function richInvoices(invoices) {
	var obj = {
	  "embed": {
	    "color": 3179153,
	    "author": {
	      "name": "Filters Located:"
	    },
	    "fields": [
	    ]
	  }
	}

	for(i=0;i<invoices.length;i++) {
		var invoice = invoices[i]
		console.log(invoice);

		obj.embed.fields.push({
			"name": `[ ${invoice.filt.join(', ').toUpperCase()} ]`,
			"value": '_ _'
		});
	}

	return obj;
}





function update() {
	console.log('Updating')
	console.log(dat);
	json.writeFileSync(datPath, dat);
}

function updateAlerts() {
	console.log('Updating')
	// console.log(storedAlerts);
	json.writeFileSync(alertsPath, storedAlerts)
}



