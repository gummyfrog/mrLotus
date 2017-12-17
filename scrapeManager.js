var scrapeIt = require('scrape-it');
const Discord = require('discord.js');



String.prototype.toProperCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};





exports.returnScrape = function(args, message, type) {


  		message.delete().catch(O_o=>{});

  		var formatArgs = args.toProperCase().replace(/ /g, '_');

  		formatArgs = formatArgs.replace('Of', 'of')

  		if (formatArgs.split('_')[0] == "Emp") {
  				console.log('emp');
  				formatArgs = formatArgs.replace('Emp', 'EMP');
  		}

  		if (formatArgs.includes('Medi-pet')) {
  			formatArgs = formatArgs.replace('pet', 'Pet');
  		}

      console.log('Scraping ' + 'http://warframe.wikia.com/wiki/' + formatArgs);

      const embed = new Discord.RichEmbed()
      .setColor(0x00AE86);

      const dropEmbed = new Discord.RichEmbed()
      .setColor(0x00AE86);

  		scrapeIt('http://warframe.wikia.com/wiki/' + formatArgs, {
  			title: ".pi-title > span:nth-child(1)",
        description: ".codexflower",
        otherDescription: ".mw-content-text > p:nth-child(2)",

  			rarity: "div.pi-item:nth-child(3)",
  			droppedBy: ".mw-content-text > div.tooltip-content.Infobox_Parent > aside > section > div:nth-child(5) > div",


				isWarframe: ".mw-content-text > div:nth-child(1)",

        itemImg: {
          selector: ".floatnone > a:nth-child(1) > img:nth-child(1)",
          attr: "data-src"
        },

        otherImg: {
          selector: ".pi-image-thumbnail",
          attr: "src"
        },

        // general


        div1: ".portable-infobox > div:nth-child(4)",
        div2: ".portable-infobox > div:nth-child(5)",
        div3: ".portable-infobox > div:nth-child(6)",

        // melee
        div4: "section.pi-item:nth-child(7) > div:nth-child(2)",
        div5: "section.pi-item:nth-child(7) > div:nth-child(3)",
        div6: "section.pi-item:nth-child(8) > div:nth-child(3)",

        // shared // total damage
        div7: "section.pi-item:nth-child(8) > div:nth-child(4)",
        div8: "section.pi-item:nth-child(8) > div:nth-child(5)",
        div9: "section.pi-item:nth-child(8) > div:nth-child(6)",

        // guns
        div13: "section.pi-item:nth-child(8) > div:nth-child(7)",
        div14: "section.pi-item:nth-child(8) > div:nth-child(8)",
        div15: "section.pi-item:nth-child(9) > div:nth-child(3)",

        // for bolts!
        div16: "section.pi-item:nth-child(9) > div:nth-child(2)",

				// for warfarmes
				div17: ".portable-infobox > div:nth-child(7)",
				div18: ".portable-infobox > div:nth-child(8)",


				// for mods
        modRarity: "div.pi-item:nth-child(3)",
        modTax: "div.pi-item:nth-child(4)",

        polarityTitle: "div.pi-item:nth-child(2)",
        polarityImg: {
          selector: "div.pi-item:nth-child(2) > div:nth-child(2) > a:nth-child(1) > img:nth-child(1)",
          attr: "alt"
        }


  		}).then(page => {
  			const formatText = (page.title.split('\n'))
  			const formatDrops = (page.droppedBy.split(')'))
  			const formattedDrops = (formatDrops.join('\n').toString().replace('Enemies:', '\n`--Enemies:`\n').replace('Other:', '\n`--Other:`\n').replace('Missions:', '`\n--Missions:`\n').replace(/\(|\)/g, ""));

				if(page.description == '') {
					message.channel.send("There doesn't seem to be anything by that name, Tenno.");
					return;
				}
				console.log(page);


				var trueDescription = '';


				for(var i=0; i<page.description.length;i++) {
					var append = true;

    			if (page.description[i] === ".") {
						if(page.description[i+1] != ' ') {
							append = false;
						}
					}

					if(append) {
						trueDescription += page.description[i]
					} else {
						//nada
						trueDescription += '.';
						break;
					}

				};

        var description = '';

        if(page.description != '' && page.isWarframe == '') {
          description += 'Codex: *"' + page.description.split('\n')[0] + '"*\n';
        } else if(page.isWarframe != '') {
					description += '*' + trueDescription + '*';
				}

        if(page.otherDescription != '') {
          description += '*"' + page.otherDescription + '"*';
        }




        embed.addField(formatArgs, description)

        if(page.itemImg != '') {
          embed.setThumbnail(page.itemImg);
        }


        var titles = [];
        var values = [];

        var divs = [];

        var info = [];
        var otherInfo = [];

        var infoString = '';

        for(var key in page) {
          if(key.includes('div') && page[key] != '') {
            var info = page[key].split('\n\t\n\t');
            titles.push(info[0]);
            values.push(info[1]);

          } else if(key.includes('polarity') && page[key] != '' && page.polarityTitle == 'Polarity'){
            if(key.includes('Title')) {
              titles.push(page[key]);
            } else {
              values.push(page[key]);
            }
          } else if(key.includes('mod') && page[key] != '' && page.polarityTitle == 'Polarity'){

            var info = page[key].split('\n\t\n\t');
            titles.push(info[0]);
            values.push(info[1]);

          } else {
            otherInfo.push(page[key]);
          }

        }

				console.log(page.title);



        for(i=0;i<titles.length;i++) {
          info.push({title: titles[i], value: values[i]});
          infoString += titles[i].replace(/(\r\n|\n|\r)/gm,"") + ':    `' + values[i] + '`\n';
          //embed.addField(titles[i].replace(/(\r\n|\n|\r)/gm,""), values[i]);
        }

        console.log(values);
        embed.addField('Info', infoString);


        if(page.droppedBy != '') {
          embed.addField('`Find it from:`', formattedDrops);
        }



        embed.addField('Wiki:', 'http://warframe.wikia.com/wiki/' + formatArgs);
        message.channel.send({embed});


  		});

}
