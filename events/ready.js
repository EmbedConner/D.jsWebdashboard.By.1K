module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }
    async run() {
        await this.bot.wait(1000);
        this.bot.appInfo = await this.bot.fetchApplication();
        setInterval( async () => {
            this.bot.appInfo = await this.bot.fetchApplication();
        }, 60000);
        if (!this.bot.settings.has("default")) {
            if (!this.bot.config.defaultSettings) throw new Error("defaultSettings not preset in config.js or settings database. Bot cannot load.");
            this.bot.settings.set("default", this.bot.config.defaultSettings);
        }
        require("../util/dashboard.js")(this.bot);
        //set Activity
        this.bot.user.setActivity(`${this.bot.user.username}`, {type: "LISTENING"});
        //When bot getting ready
        this.bot.logger.log(`${this.bot.user.tag}, ready to server ${this.bot.users.size} users in ${this.bot.guilds.size} servers. App listening on port ${this.bot.config.dashboard.port}`, "ready");
    }
};