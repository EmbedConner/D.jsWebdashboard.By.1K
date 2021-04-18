module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(message) {
    if (message.author.bot) return;
    const settings = this.bot.getSettings(message.guild);
    message.settings = settings;
    if (message.content.indexOf(settings.prefix) !== 0) return;
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const level = this.bot.permlevel(message);
    const cmd = this.bot.commands.get(command) || this.bot.commands.get(this.bot.aliases.get(command));
    if (!cmd) return;
    if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send("This command is unavailable with private message. Please run this command in a guild.");

    //Ask use if they don't have perm to ran that command.
    if (level < this.bot.levelCache[cmd.conf.permLevel]) {
      if (settings.systemNotice === "on") {
        return message.channel.send(`${message.author} You do not have permission to use this command.Your permission level is \`${level} ${this.bot.config.permLevels.find(l => l.level === level).name}\`This command requires level \`${this.bot.levelCache[cmd.conf.permLevel]} ${cmd.conf.permLevel}\``);
      } else {
        return;
      }
    }
    message.author.permLevel = level;

    message.flags = [];
    while (args[0] && args[0][0] === "-") {
      message.flags.push(args.shift().slice(1));
    }

    //Show in log when someone run the command
    this.bot.logger.log(`${this.bot.config.permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`, "cmd");
    cmd.run(message, args, level);
  }
};