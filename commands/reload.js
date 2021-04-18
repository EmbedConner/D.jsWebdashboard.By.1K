const Command = require("../adapter/command");

class Relaod extends Command {
    constructor(bot) {
        super(bot, {
            name: "reload",
            description: "Reloads a command that has been modified.", // ផ្ទុកឡើងវិញនូវពាក្យបញ្ជាដែលត្រូវបានកែប្រែ។
            category: "System",
            usage: "reload <commandName>",
            permLevel: "Bot Admin",
            aliases: ["reload"]
        })
    }

    async run(message, args, level){
        if (!args || args.size < 1) return message.reply("Please provide a command to reload!");
        const commands = this.bot.commands.get(args[0]) || this.bot.commands.get(this.bot.aliases.get(args[0]));
        if (!commands) return message.reply(`The command \`${args[0]}\` does not exist.`);
        let respone = await this.bot.unloadCommand(commands.conf.location, commands.help.name);
        if (respone) return message.reply(`Error Unloading: ${respone}`);
        respone = this.bot.loadCommand(commands.conf.location, commands.help.name);
        if (respone) return message.reply(`Error loading: ${respone}`);
        message.reply(`The command \`${commands.help.name}\` has been reloaded.`);
    }
}

module.exports = Relaod;