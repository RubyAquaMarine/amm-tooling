// https://stackoverflow.com/questions/64057199/how-to-change-the-status-of-a-discord-js-bot ( 2 years ago)
const { Client, ActivityType, GatewayIntentBits, REST, Routes } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const config = require('../../setConfig.json');

const COMMANDS = require('./commands');
const commands = COMMANDS.getCommands;

const TOKEN = config.discord.bot_id;
const CLIENT_ID = '1052514538932674570';

console.log(`Logged in with token: ${TOKEN}!`);

let amm_ruby_rubyusd = 0, amm_ruby_btcusd = 0, amm_ruby_ethusd = 0, amm_ruby_sklusd = 0;

const rest = new REST({ version: '10' }).setToken(TOKEN);

let PRICES;

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
		console.log('Successfully reloaded application (/) commands.');
		PRICES = "AMM Pools |" + (await COMMANDS.getPrice());
		console.log('Successfully reloaded AMM Pool prices.', PRICES);

	} catch (error) {
		console.error(error);
	}
})();

/*

Discord Bot running below

*/

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

	// get Ruby price and set in the value below 
	const priceRuby = '0.038';
	const priceSKL = '0.026';
	const priceETH = '1543.65';
	const priceBTC = '21345.86';
	const priceSKILL = '0.75';

	const messageBack = PRICES;
	const messageOld = ` AMM Pools : |$${priceRuby} RUBY |$${priceSKL} SKL |$${priceBTC} BTC |$${priceETH} ETH |$${priceSKILL} SKILL `;

	client.user.setPresence({
		activities: [{ name: messageOld, type: ActivityType.Watching }],
		status: 'ok',//dnd do not distrub
	});

});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}

	if (interaction.commandName === 'price') {
		// fetch data
		const messageBack = await COMMANDS.getPrice();

		client.user.setPresence({
			activities: [{ name: messageBack, type: ActivityType.Watching }],
			status: 'dnd',
		});

		// textChannel
		await interaction.reply(messageBack);
	}

	if (interaction.commandName === 'apr') {

		// fetch data
		const FARMS_PROD_URL = 'https://api.ruby.exchange/api/v1/fe/farms';
		const data = await COMMANDS.getDataFromHost(FARMS_PROD_URL)
		let messageBack = '';
		data.result.forEach(element => {
			if (typeof element.pair !== 'undefined') {
				messageBack += element.pair + " | APR: " + element.poolAPR + "%\n";
			}
		});

		await interaction.reply(messageBack);
	}

	if (interaction.commandName === 'edit') {

		console.log(interaction)

		await interaction.reply('edit in progress!');
	}



});

client.on('message', message => {

	console.log("message: ", message.content)

	if (message.content === '.edit') {
		// Get the channel to be edited
		const channel = message.channel;
		// Change the channel name
		channel.setName('RUBY Price : 1.234')
			.then(console.log)
			.catch(console.error);
	}
});

client.login(TOKEN);