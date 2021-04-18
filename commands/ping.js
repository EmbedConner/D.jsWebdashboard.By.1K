const Command = require("../adapter/command");

class Ping extends Command {
  constructor(bot) {
    super(bot, {
      name: "ping",
      description: "Latency and API response times.", //​ ពេលវេលាឆ្លើយតបយឺតនិង API ។
      usage: "ping",
      aliases: ["pong"]
    });
  }

  async run(message) {
    try {
      const msg = await message.channel.send("🏓 Ping!");
      msg.edit(`🏓 Pong! (Roundtrip took: ${msg.createdTimestamp - message.createdTimestamp}ms. 🏓: ${Math.round(this.bot.ping)}ms.`);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Ping;