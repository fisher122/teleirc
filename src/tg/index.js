var Telegram = require('node-telegram-bot-api');
var config = require('../config');
var tgUtil = require('./util');
var logger = require('winston');
var shared = require('../shared.js');

var myUser = {};

var prvusersmsg = true;

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
                    var tgGroupReadOnly = message.channel.tgGroupReadOnly;
                    var isOverrideReadonly = message.channel.tgGroupOverrideReadOnly;
                    var isBotHighlighted = false;

                    isBotHighlighted = msg.text && msg.text.startsWith('@' + myUser.username);

                    if (tgGroupReadOnly) {
                        if (!(isOverrideReadonly && isBotHighlighted)) {
                            return;
                        }
                    }

                    message.protocol = 'tg';
                    msgCallback(message);
                }
            });
	    prvusersmsg = true;
	    console.log(prvusersmsg)
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

	    userTG = '';
            userTGLegacy = '';

	    if(message.user && shared.lastUserShared != message.user && message.user != null || prvusersmsg == true && message.user != null && message.user){//changing username
                console.log("переменная сукаблять");
		console.log(prvusersmsg);
		logger.verbose("\nNEW USERNAME:\nuser:"+shared.lastUserShared+", new:"+message.user+"\n\n");
		shared.lastUserShared = message.user;
                //userTG = '`'+shared.lastUserShared+'` said: '+"\n";
                //userTGLegacy = '<'+shared.lastUserShared+'> said: '+"\n";
		userTGLegacy = '['+shared.lastUserShared+'] said: '+"\n";
		userTG = '[<code>'+shared.lastUserShared+'</code>] said: '+"\n";
            } else if(!message.user){
	    	logger.verbose("missing username; probably message from ourselves");
		prvusersmsg = true;
		shared.lastUserShared = 0;
	    } else{
                logger.verbose("\nUSERNAME NOT CHANGED:\nuser:"+shared.lastUserShared+", new:"+message.user+"\n\n");
            }

            //if (message.user) {
            //    message.text = '[' + message.user + '] ' + message.text;
            //}

	    var options = {};
	    options.parse_mode = 'HTML';

            logger.verbose('>> relaying to TG:', message.text);
            //tg.sendMessage(message.channel.tgChatId, message.text, {parse_mode: "HTML"});
	    var msgtotg = tg.sendMessage(message.channel.tgChatId, userTG + message.text, options);

	    msgtotg.then(
                ok => {
		    prvusersmsg = false;
                    console.log(prvusersmsg)
		    //console.log("ok")
                    //console.log(message)
                },
                error => {
		    prvusersmsg = false;
		    console.log(prvusersmsg)
                    //console.log("error")
                    //console.log(message)
                    tg.sendMessage(message.channel.tgChatId, userTGLegacy + message.text);//try again?
                }
            );
	}
    };
};

module.exports = init;
