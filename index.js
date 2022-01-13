require('dotenv').config()
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
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
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', (message) => {
  if(message.content.startsWith(prefix)){
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
        let reply = ''
        axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${args[1]}&accountType=epic`, config).then(function(response) {
          if(response.status === 200){
            response = response.data.data
            reply += "---------------------**Player Info (Epic)**---------------------\n"
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
            message.reply({
              content: reply
            })
          }
        }).catch(error => {
          axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${args[1]}&accountType=psn`, config).then(function(response) {
            if(response.status === 200){
              response = response.data.data
              reply += "---------------------**Player Info (Playstation Network)**---------------------\n"
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
              message.reply({
                content: reply
              })
            }
          }).catch(error => {
            axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${args[1]}&accountType=xbl`, config).then(function(response) {
              if(response.status === 200){
                response = response.data.data
                reply += "---------------------**Player Info (Xbox)**---------------------\n"
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
              if(reply !== ''){
                message.reply({
                  content: reply
                })
              } else {
                message.reply({
                  content: 'Player not found'
                })
              }
            }).catch(error => {
              message.reply({
                content: 'Player not found'
              })
            })
          })
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
          content: `Random number between ${defaultFrom} and ${defaultTo}: ${Math.floor(Math.random() * defaultTo) + defaultFrom}`
        })
      }
      else if(args.length === 2){
        //should check if args[1] is a number but w/e
        message.reply({
          content: `Random number between ${defaultFrom} and ${args[1]}: ${Math.floor(Math.random() * args[1]) + defaultFrom}`
        })
      }
      else if(args.length === 3){
        //should check if args[1] is a number but w/e
        message.reply({
          content: `Random number between ${args[1]} and ${args[2]}: ${Math.floor(Math.random() * args[2]) + args[1]}`
        })
      }
      else {
        message.reply({
          content: 'Too many arguments. Usage: `-random [<from>] [<to>]`'
        })
      }
    }
  }
});

keepAlive();
client.login(token);