const Command = require("../adapter/command");

class ShutDown extends Command {
    constructor(bot){
        super(bot, {
            name: "shutdown",
            description: "If running under PM2, bot will restart.", // ប្រសិនបើដំណើរការក្រោម PM2 bot នឹងចាប់ផ្តើមឡើងវិញ។
            category: "System",
            usage: "shutdown",
            permLevel: "Bot Owner",
            aliases: ["shut","shutdown"]
        });
    }

    async run (message){
        try{
            await message.reply("Bot is shutting down.");
            await Promise.all(this.bot.commands.map(cmd => this.bot.unloadCommand(cmd)));
            process.exit(1);
        } catch (e){
            console.log(e);
        }
    }
}

module.exports = ShutDown;