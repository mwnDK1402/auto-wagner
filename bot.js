const NS_PER_SEC = 1e9;
const starttime = process.hrtime();

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

const dynamicRole = "Dynamic";
const roles = [ "3D", "2D", "Eksperimentel", "Analytiker", "PR" ];

var hasRole = function(guildormember, role)
{
  return guildormember.roles.some(r => r.name === role);
};

var createRole = function(guild, role)
{
  guild.createRole( { name: role })
    .then(r => message.reply(`I created ${r.name} role.`))
    .catch(console.error);
};

client.on("ready", () => {
  const readytime = process.hrtime();
  const difftime = (readytime[0] - starttime[0]) + (readytime[1] - starttime[1]) / NS_PER_SEC;
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds. (${difftime} seconds)`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  createRole(guild);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

client.on("message", async message => {
  if (message.author === client.user) return;
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log(`Command: |${command}| Args: |${args}|`);

  switch (command) {
    case "role":
      if (!hasRole(message.member, dynamicRole)) {
        message.reply(`you don't have the ${dynamicRole} role.`);
        return;
      }

      if (args.length !== 1) {
        message.reply("please specify a single role.");
        return;
      }

      var roleName = args[0];

      roleName = roles.find(function(element) {
        return roleName.toLowerCase() === element.toLowerCase();
      });

      if (roleName === undefined) {
        console.log(`${args[0]} was not a defined role.`);
        return;
      }

      if (!hasRole(message.guild, roleName))
        message.guild.createRole({ name: roleName })
          .then(r => {
            message.member.setRoles( [r] )
              .then(() => message.reply(`I assigned you to the ${r.name} role.`))
              .catch(console.error);
          })
          .catch(console.error);
      else {
        const role = message.guild.roles.find(e => roleName === e.name);  // undefined if not found

        if (role === undefined) {
          console.log(`Could not find ${roleName} as a Role.`);
          return;
        }

        const guildRoles = message.guild.roles.filter((r, k, c) => 
        {
          return roles.some(n => n === r.name);
        });

        message.member.removeRoles(guildRoles)
          .then(() => message.member.addRole(role)
            .then(() => message.reply(`I assigned you to the ${role.name} role.`))
            .catch(console.error))
          .catch(console.error);
      }

      break;
  }
});

client.login(config.token);