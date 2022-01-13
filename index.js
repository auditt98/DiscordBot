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
    let command = message.content.substring(1).toLowerCase();
    let args = command.split(' ');
    if(args[0] === 'ping'){
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
    if(args[0] === 'create-role'){
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
  }
});

keepAlive();
client.login(token);