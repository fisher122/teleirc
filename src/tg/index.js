var Telegram = require('node-telegram-bot-api');
var config = require('../config');
var tgUtil = require('./util');
var logger = require('winston');
var shared = require('../shared');

var myUser = {};


var init = function(msgCallback) {
    // start HTTP server for media files if configured to do so
    if (config.showMedia) {
        tgUtil.initHttpServer();
    }

    var tg = new Telegram(config.tgToken, {polling: true});

    // get our own Telegram user
    tg.getMe().then(function(me) {
        myUser = me;

        tg.on('message', function(msg) {
            logger.debug('got tg msg:', msg);

            tgUtil.parseMsg(msg, myUser, tg, function(message) {
                if (message) {
                    message.protocol = 'tg';
                    msgCallback(message);
                }
            });
        });
    });

    return {
        send: function(message) {
            // if no chatId has been read for the chat yet, try reading it from disk
            if (!message.channel.tgChatId) {
                message.channel.tgChatId = tgUtil.readChatId(message.channel);
            }

            // if still no chatId, return with error message
            if (!message.channel.tgChatId) {
                var err = 'No chat_id set! Add me to a Telegram group ' +
                          'and say hi so I can find your group\'s chat_id!';

                msgCallback({
                    protocol: 'tg',
                    channel: message.channel,
                    text: err
                });

                logger.error(err);
                return;
            }

            /*

            logger.verbose('>> relaying to TG:', message.text);
            var options = {};
            options.parse_mode = 'Markdown';
            userTG = '';
            userTGLegacy = '';
            if(lastUser != message.user){//changing username
                logger.verbose("\nNEW USERNAME:\nuser:"+lastUser+", new:"+message.user+"\n\n");
                lastUser = message.user;
                userTG = '`'+lastUser+'` said: '+"\n";
                userTGLegacy = '<'+lastUser+'> said: '+"\n";
                tg.sendMessage(message.channel.tgChatId, userTG, options);
            }else{
                logger.verbose("\nUSERNAME NOT CHANGED:\nuser:"+lastUser+", new:"+message.user+"\n\n");
            }

const timer = ms => new Promise( res => setTimeout(res, ms));
Then we can simply use it:

console.log("wait 3 seconds")
timer(3000).then(_=>console.log("done"));


blablbalba костыли костылики


            */



            userTG = '';
            userTGLegacy = '';
            if(shared.lastUserShared != message.user || shared.lastUserForce == true){//changing username
                logger.verbose("\nNEW USERNAME:\nuser:"+shared.lastUserShared+", new:"+message.user+"\n\n");
                shared.lastUserShared = message.user;
                userTG = '`'+shared.lastUserShared+'` said: '+"\n";
                userTGLegacy = '<'+shared.lastUserShared+'> said: '+"\n";
                lastUserForce = false;
            }else{
                logger.verbose("\nUSERNAME NOT CHANGED:\nuser:"+shared.lastUserShared+", new:"+message.user+"\n\n");
            }


            var options = {};
            options.parse_mode = 'Markdown';
	        //options.parse_mode = 'HTML';
            logger.verbose('>> relaying to TG:', message.text);


            var autizmopromise = tg.sendMessage(message.channel.tgChatId, userTG + message.text, options);

            autizmopromise.then(
                ok => {
                    //console.log("ok")
                    //console.log(message)
                },
                error => {
                    //console.log("error")
                    //console.log(message)
                    tg.sendMessage(message.channel.tgChatId, userTGLegacy + message.text);//try again?
                }
            );
        }
    };
};

module.exports = init;
