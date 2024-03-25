const telegram = require('node-telegram-bot-api');
const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewards = require('../ruby_modules/rewarder.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainHub); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);
//--------------------------------------ADJUST-----------------------------------||
const token = "1214301150:AAEKNXdF4HMa-3_Yz0Vq74cY0m7Rg3HLkX4";

const bot = new telegram(token, { polling: true });

bot.on('message', (msg) => {

    const chatId = msg.chat.id;
    console.log("New telegram message on chatId: ", chatId);

    if (msg.text == "/start") {
       
        bot.sendMessage(chatId, "DEX Pool Data is being updated. Please wait");
        bot.sendMessage(chatId, "Commands:\n/price\n/apr\n/update (run this command daily to update the farm apr and tvl values)");
    }

    if (msg.text == "/test") {
      
        bot.sendMessage(chatId, "Deploying Token contract Please wait");
    }

});

