const Command = require("../adapter/command");

class MyLevel extends Command {
    constructor(bot) {
        super(bot, {
            name: "mylevel",
            description: "Displays your permission level for your location.​", // បង្ហាញកម្រិតការអនុញ្ញាតរបស់អ្នកសម្រាប់ទីតាំងរបស់អ្នក។
            usage: "mylevel",
            aliases: ["mylevel"],
            category: "System",
            guildOnly: true
        });
    }

    async run (message, args, level) {
        const friendly = this.bot.config.permLevels.find(l => l.level === level).name;
        message.reply(`Your permission level is: \`${level} - ${friendly}\``);
    }
}

module.exports = MyLevel;