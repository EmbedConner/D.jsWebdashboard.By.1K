module.exports = class {
    constructor(bot) {
      this.bot = bot;
    }
    async run(guild) {
      this.bot.user.setPresence({game: {name: `${this.bot.settings.get("default").prefix}help | ${this.bot.guilds.size} Servers`, type:0}});
      this.bot.settings.delete(guild.id);
    }
};