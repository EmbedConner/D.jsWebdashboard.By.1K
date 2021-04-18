const Command = require("../adapter/command");

class Setup extends Command {
    constructor(bot) {
        super(bot, {
            name: "set",
            description: "View or change settings for your server.", // មើលឬប្តូរការកំណត់សម្រាប់ម៉ាស៊ីនមេរបស់អ្នក។
            category: "System",
            usage: "set <view/get/edit> <key> <value>",
            guildOnly: true,
            aliases: ["setting", "settings"],
            permLevel: "Administrator"
        });
    }

    async run(message, [action, key, ...value]){
        //retrieve current guild settings.
        const settings = message.settings;
        const defaults = this.bot.settings.get("default");
        const overrides = this.bot.settings.get(message.guild.id);
        if (!this.bot.settings.has(message.guild.id)) this.bot.settings.set(message.guild.id, {});

        //setup edit command
        if (action === "edit") {
            //User must spocify a key
            if (!key) return message.reply("Please specify a key to edit.");

            // User must specify a key that actually exists!
            if (!settings[key]) return message.reply("This key does not exist in the settings");

            // User must specify a value to change.
            const joinedValue = value.join(" ");
            if (joinedValue.length < 1) return message.reply("Please specify a new value");

            // User must specify a different value than the current one.
            if (joinedValue === settings[key]) return message.reply("This setting already has that value!");

            // If the guild does not have any overrides, initialize it.
            if (!this.bot.settings.has(message.guild.id)) this.bot.settings.set(message.guild.id, {});

            // Modify the guild overrides directly.
            this.bot.settings.set(message.guild.id, joinedValue, key);
            message.reply(`${key} successfully edited to \`${joinedValue}\``);
        } else 
        // If a user does `-set del <key>`, let's ask the user if they're sure...
        if (action === "del" || action === "reset") {
            if (!key) return message.reply("Please specify a key to delete (reset).");
            if (!settings[key]) return message.reply("This key does not exist in the settings");
            if (!overrides[key]) return message.reply("You can not del or reset this key, cause it is already running on the defaults.");

            // Throw the 'are you sure?' text at them.
            const respone = await this.bot.awaitReply(message, `Are you sure you want to reset \`${key}\` to the default \`${defaults[key]}\`?`);

            // If they respond with y or yes, continue.
            if (["y", "yes"].includes(respone)) {
                //We reset the key here.
                this.bot.settings.delete(message.guild.id, key);
                message.reply(`${key} was successfully reset to default \`${defaults[key]}\``);
            } else
            // If they respond with n or no, continue.
            if (["n", "no", "cancel"].includes(respone)) {
                message.reply(`Your setting for \`${key}\` remains at \`${settings[key]}\``);
            }
        } else 
        if (action === "view") {
            if (!key) return message.reply("Please specify a key to view.");
            if (!settings[key]) return message.reply("This key does not exist in the settings");
            message.reply(`The value of \`${key}\` is currently \`${settings[key]}\``);
        } else {
            const array = Object.entries(settings).map(([key, value]) => `${key}${" ".repeat(20 - key.length)}:: ${value}`);
            await message.channel.send(`Current Guild Setting \n${array.join("\n")}`, {code: "asciidoc"});
        }
    }
}

module.exports = Setup;