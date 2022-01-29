require('dotenv').config()
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Hypixel = require('hypixel-api-reborn');
const ytdl = require('ytdl-core');
const hypixel = new Hypixel.Client(process.env['hypixel_api_key']);
const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
  VoiceConnection,
} = require('@discordjs/voice');
const token = process.env['token']
const CLIENT_ID = process.env['client_id']
const GUILD_ID = process.env['guild_id']
const axios = require('axios');
const prefix = '-'

const express = require('express');
const server = express();
server.all('/', (req, res)=>{
    res.send('Your bot is alive!');
});
function keepAlive(){
    server.listen(process.env.PORT || 5000, ()=>{console.log("Server is Ready!")});
}
const commands = [{
  name: 'ping',
  description: 'Replies with Pong!'
}]; 

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const { DiscordTogether } = require('discord-together');

client.discordTogether = new DiscordTogether(client);
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: '922925201426120747',
		// channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
  const audioResource = createAudioResource("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", {
    inlineVolume: true
  });
  audioResource.volume.setVolume(0.5);
  const player = createAudioPlayer()
  connection.subscribe(player)
  player.play(audioResource);
  player.on('idle', () => {
    try {
      player.stop()
    } catch(e){
      console.log(e)
    }
    try {
      VoiceConnection.destroy()
    } catch (e) {
      connectToChannel(channel)
    }
  })
}
const queue = new Map();
client.on('messageCreate', async (message) => {
  if(message.content.startsWith(prefix)){
    const serverQueue = queue.get(message.guild.id);
    let command = message.content.substring(1);
    let args = command.split(' ');
    let cmd = args[0].toLowerCase();
    if(cmd === 'ping'){
      axios.get('https://mcapi.us/server/status?ip=play.ethereal-mc.net')
      .then(function (response) {
        response = response.data
        if(response.status){
          if(response.status === 'success'){
            if(response.online){
              message.reply({
                content: `Ethereal MC is online. Current players: ${response.players.now}`
              })
            } else {
              message.reply({
                content: `Ethereal MC is offline. Error: ${message.error}`
              })
            }
          } else {
            message.reply({
              content: `Ethereal MC is offline. Error: ${message.error}`
            })
          }
        }
      }).catch(error => {
        console.log(error)
      })
    }
    if(cmd === 'create-role'){
      if(args.length > 1){
        message.guild.roles.create({
          name: args[1],
          color: args[2],
          reason: 'Woop',
        }).then(role => {
          message.mentions.members.forEach(member => {
            member.roles.add(role)
          })
          message.reply({
            content: 'Role created and assigned!'
          })
        }).catch(console.log('Error creating role'))
      } else {
        message.reply({
          content: 'Not enough arguments. Usage: `-create-role <role name> <role color> @mention1 @mention2 @mention3...`'
        })
      }
    }
    if(cmd === 'stats-fortnite'){
      if(args.length > 1){
        let config = {
          headers: {
            Authorization: process.env.fortnite_api_key
          }
        }
        let username = ''
        for(let i = 1; i < args.length; i++){
          //join args with a space except for the first one
          username += args[i]
        }
        let reply = ''
        let promises = []
        promises.push(axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${username}&accountType=epic`, config))
        promises.push(axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${username}&accountType=psn`, config))
        promises.push(axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${username}&accountType=xbl`, config))

        Promise.allSettled(promises).then((results) => {
          results.forEach((result) => {
            console.log(result)
            try{
              if(result.status === 'fulfilled'){
                let response =  result.value.data.data
                let accType = ''
                if(result.value.config.url.includes('accountType=xbl')){
                  accType = 'Xbox'
                }
                if(result.value.config.url.includes('accountType=psn')){
                  accType = 'Playstation'
                }
                if(result.value.config.url.includes('accountType=epic')){
                  accType = 'Epic'
                }
  
                reply += `\n---------------------**Player Info (${accType})**---------------------\n`
                reply += `**Name **:${response.account.name}\n`
                reply += `**ID **:${response.account.id}\n`
                reply += `**Battlepass level:**: ${response.battlePass.level}\n`
                reply += `**Match stats**:\n`
                reply += `--------------------------**Overall**------------------------\n`
                reply += `**Wins**: ${response.stats.all.overall.wins}\n`
                reply += `**Top 3**: ${response.stats.all.overall.top3}\n`
                reply += `**Top 5**: ${response.stats.all.overall.top5}\n`
                reply += `**Kills**: ${response.stats.all.overall.kills}\n`
                reply += `**Kills Per Match**: ${response.stats.all.overall.killsPerMatch}\n`
                reply += `**Deaths**: ${response.stats.all.overall.deaths}\n`
                reply += `**Win Rate**: ${response.stats.all.overall.winRate}\n`
                reply += `**Time played**: ${response.stats.all.overall.minutesPlayed} minutes\n`
                reply += '----------------------------------------------------------------'
              }
            } catch(error) {
              console.log(error)
            }
          })
          if(reply === ''){
            message.reply({
              content: 'No stats found for that username.'
            })
          } else {
            message.reply({
              content: reply
            })
          }
        })
      } else {
        message.reply({
          content: 'Not enough arguments. Usage: `-stats-fortnite <account name>`'
        })
      }
    }
    if(cmd === 'random'){
      let defaultFrom = 1
      let defaultTo = 100
      if(args.length === 1){
        message.reply({
          content: `Random number between ${defaultFrom} and ${defaultTo}: ${Number(Math.floor(Math.random() * defaultTo)) + Number(defaultFrom) }`
        })
      }
      else if(args.length === 2){
        //should check if args[1] is a number but w/e
        message.reply({
          content: `Random number between ${defaultFrom} and ${args[1]}: ${Number(Math.floor(Math.random() * args[1])) + Number(defaultFrom)}`
        })
      }
      else if(args.length === 3){
        //should check if args[1] is a number but w/e
        message.reply({
          content: `Random number between ${args[1]} and ${args[2]}: ${Number(Math.floor(Math.random() * args[2])) + Number(args[1])}`
        })
      }
      else {
        message.reply({
          content: 'Too many arguments. Usage: `-random [<from>] [<to>]`'
        })
      }
    }
    if(cmd === 'join'){
      const channel = message.member.voice.channel;
      if (channel) {
        try {
          const connection = await connectToChannel(channel);
          connection.subscribe(player);
          message.reply({
            content: `Joined ${channel.name}`
          })
        } catch (error) {
          console.error(error);
        }
      } else {
        message.reply({
          content: 'Join a voice channel then try again!'
        });
      }
    }
    if(cmd === 'play'){
      if(args.length > 1){
        const channel = message.member.voice.channel;
        if(channel){
          let songQuery = ''
          for(let i = 1; i < args.length; i++){
            //join args with a space except for the first one
            songQuery += args[i] + ' '
          }
          
          const songInfo = await ytdl.getInfo(songQuery);
          const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
          }
          if (!serverQueue) {
            const queueContruct = {
              textChannel: message.channel,
              voiceChannel: voiceChannel,
              connection: null,
              songs: [],
              volume: 5,
              playing: true
            };
        
            queue.set(message.guild.id, queueContruct);
        
            queueContruct.songs.push(song);
        
            try {
              const connection = await connectToChannel(channel);
              connection.subscribe(player);
              queueContruct.connection = connection;
              play(message.guild, queueContruct.songs[0]);
            } catch (err) {
              console.log(err);
              queue.delete(message.guild.id);
              return message.channel.send(err);
            }
          }else {
           serverQueue.songs.push(song);
           console.log(serverQueue.songs);
           message.reply({
            content: `Added ${song.title} to the queue!`
           });
          }

        } else {
          message.reply({
            content: 'Join a voice channel then try again!'
          });
        }
      }
    }
    if(cmd === 'leave'){
      const channel = message.member.voice.channel;
      if (channel) {
        try {
          message.member.voice.channel.leave()
          message.reply({
            content: `Left ${channel.name}`
          })
        } catch (error) {
          console.error(error);
        }
      } else {
        message.reply({
          content: 'Join a voice channel then try again!'
        });
      }
    }
    if(cmd === 'assign-role'){
      if(args.length > 1){
        let role = message.guild.roles.find(role => role.name === args[1])
        if(role){
          message.mentions.members.forEach(member => {
            member.roles.add(role)
          })
          message.reply({
            content: 'Added role to mentioned members.'
          })
        } else {
          message.reply({
            content: 'No role with that name found. Try again.'
          });
        }
      } else {
        message.reply({
          content: 'Missing arguments. Usage: `-assign-role <role name> @<user>`'
        });
      }
    }
    if(cmd === 'unassign-role'){
      if(args.length > 1){
        let role = message.guild.roles.find(role => role.name === args[1])
        if(role){
          message.mentions.members.forEach(member => {
            member.roles.remove(role)
          })
          message.reply({
            content: 'Removed role from mentioned members.'
          })
        } else {
          message.reply({
            content: 'No role with that name found. Try again.'
          });
        }
      } else {
        message.reply({
          content: 'Missing arguments. Usage: `-unassign-role <role name> @<user>`'
        });
      }
    }
    if(cmd === 'together-list'){
      message.reply({
        content: 'Available together argument: youtube, poker, chess, checkers, betrayal, fishing, lettertile, lettertile, doodlecrew, spellcast, awkword, puttparty'
      })
    }
    if(cmd === 'together'){
      if(message.member.voice.channel) {
        if(args.length > 1){
          client.discordTogether.createTogetherCode(message.member.voice.channel.id, args[1]).then(async invite => {
            return message.channel.send(`Please click on the blue link: ${invite.code}.`);
          });
        } else {
          message.reply({
            content: 'Not enough arguments. Usage: -together <activity name>. Available activities: youtube, poker, chess, checkers, betrayal, fishing, lettertile, lettertile, doodlecrew, spellcast, awkword, puttparty'
          })
        }
      } else {
        message.reply({
          content: 'Join a voice channel then try again!'
        });
      }
    }
    if(cmd === 'stats-hypixel'){
      if(args.length > 1){
        hypixel.getPlayer(args[1]).then(player => {
          let reply = ''
          reply += `\n---------------------**Player Info**---------------------\n`
          reply += `**Name **:${player.nickname}\n`
          reply += `**Rank **:${player.rank}\n`
          reply += `\n---------------------**Stats (Skywars)**---------------------\n`
          reply += `**Wins **:${player.stats.skywars.wins}\n`
          reply += `**Losses **:${player.stats.skywars.losses}\n`
          reply += `**Kills **:${player.stats.skywars.kills}\n`
          reply += `**Levels **:${player.stats.skywars.level}\n`
          reply += `**Coins **:${player.stats.skywars.coins}\n`
          reply += `\n---------------------**Stats (Bedwars)**---------------------\n`
          reply += `**Wins **:${player.stats.bedwars.wins}\n`
          reply += `**Losses **:${player.stats.bedwars.losses}\n`
          reply += `**Kills **:${player.stats.bedwars.kills}\n`
          reply += `**Coins **:${player.stats.bedwars.coins}\n`
          reply += `**Bed destroyed **:${player.stats.bedwars.beds.broken}\n`
          reply += `\n---------------------**Stats (Build battle)**---------------------\n`
          reply += `**Wins **:${player.stats.buildbattle.totalWins}\n`
          reply += `**Games played **:${player.stats.buildbattle.playedGames}\n`
          // console.log(player)
          message.reply({
            content: reply
          })
          // console.log(player.level); // 141

        }).catch(e => {
          message.reply({
            content: 'No stats found for that username.'
          })
        });
      } else {
        message.reply({
          content: 'Not enough arguments. Usage: `-stats-hypixel <username>`'
        })
      }
    }
  }
});

keepAlive();
client.login(token);