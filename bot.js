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

const maxTime = 35791 * 60000;

function sleeper(ms) {
  return function() {
    if (ms <= maxTime)
      return new Promise(resolve => setTimeout(resolve, ms));
    else
      return new Promise(resolve => { });
  };
}

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
    case "kill":
      if (args.length === 1 && args[0] === "<@434060520337702932>")
        message.reply("no one kills Wagner.");
      break;

    case "defaultrole":
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.reply("you must be administrator to use this command");
        return;
      }
      
      var roles = message.mentions.roles;

      message.guild.roles.forEach((r, k) => {
        if (args.some(val => val === r.name))
          roles.set(k, r);
      });

      if (roles.size === 0) {
        message.reply(`I could not find the mentioned ${args.length > 1 ? "roles" : "role"}.`)
        return;
      }

      message.guild.members.forEach(m => {
        if (!m.roles.some((ra, ka) => roles.some((rb, kb) => ka === kb))) {
          m.addRoles(roles)
          .then(m => console.log(`Added role to ${m.displayName}.`))
          .catch(console.error);
        }
      });

      message.reply(`adding ${roles.size} ${roles.size > 1 ? "roles" : "role" } to everyone.`);

      break;

    case "tempmute":
      if (!message.member.hasPermission("MUTE_MEMBERS")) {
        message.reply("you don't have permission to use this command");
        return;
      }

      if (message.mentions.members.size === 0) {
        message.reply("please specify at least one user.");
        return;
      }

      const citizenRole = message.guild.roles.find("name", "Citizen");

      const waitTime = isNaN(args[0]) ? 5 * 60 * 1000 : args[0] * 60000;

      var waitTimeStrBuilder = waitTime;

      var waitStr = " for";

      if (waitTimeStrBuilder >= 1000) {
        {
          const unit = 365.25 * 24 * 60 * 60 * 1000;
          if (waitTimeStrBuilder >= unit) {
            const foo = Math.floor(waitTimeStrBuilder / unit);
            waitStr += " " + foo + (foo > 1 ? " years" : " year");
            waitTimeStrBuilder -= foo * unit;
          }
        }
        
        {
          const unit = 30.42 * 24 * 60 * 60 * 1000;
          if (waitTimeStrBuilder >= unit) {
            const foo = Math.floor(waitTimeStrBuilder / unit);
            waitStr += " " + foo + (foo > 1 ? " months" : " month");
            waitTimeStrBuilder -= foo * unit;
          }
        }
        
        {
          const unit = 24 * 60 * 60 * 1000;
          if (waitTimeStrBuilder >= unit) {
            const foo = Math.floor(waitTimeStrBuilder / unit);
            waitStr += " " + foo + (foo > 1 ? " days" : " day");
            waitTimeStrBuilder -= foo * unit;
          }
        } 

        {
          const unit = 60 * 60 * 1000;
          if (waitTimeStrBuilder >= unit) {
            const foo = Math.floor(waitTimeStrBuilder / unit);
            waitStr += " " + foo + (foo > 1 ? " hours" : " hour");
            waitTimeStrBuilder -= foo * unit;
          }
        } 

        {
          const unit = 60 * 1000;
          if (waitTimeStrBuilder >= unit) {
            const foo = Math.floor(waitTimeStrBuilder / unit);
            waitStr += " " + foo + (foo > 1 ? " minutes" : " minute");
            waitTimeStrBuilder -= foo * unit;
          }
        }
  
        {
          const unit = 1000;
          if (waitTimeStrBuilder >= unit) {
            const foo = Math.floor(waitTimeStrBuilder / unit);
            waitStr += " " + foo + (foo > 1 ? " seconds" : " second");
            waitTimeStrBuilder -= foo * unit;
          }
        }
      }
      else
      {
        waitStr = "";
      }

      message.mentions.members.forEach(m =>
      {
        m.removeRole(citizenRole)
        .then(() => message.reply(`I muted ${m.displayName}${waitStr}.`), () => message.reply(`I couldn't mute ${m.displayName}!`))
        .then(sleeper(waitTime))
        .then(() => {
          m.addRole(citizenRole)
          .then(() => message.reply(`I unmuted ${m.displayName}.`), () => message.reply(`I couldn't unmute ${m.displayName}!`))
          .catch(console.error);
        })
        .catch(console.error);
      });

      break;

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