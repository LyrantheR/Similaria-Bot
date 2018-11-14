#!/usr/bin/nodejs
const Discord = require('discord.js');
var oldaudit = null;
const key = require('./../idkey.json');
const serverdat = require('./serverdat.json');
const client = new Discord.Client();
const CommandHandler = require('dbot-regex-handler');
client.handler = new CommandHandler();
client.on('ready', () => {
    client.user.setStatus('online');
    client.user.setGame('DEV VERSION v0.73b');
   for (i = 0; i < client.guilds.array().length - 1; i++) {
    try {
    client.guilds.array()[i].channels.find("name", "votes").fetchMessages();
   }
   catch(error) {
      console.log("no chat!");
   }
   }
});
client.handler.endpoint(/^test$/, (match, message) => {
  message.channel.send('First test command');
});
client.handler.endpoint(/^test +(\S.+)$/, (match, message) => {
  message.channel.send('Second test command');
  message.channel.send(match[1]);
});
client.handler.endpoint(/^massdel +(.+)$/, async (match, message) => {
  try {
    if (message.member.hasPermission('MANAGE_MESSAGES')) {
    let messages = await message.channel.fetchMessages({ limit: match[1] });
    message.channel.bulkDelete(messages);
    message.channel.send(`Deleted ${messages.array().length} messages!`);
    }
    else {
      message.channel.send('No permissions!');
    }
  }
  catch(error) {
    console.log("fail!");
  }
});
client.handler.endpoint(/^mute +(\S.+)$/, (match, message) => {
        let role = message.guild.roles.find("name", "Similaria-Muted");
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(match[1]);
        if (message.member.hasPermission('MUTE_MEMBERS')) {
            member.addRole(role.id);
            message.channel.send('muted ' + member.displayName + '!');
        }
        else {
          message.channel.send('No permissions!');
        }
});
client.handler.endpoint(/^unmute +(\S.+)$/, (match, message) => {
  let role = message.guild.roles.find("name", "Similaria-Muted");
  let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(match[1]);
  if (message.member.hasPermission('MUTE_MEMBERS')) {
    try {
      member.removeRole(role);
      message.channel.send(`Unmuted ${member.displayName}!`);
    }
    catch(error) {
      message.channel.send(`Failed!`);
    }
  }
  else {
    message.channel.send(`No permissions!`);
  }
});
client.handler.endpoint(/^about$/, async (match, message) => {
  let Lyra = client.users.find("id", '201363162635829248');
  let ffsi = client.guilds.find("id", "506153726629642255");
  message.channel.send(`A bot created by ${Lyra.username} for the ${ffsi.name} server (${(await ffsi.fetchInvites()).array()}). You can find its repo at https://github.com/LyrantheR/Similaria-Bot.`);
});
client.on('message', async (msg) => {
  if (msg.author.bot) return;
  let content = msg.content.replace(new RegExp(`--`), '');
  if (content === msg.content) return
  let trimmedContent = content.trim();
  console.log(trimmedContent);
  client.handler.apply(trimmedContent, msg); // Returns true if command exist, false if it doesn't.
});
client.on('guildMemberRemove', member => {
            let channel = member.guild.channels.find("name", "logs");
            let em = new Discord.RichEmbed();
            em.setTitle(member.displayName + " left the server...");
            em.setFooter(new Date());
            channel.send(em);
    });
client.on('guildMemberAdd', member => {
            if (member.guild.id === "506153726629642255") {
            if (member.user.bot == true) {
                member.addRole('506188251875377171');
            }
            else {
                member.addRole('506190966273605645');
            }
            }
            let channel = member.guild.channels.find("name", "logs");
            let em = new Discord.RichEmbed();
            em.setTitle(member.displayName + " Joined the server!");
            em.setFooter(new Date());
            channel.send(em);
    });
client.on('guildMemberUpdate', (oldMember, newMember) => {
    try {
    let channel = newMember.guild.channels.find("name", "logs");
    let em = new Discord.RichEmbed();
    em.setTitle('User updated for ' +  oldMember.displayName);
    if (!oldMember.roles.equals(newMember.roles)) {
        let intersection = oldMember.roles.array().filter(x => !newMember.roles.array().includes(x));
        if (intersection === undefined || intersection.length == 0) {
          intersection = newMember.roles.array().filter(x => !oldMember.roles.array().includes(x));
          em.setDescription(`Added ${intersection}`);
        }
        else {
          em.setDescription(`Removed ${intersection}`);
        }
    }
    if (oldMember.nickname != newMember.nickname) {
        em.addField('Nickname Updated', oldMember.nickname + ' to ' + newMember.nickname);
    }
    em.setFooter(new Date());
    channel.send(em);
    }
    catch(error) {
       console.log("no log chat!");
       console.log(error);
    }
});
client.on('messageDelete', async (msg) => {
    try {
    if (msg.author.id != '228537642583588864') {
    let channel = msg.guild.channels.find("name", "logs");
    let em = new Discord.RichEmbed();
    let guild = msg.guild;
    try {
    let executor = (await guild.fetchAuditLogs()).entries.first();
    if (executor.id != oldaudit) {
        em.setTitle('Message deleted from ' + msg.author.username + ' in ' + msg.channel.name + ' by ' + executor.executor.username);
    }
    else {
        em.setTitle('Message deleted by ' + msg.author.username + ' in ' + msg.channel.name);
    }
    oldaudit = executor.id;
    }
    catch(error) {
    console.log(error);
    }
    em.setDescription(msg.content);
    var Attachment = (msg.attachments).array();
    try {
        em.addField('image', Attachment[0].url);
    }
    catch(error) {
        console.log("pass");
    }
    em.setFooter(new Date());
    channel.send(em);
    }
    }
    catch(error) {
       console.log("no log chat!");
    }

});
client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.channel == reaction.message.guild.channels.find("name", "votes")) {
        let users = []
        for (i = 0; i < reaction.message.reactions.array().length; i++) {
          for (l = 0; l < reaction.message.reactions.array()[i].users.array().length; l++) {
            users.push(reaction.message.reactions.array()[i].users.array()[l].id);
          }
        }
        if (find_duplicate_in_array(users).includes(user.id)) {
          reaction.remove(user);
        }
        else if (reaction.emoji.name == '👍' || reaction.emoji.name == '👎') {
            console.log("normal, pass!");
        }
        else if (reaction.emoji.name.startsWith('yea') || reaction.emoji.name.startsWith('nay')) {
            console.log("normal, pass!");
        }
        else {
            reaction.remove(user);
        }
    }
});
function find_duplicate_in_array(arra1) {
        var object = {};
        var result = [];

        arra1.forEach(function (item) {
          if(!object[item])
              object[item] = 0;
            object[item] += 1;
        })

        for (var prop in object) {
           if(object[prop] >= 2) {
               result.push(prop);
           }
        }

        return result;

    }
client.on('roleUpdate', (oldRole, newRole) => {
    try {
    let channel = newRole.guild.channels.find("name", "logs");
    let em = new Discord.RichEmbed();
    em.setTitle(oldRole.name + " updated ");
    if (oldRole.color != newRole.color) {
        em.addField("Color changed", oldRole.color + ' to ' + newRole.color);
    }
    if (oldRole.permissions != newRole.permissions) {
        em.addField("Permissions changed", oldRole.permissions + ' to ' + newRole.permissions);
    }
    if (oldRole.position != newRole.position) {
        em.addField("Position Changed", oldRole.position + ' to ' + newRole.position);
    }
    if (oldRole.name != newRole.name) {
        em.addField("Name Changed", oldRole.name + ' to ' + newRole.name);
    }
    em.setFooter(new Date());
    channel.send(em);
    }
    catch(error) {
       console.log("no log chat!");
    }

});
client.on('guildCreate', async (guild) => {
    let pos = 1;
    for (i = 0; i < guild.roles.length; i++) {
        if (guild.roles[i].hasPermission('KICK_MEMBERS') || guild.roles[i].hasPermission('ADMINISTRATOR')) {
            pos = i - 1;
            break;
        }
    }
let role = guild.roles.find(r => r.name === "Similaria-Muted");
        if(!role) {
            try{
    role = await guild.createRole({
    name: 'Similaria-Muted',
    color: "#000000",
    position: pos,
    permissions: []
    });
    guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(role, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            SPEAK: false,
            MUTE_MEMBERS: false
        });
    });
} catch(e) {
    console.log(e.stack);
}
}
});
client.login(key["token"]);
//https://discordapp.com/api/oauth2/authorize?client_id=506465815500161024&permissions=1544023254&scope=bot
