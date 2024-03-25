const axios = require('axios');
const Num = require('numeral');

const getCommands = [
	{
		name: 'ping',
		description: 'Replies with Pong!',
	},
	{
		name: 'price',
		description: 'Replies with Ruby.Exchange AMM Pool Price!',
	},
    {
		name: 'apr',
		description: 'Replies with Ruby.Exchange Farm APR!',
	},
    {
		name: 'edit',
		description: 'Test!',
	},
];

async function getDataFromHost(url) {
    const res = await axios.get(url, {

    }).then(res => {
        return res;
    }).catch(err => {
        console.log("getTokenHolders error: ", err);
    })


    if (typeof res !== 'undefined') {
        return res.data;
    }

    return;
}

async function getPrice(){
	// fetch data
	const POOLS_PROD_URL = 'https://api.ruby.exchange/api/v1/fe/pools';
	const data = await getDataFromHost(POOLS_PROD_URL)

	data.result.forEach(element => {
		//RUBY
		if (element.token0.symbol === "RUBY") {
			amm_ruby_rubyusd = Num(element.poolPrice).format('0.0000');
		}
		if (element.token1.symbol === "RUBY") {
			amm_ruby_rubyusd = Num(element.poolPrice).format('0.0000');
		}
		//ETH
		if (element.token0.symbol === "ETHC") {
			amm_ruby_ethusd = Num(element.poolPrice).format('0.0000');
		}
		if (element.token1.symbol === "ETHC") {
			amm_ruby_ethusd = Num(element.poolPrice).format('0.0000');
		}
		//BTC
		if (element.token0.symbol === "WBTC") {
			amm_ruby_btcusd = Num(element.poolPrice).format('0.0000');
		}
		if (element.token1.symbol === "WBTC") {
			amm_ruby_btcusd = Num(element.poolPrice).format('0.0000');
		}
		//SKL
		if (element.token0.symbol === "SKL") {
			amm_ruby_sklusd = Num(element.poolPrice).format('0.0000');
		}
		if (element.token1.symbol === "SKL") {
			amm_ruby_sklusd = Num(element.poolPrice).format('0.0000');
		}
		//SKILL
		
		if (element.token0.symbol === "SKILL") {
			amm_ruby_skillusd = Num(element.poolPrice).format('0.0000');
		}
		if (element.token1.symbol === "SKILL") {
			amm_ruby_skillusd = Num(element.poolPrice).format('0.0000');
		}
		
	});

	const messageBack = "RUBY | $" + amm_ruby_rubyusd
		+ "\nETH | $" + amm_ruby_ethusd
		+ "\nBTC | $" + amm_ruby_btcusd
		+ "\nSKL | $" + amm_ruby_sklusd
		+ "\nSKILL | $" + amm_ruby_skillusd;

		return messageBack;
}

module.exports.getDataFromHost = getDataFromHost;
module.exports.getPrice = getPrice;
module.exports.getCommands = getCommands;