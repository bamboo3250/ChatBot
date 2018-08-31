const Discord = require('discord.js');
const config = require('./config');
const replies = require('./reply');
const Simsimi = require('simsimi');

function MonaBot() {
	this.client = new Discord.Client();
    this.firstTimeReady = true;
    this.logChannel = null;
    
    this.simsimi = new Simsimi({
      key: config.simsimi,
      api: 'http://api.simsimi.com/request.p',
      ft: 0.3,
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

function containOneOfKeywords(text, keywords) {
    for(let i = 0; i < keywords.length; i++) {
        if (text.includes(keywords[i])) return true;
    }
    return false;
}

MonaBot.prototype.handleMessage = function(message) {
    if (message.author.id === this.client.user.id) return;

    if (message.channel.name === 'chém-gió') {
        let content = message.content.replace(/[~`!@#$%^&*()_+{}:;"'<>?,./=]/g, '');

        this.simsimi.listen(content, (err, msg) => {
            if (err) {
                this.log(`[Simsimi Error] ${JSON.stringify(err)}`);
                return
            }
            message.reply(msg);
        });
    }

    if (message.channel.name === 'thảo-luận-chung') {
        let content = message.content.toLocaleLowerCase().replace(/[~`!@#$%^&*()_+{}:;"'<>?,./=]/g, '');
        if (content.length === 0) return;

        for (let i = 0; i < replies.length; i++) {
            let reply = replies[i];
            if (containOneOfKeywords(content, reply.keywords)) {
                if (randomInt(100) > 20) {
                    return;
                }

                if (randomInt(3) < 2) {
                    message.reply(reply.reply[randomInt(reply.reply.length)]);
                } else {
                    this.simsimi.listen(content, (err, msg) => {
                        if (err) {
                            this.log(`[Simsimi Error] ${JSON.stringify(err)}`);
                            return;
                        }
                        message.reply(msg);
                    });
                }
                return;
            } else {
                if (randomInt(1000) < 5) {
                    this.simsimi.listen(content, (err, msg) => {
                        if (err) {
                            this.log(`[Simsimi Error] ${JSON.stringify(err)}`);
                            return;
                        }
                        message.channel.send(msg);
                    });
                }
            }
        }
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

function randomInt(maxNumber) {
    return Math.floor(Math.random() * maxNumber);
}

MonaBot.prototype.random = function(list) {
	if (!list) return null;
	return list[randomInt(list.length)];
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