const Command = require("../adapter/command");

class Help extends Command {
    constructor (bot) {
        super(bot, {
            name: "help",
            description: "បង្ហាញពាក្យបញ្ជាដែលមានទាំងអស់។ ", // បង្ហាញពាក្យបញ្ជាដែលមានទាំងអស់។
            category: "System",
            usage: "help or help <command name>",
            aliases: ["h", "help"]
        });
    }

    async run  (message, args, level){
        if (!args[0]) {
            // Load guild settings (for prefixes and eventually per-guild tweaks)
            const settings = message.settings;
            // Filter all commands by which are available for the user's level
            const myCommands = message.guild ? this.bot.commands.filter(cmd => this.bot.levelCache[cmd.conf.permLevel] <= level) : 
            this.bot.commands.filter(cmd => this.bot.levelCache[cmd.conf.permLevel] <= level && cmd.conf.guildOnly !== true);
            const commandNames = myCommands.keyArray();
            const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);
            let currentCategory = "";
            let outPut = `${this.bot.user.username}🧾Command List: \n[Use ${this.bot.config.defaultSettings.prefix}help <commandName> for details]\n`;
            const sorted = myCommands.array().sort((p, c) => p.help.category > c.help.category ? 1 : p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1);
            sorted.forEach(c => {
                const cat = c.help.category.toProperCase();
                if (currentCategory !== cat) {
                    outPut += `${cat}\n`;
                    currentCategory = cat;
                }
                outPut += `${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
            });
            message.channel.send(outPut, {code: "asciidoc", split: {char: "\u200b"}});
        } else {
            let command = args[0];
            if (this.bot.commands.has(command)) {
                command = this.bot.commands.get(command);
                if (level < this.bot.levelCache[command.conf.permLevel]) return;
                message.channel.send(`📌${command.help.name} :: ${command.help.description}\n usage:: ${this.bot.config.defaultSettings.prefix}${command.help.usage}\n alises:: ${command.conf.aliases.join(",")}`, {code:"asciidoc"});
            }
        }
    }
}

module.exports = Help;