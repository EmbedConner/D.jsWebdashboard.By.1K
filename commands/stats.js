const Command = require("../adapter/command");
const moment = require('moment');
const { version } = require('discord.js');
require('moment-duration-format');

class Stats extends Command {
    constructor(bot){
        super(bot, {
            name: "stats",
            description: "Bot statistice showing.", // ការបង្ហាញស្ថិតិរបស់ Bot ។
            usage: "stats",
            category: "System",
            aliases: ["stats"]
        });
    }

    async run(message, args, level) {
        const duration = moment.duration(this.bot.uptime).format(" D [day], H [hrs], m [mins], s [secs]");
        message.channel.send(`
        • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
        • Uptime     :: ${duration}
        • Users      :: ${this.bot.users.cache.size.toLocaleString()}
        • Servers    :: ${this.bot.guilds.cache.size.toLocaleString()}
        • Channels   :: ${this.bot.channels.cache.size.toLocaleString()}
        • Discord.js :: v${version}
        • Node       :: ${process.version}`, {code: "asciidoc"});
    }
}

module.exports = Stats;