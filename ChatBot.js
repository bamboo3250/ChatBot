const Discord = require('discord.js');
const config = require('./config');
const Simsimi = require('simsimi');

function MonaBot() {
	this.client = new Discord.Client();
    this.firstTimeReady = true;
    this.logChannel = null;
    
    this.simsimi = new Simsimi({
      key: config.simsimi,
      api: 'http://api.simsimi.com/request.p',
      ft: '0.5',
      lc: 'vn',
    });

    this.init();
}

MonaBot.prototype.ready = function() {
	console.log('ready');
	if (this.firstTimeReady) {
        this.client.channels.array().forEach(channel => {
        	if (channel.type === "text" && channel.name === "log") {
                this.logChannel = channel;
            }
        });
        
        console.log("logChannel is " + (this.logChannel?"on":"off"));    
        this.log('ready');
        this.firstTimeReady = false;

        return true;
    } else {
        this.log('Bot is restarted');
        return false;
    }
}

MonaBot.prototype.init = function() {
    this.client.on('ready', () => {
    	this.ready();
    });
    this.client.on('message', (message) => {
        this.handleMessage(message);
    });
};

MonaBot.prototype.login = function() {
	console.log('login');
    this.client.login(config.token);
};

MonaBot.prototype.handleMessage = function(message) {
    if (message.author.id == this.client.user.id) return;

    if (message.channel.name === 'chém-gió') {
        let self = this;
        let content = message.content.replace(/[~`!@#$%^&*()_+{}:;"'<>?,./]/g, '');
        if (content.length === 0) return;
        
        console.log('sent ' + content);
        this.simsimi.listen(content, (err, msg) => {
            if (err) {
                self.log(`[Simsimi Error] ${JSON.stringify(err)}`);
                return;
            }
            message.reply(msg);
        });
    }
};

MonaBot.prototype.log = function(message) {
	console.log(message);
	this.logChannel && this.logChannel.send(message);
}

MonaBot.prototype.createEmbed = function(title) {
    return new Discord.RichEmbed()
            .setTitle(title)
            .setTimestamp()
            .setColor(0xFF8B00)
            .setFooter('by JHP-TMA group');
}

MonaBot.prototype.random = function(list) {
	if (!list) return null;
	return list[Math.floor(Math.random()*list.length)];
}

const myBot = new MonaBot();
myBot.login();

process.on('uncaughtException', function (err) {
    myBot.log('Uncaught Exception: \n' + err.stack);
    console.log('Uncaught Exception: \n' + err.stack)
});

process.on("unhandledRejection", function(err) {
    myBot.log("Uncaught Promise Error: \n" + err.stack);
    console.log("Uncaught Promise Error: \n" + err.stack)
});