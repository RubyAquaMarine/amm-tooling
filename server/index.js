require('dotenv').config()
const cors = require('cors');
const express = require('express');

const routes = require('./routes');

//allow upgradable api
const URL_BASE = '/api/v1';

console.log(`port ${process.env.PORT} loaded `);

const app = express();

// * Application-Level Middleware * //

// Third-Party Middleware
app.use(cors());

// Built-In Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//
// Custom Middleware
//With multiple callback functions, it is important to provide next as an argument to the callback function
// and then call next() within the body of the function to hand off control to the next callback.

// this won't be needed (users), since this will be a public api
/*
app.use((req, res, next) => {
  req.context = {
    models,
    me: models.users[1],
  };
  next();
});
*/

// * Routes * //
//the application “listens” for requests that match the specified route(s) 
//and method(s), and when it detects a match, it calls the specified callback function.


// need function, not the object




app.use(URL_BASE  + '/farms/cmc', routes.farms_cmc.router);




//coingecko
app.use(URL_BASE  + '/cg/pairs', routes.cg_pairs.router);
app.use(URL_BASE  + '/cg/tickers', routes.cg_tickers.router);
app.use(URL_BASE  + '/cg/historical_trades', routes.cg_historical_trades.router);
app.use(URL_BASE  + '/cg/depth', routes.cg_depth.router);
app.use(URL_BASE  + '/cg/circulating_supply', routes.cg_circ_supply.router);

//frontend
app.use(URL_BASE  + '/fe/lottery', routes.lottery_cl.router);
app.use(URL_BASE  + '/fe/lotteries', routes.lottery.router);
app.use(URL_BASE  + '/fe/farms', routes.farms_fe.router);
app.use(URL_BASE  + '/fe/pools', routes.pools_fe.router);
app.use(URL_BASE  + '/fe/stats', routes.stats_fe.router);
app.use(URL_BASE  + '/fe/staking', routes.staking_fe.router);
app.use(URL_BASE  + '/fe/trade', routes.trade_fe.router);



// * Start * //

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
