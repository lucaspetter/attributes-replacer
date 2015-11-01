'use strict';

let textParser = require('./text-parser'),
    rulesParser = require('./rules-parser'),
    messenger = require('./messenger');

let background = {
    save: function(key, value) {
        localStorage.setItem(key, value);
    },
    load: function(key) {
        return localStorage.getItem(key);
    },
    on: function() {
        let rawSelectors = background.load('selectors');
        let rawRules = background.load('rules');
        messenger.sendToTab('content-script', {
            action: 'on',
            args: {
                selectors: textParser.parse(rawSelectors),
                rules: rulesParser.parse(rawRules)
            }
        });
    },
    off: function() {
        let rawSelectors = background.load('selectors');
        messenger.sendToTab('content-script', {
            action: 'off',
            args: {
                selectors: textParser.parse(rawSelectors)
            }
        });
    },
    init: function() {
        let turnedOn = (background.load('switch') === 'true');
        if(turnedOn) background.on();
    }
};

messenger.listen('background', message => {
    if(message.action === 'save') {
        background.save(message.key, message.value);
    }
    else if(message.action === 'load') {
        let value = background.load(message.key);
        messenger.sendToExtension(message.from, {
            action: 'load',
            key: message.key,
            value: value
        });
    }
    else if(typeof background[message.action] === 'function') {
        background[message.action]();
    }
});