const chalk = require("chalk");
const moment = require("moment");

class logger {
    static log(content, type = "log"){
        const timestamp = `[${moment().format("DD-MM-YYYY HH:mm:ss") + "✅"}]`;
        switch (type) {
            case "log": {
                return console.log(`${timestamp} ${chalk.white.bgBlue(type.toUpperCase())} ${content}`);
            }
            case "warn": {
                return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content}`);
            }
            case "error": {
                return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content}`);
            }
            case "debug": {
                return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content}`);
            }
            case "cmd": {
                return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
            }
            case "ready": {
                return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
            }
            default: throw new TypeError("warn, debug, log, error, cmd, ready");
        }
    }

    static error(content){
        return this.log(content, "error");
    }
    static error(content){
        return this.log(content, "warn");
    }
    static error(content){
        return this.log(content, "debug");
    }
    static error(content){
        return this.log(content, "cmd");
    }
}

module.exports = logger;