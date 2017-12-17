# Mr. Lotus
A Warframe bot for the modern age.


## What is Mr. Lotus?
Mr. Lotus is a Warframe bot that lets you get in-game information straight from Discord.

Mr. Lotus can notify you and your server's channels about specific alerts, and get info from the Wiki.

### Alert Management: 

active
###### Returns all active alerts, and how much time is left before they end.
  
  
alertme _arg_
###### Mr. Lotus will notify you about alerts for _arg_
  
  
alertchannel _arg_
###### Mr. Lotus will notify this channel about alerts for _arg_
  
### Wiki Scraping Commands:
This feature is still in beta.

stats _arg_
###### Returns info about _arg_ from the Wiki.

---
  
## What happened to the old Mr. Lotus?

When I made Mr. Lotus, I had intended for him to stay on a small number of servers. Now that a bunch of you are using him, I think you guys deserve an actual functioning bot. I've completely rewritten Mr. Lotus from scratch. 
Most of the improvements are with how Mr. Lotus handles alerts, but you won't notice those if you haven't seen old Lotus. 
Now, I'm confident enough to make Mr. Lotus open source, and hopefully have talented members of the Warframe community help make Mr. Lotus even better. Please don't publicly execute me for my thread blocking.

Lots of love,
-gummyfrog

## How should I prepare for the update?

Unfortunately, you'll have to redo all of your alert settings, as Mr. Lotus's storage system has completely changed.
Other than that you should be good to go.

## What else can I look forward to in the update?

Mr. Lotus now uses rich embeds, which make the messages he sends look super pretty.
You can also look forward to reporting any bugs you find, which there are hopefully not many of.


## All Commands

> All of these are prefixed with .lotus 

> .lotus alertme ferrite

#### alertme _arg_
#### alertchannel _arg_

#### stopalertme _arg_
#### stopalertchannel _arg_

#### alertingme
#### alertingchannel

#### stats _arg_
#### active


## Libraries that Mr. Lotus uses

The developers of these libraries have my infinite gratitude. Without these, Mr. Lotus wouldn't be possible.

[discord.js](https://github.com/hydrabolt/discord.js)

[scrape-it](https://github.com/IonicaBizau/scrape-it)

[latest-tweets](https://github.com/noffle/latest-tweets)

## To-Do

- [ ] Handle Invasions
- [ ] Clean Webscraping
- [ ] Don't block threads
- [ ] Push this
- [ ] Success
