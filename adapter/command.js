class Command {
    constructor(bot, {
        name = null,
        description = "No description provided.",
        category = "Others",
        usage = "No usage provided.",
        enabled = true,
        guildOnly = false,
        aliases = new Array(),
        permLevel = "User"
    }) {
        this.bot = bot;
        this.conf = { enabled, guildOnly, aliases, permLevel };
        this.help = { name, description, category, usage };
    }
}

module.exports = Command;