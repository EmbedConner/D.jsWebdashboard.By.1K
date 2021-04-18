//Handle web view Developer Library
const url = require("url");
const path = require("path");
const Discord = require("discord.js");
const express = require("express");
const app = express();
const moment = require("moment");
require("moment-duration-format");
const passport = require("passport");
const session = require("express-session");
const MemoryStore = require("memorystore")(session)
const Strategy = require("passport-discord").Strategy;
const helmet = require("helmet");
const md = require("marked");

//Handle view Dashhbaord files
module.exports = (bot) => {
  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`);
  app.use("/public", express.static(path.resolve(`${dataDir}${path.sep}public`)));
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  //Apply bot passport from register
  passport.use(new Strategy({
    clientID: bot.appInfo.id,
    clientSecret: bot.config.dashboard.oauthSecret,
    callbackURL: bot.config.dashboard.callbackURL,
    scope: ["identify", "guilds"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: bot.config.dashboard.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }));
  var bodyParser = require("body-parser");
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());
  app.locals.domain = bot.config.dashboard.domain;
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  })); 

  //Checking auth
  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }
  
  //RenderTemplate
  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: bot,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };

  //Handle Login
  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
  passport.authenticate("discord"));

  //Handle Callback
  app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    if (req.user.id === bot.appInfo.owner.id) {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false;
    }
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  });

  //Handle Logout
  app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/");
    });
  });

  //Index.ejs
  app.get("/", (req, res) => {
    renderTemplate(res, req, "index.ejs");
  });

  //Dashboard.ejs
  app.get("/dashboard", checkAuth, (req, res) => {
    const perms = Discord.EvaluatedPermissions;
    renderTemplate(res, req, "dashboard.ejs", {perms});
  });

  //Commandlists.ejs
  app.get("/commandlists", (req, res) => {
    renderTemplate(res, req, "commandlists.ejs", {md});
  });

  //Howto.ejs
  app.get("/howto", (req, res) => {
    const prefix = bot.config.defaultSettings.prefix;
    renderTemplate(res, req, "howto.ejs", {md, 
      howto: {
        prefix: prefix,
      }
    });
  });

  //Userprofile.ejs
  app.get("/userprofile", (req, res) => {
    renderTemplate(res, req, "userprofile.ejs", {md});
  });

  //Stats
  app.get("/stats", (req, res) => {
    const duration = moment.duration(bot.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    const members = bot.guilds.reduce((p, c) => p + c.memberCount, 0);
    const textChannels = bot.channels.filter(c => c.type === "text").size;
    const voiceChannels = bot.channels.filter(c => c.type === "voice").size;
    const guilds = bot.guilds.size;
    const prefix = bot.config.defaultSettings.prefix;
    renderTemplate(res, req, "stats.ejs", {
      stats: {
        prefix: prefix,
        servers: guilds,
        members: members,
        text: textChannels,
        voice: voiceChannels,
        uptime: duration,
        memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        dVersion: Discord.version,
        nVersion: process.version
      }
    });
  });

  //Settings.ejs
  app.get("/dashboard/:guildID", checkAuth, (req, res) => {
    res.redirect(`/dashboard/${req.params.guildID}/settings`);
  });
  app.get("/dashboard/:guildID/settings", checkAuth, (req, res) => {
    const guild = bot.guilds.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    renderTemplate(res, req, "guild/settings.ejs", {guild});
  });

  //Checking permission
  app.post("/dashboard/:guildID/settings", checkAuth, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    client.writeSettings(guild.id, req.body);
    res.redirect("/dashboard/"+req.params.guildID+"/settings");
  });

  //Runing port
  bot.site = app.listen(bot.config.dashboard.port);
};
