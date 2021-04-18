//Index Main Globle
const Discord = require ('discord.js');
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const klaw = require("klaw");
const path = require("path");

//Handle loading command & events files
const init = async () => {
    //Commands Handle
    klaw("./commands").on("data", (item) => {
        const cmdFile = path.parse(item.path);
        if (!cmdFile.ext || cmdFile.ext !== ".js") return;
        const response = bot.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
        if (response) bot.logger.error(response);
    });
    //Events Handle
    const evtFiles = await readdir("./events/");
    bot.logger.log(`Loading a total of ${evtFiles.length} events.`, "log");
    evtFiles.forEach(file => {
      const eventName = file.split(".")[0];
      const event = new (require(`./events/${file}`))(bot);
      bot.on(eventName, (...args) => event.run(...args));
      delete require.cache[require.resolve(`./events/${file}`)];
    });

    //Level Handle
    bot.levelCache = {};
    for (let i = 0; i < bot.config.permLevels.length; i++) {
        const thisLevel = bot.config.permLevels[i];
        bot.levelCache[thisLevel.name] = thisLevel.level;
    }
    //apply token for running.
    bot.login(bot.config.token);
};

//Handle extends class inter face.
class Musicly extends Discord.Client {
    constructor(options){
        super(options);
        this.config = require("./config/config");
        this.commands = new Discord.Collection();
        this.aliases = new Discord.Collection();
        this.playlists = new Discord.Collection();
        this.settings = new Enmap({ name: "settings"});
        this.logger = new require("./util/logger");
        this.wait = promisify(setTimeout);
    }

    //Handle Bot permission Level who allow to use commands.
    permlevel(message){
        let permlvl = 0;
        const permOrder = this.config.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);
        while (permOrder.length) {
            const currentLevel = permOrder.shift();
            if (message.guild && currentLevel.guildOnly) continue;
            if (currentLevel.check(message)) {
                permlvl = currentLevel.level;
                break;
            }
        }
        return permlvl;
    }

    //Handle Commands loader
    loadCommand(commandPath, commandName){
        try{
            const props = new (require(`${commandPath}${path.sep}${commandName}`))(this);
            this.logger.log(`Loading Command: ${props.help.name}.`, "log");
            props.conf.location = commandPath;
            if (props.init){
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            props.conf.aliases.forEach(element => {
                this.aliases.set(element, props.help.name);
            });
            return false;
        } catch (error){
            return `Unable to load command ${commandName}: ${error}`;
        }

    }

    //Check if the command unloading
    async unloadCommand(commandPath, commandName){
        let command;
        if (this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        } else {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if (!command) return `The command \`${commandName}\` doesn't seem to load. Try again!`;
        if (command.shutdown){
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`${commandPath}${path.sep}${commandName}.js`)];
        return false;
    }

    //Get settings from config
    getSettings(guild) {
        const defaults = bot.config.defaultSettings || {};
        const guildData = bot.settings.get(guild.id) || {};
        const returnObject = {};
        Object.keys(defaults).forEach((key) => {
            returnObject[key] = guildData[key] ? guildData[key] : defaults[key];
        });
        return returnObject;
    }

    //get write setting from config
    writeSettings(id, newSettings) {
        const defaults = this.settings.get("default");
        let settings = this.settings.get(id);
        if (typeof settings != "object") settings = {};
        for (const key in newSettings) {
            if (defaults[key] !== newSettings[key]) {
                settings[key] = newSettings[key];
            } else {
                delete settings[key];
            }
        }
        this.settings.set(id, settings);
    }    

    //Clean Text
    async clean(text) {
        if (text && text.constructor.name == "Promise")
        text = await text;
        if (typeof evaled !== "string")
        text = require("util").inspect(text, {depth: 0});
  
        text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(this.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");
  
        return text;
    }

    //AwaitReply
    async awaitReply(msg, question, limit = 60000) {
        const filter = m=>m.author.id = msg.author.id;
        await msg.channel.send(question);
        try {
          const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
          return collected.first().content;
        } catch (e) {
          return false;
        }
    };
}

const bot = new Musicly();
init();

bot.on("disconnect", () => bot.logger.warn("Bot is disconnecting..."))
    .on("reconnect", () => bot.logger.log("Bot is reconnecting..."))
    .on("error", e => bot.logger.error(e))
    .on("warn", info => bot.logger.warn(info));

String.prototype.toProperCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};

process.on("uncaughtException", (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    console.error("Uncaught Exception: ", errorMsg);
    process.exit(1);
});
  
process.on("unhandledRejection", err => {
    console.error("Uncaught Promise Error: ", err);
});