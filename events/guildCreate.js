module.exports = class {
    constructor(bot) {
      this.bot = bot;
    }
    async run(guild) {
      this.bot.user.setPresence({game: {name: `${this.bot.settings.get("default").prefix}help | ${this.bot.guilds.size} Servers`, type:0}});
      this.bot.logger.log(`New guild has been joined: ${guild.name} (${guild.id}) with ${guild.memberCount - 1} members`);
    }
};