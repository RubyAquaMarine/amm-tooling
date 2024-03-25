//frontend
const farms_fe  = require('./fe_farms');
const pools_fe = require('./fe_pools');
const stats_fe  = require( './fe_stats');
const staking_fe  = require( './fe_staking');
const lottery  = require('./lottery');
const lottery_cl  = require('./lottery_cl');
const trade_fe = require('./fe_trade');
//coingecko
const cg_pairs = require('./cg_pairs');
const cg_tickers = require('./cg_tickers');
const cg_historical_trades = require('./cg_historical_trades');
const cg_depth = require('./cg_depth');
const cg_circ_supply = require('./cg_circ_supply');

//cmc
const farms_cmc  = require('./farms_cmc');


//frontent
module.exports.farms_fe = farms_fe;
module.exports.pools_fe = pools_fe;
module.exports.stats_fe = stats_fe;
module.exports.staking_fe = staking_fe;
module.exports.lottery = lottery;
module.exports.lottery_cl = lottery_cl;
module.exports.trade_fe= trade_fe;

//coingecko
module.exports.cg_pairs = cg_pairs;
module.exports.cg_tickers = cg_tickers;
module.exports.cg_historical_trades = cg_historical_trades;
module.exports.cg_depth = cg_depth;
module.exports.cg_circ_supply = cg_circ_supply;

//cmc
module.exports.farms_cmc = farms_cmc;