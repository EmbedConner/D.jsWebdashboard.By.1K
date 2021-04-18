require('dotenv/config');
const config = {
  "admins": [],
  "support": [],
  "token": process.env.BOT_TOKEN,
  "dashboard": {
    "oauthSecret": process.env.CLIENT_SECRET,
    "callbackURL": "http://localhost:3030/callback",
    "sessionSecret": "Music.ly",
    "domain": "localhost:3030",
    "port": process.env.LIVE_PORT
  },
  defaultSettings: {
  "prefix": process.env.BOT_PREFIX,
  "modLogChannel": "mod-log",
  "modRole": "Moderator",
  "adminRole": "Administrator",
  "systemNotice": "on"
},
  permLevels: [
    { level: 0,
      name: "User", 
      check: () => true
    },
    { level: 2,
      name: "Moderator",
      check: (message) => {
        try {
          const modRole = message.guild.roles.find(role => role.name.toLowerCase() === message.settings.modRole.toLowerCase());
          if (modRole && message.member.roles.has(modRole.id)) return true;
        } catch (e) {
          return false;
        }
      }
    },
    { level: 3,
      name: "Administrator", 
      check: (message) => {
        try {
          const adminRole = message.guild.roles.find(role => role.name.toLowerCase() === message.settings.adminRole.toLowerCase());
          return (adminRole && message.member.roles.has(adminRole.id));
        } catch (e) {
          return false;
        }
      }
    },
    { level: 4,
      name: "Server Owner", 
      check: (message) => message.channel.type === "text" ? (message.guild.owner.user.id === message.author.id ? true : false) : false
    },
    { level: 8,
      name: "Bot Support",
      check: (message) => config.support.includes(message.author.id)
    },
    { level: 9,
      name: "Bot Admin",
      check: (message) => config.admins.includes(message.author.id)
    },
    { level: 10,
      name: "Bot Owner", 
      check: (message) => message.client.appInfo.owner.id === message.author.id
    }
  ]
};

module.exports = config;