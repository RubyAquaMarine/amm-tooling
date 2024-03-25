
const fs = require('fs');
const Router = require('express');
const FILENAME = "server/data/farms.json";
const FILENAME_24HR = "server/data/daily.json";

const router = Router();

router.get('/', (req, res) => {

  const timeIs = new Date().getTime();

  let data = JSON.parse(fs.readFileSync(FILENAME));

  const lastUpdated = data.lastUpdated;

  data = data.coingecko.tickers;

  // delete ss data
  data.length = data.length - 1;
  const length = data.length;



  // handle null case when a pool has no trading volume in last 24 hours
  let hilo = JSON.parse(fs.readFileSync(FILENAME_24HR));
  hilo = hilo.tickers;
  const filtered = hilo.filter(o =>
    o !== null
  );


  for (let i = 0; i < length; i++) {


    // delete stuff
    delete data[i].base_volume;
    delete data[i].target_volume;
    delete data[i].bid;
    delete data[i].ask;
    delete data[i].base_currency;
    delete data[i].target_currency;



    const id = data[i].ticker_id;



    const price = data[i].last_price;// string
    if (typeof id === 'string') {
      const daily_data = getFarmData(id, filtered);
      console.log('debug data : ', daily_data, id)
      if (typeof daily_data !== 'undefined') {
        data[i].volume = daily_data.volume;
        data[i].high = daily_data.high;
        data[i].low = daily_data.low;
        data[i].change = getPercentageChange(price, daily_data.open_price);
      }
    }
  }

  // if query, match key and return that pools data
  if (req.query) {
    if (req.query.ticker_id) {
      let pair = req.query.ticker_id;
      console.log("DEBUG QUERY PAIR EXISTS ", req.query);
      // pass in the object and pass in the pair and find the object
      data = getFarmData(pair, data)
    }

  }

  let dataObject = {
    result: data,
    lastUpdated: lastUpdated,
    timestampSr: timeIs
  }

  return res.send(dataObject)
});


// return the farm data that matches the requested pair (AMM POOL aka RUBY_USDP)
function getFarmData(matchThis, ObjectIn) {
  let tryToFind = ObjectIn.find(obj => obj.ticker_id === matchThis)
  return tryToFind;
}

// return the farm data that matches the requested pair (AMM POOL aka RUBY_USDP)
function getPercentageChange(price, last) {

  if (typeof price === 'string' && typeof last === 'string') {

    const price_now = Number(price);
    const price_last = Number(last);
    let tryToFind ;
    if(price_now > price_last ){
      tryToFind = (price_now / price_last) - 1;
    }else{
      tryToFind = 1 - (price_now / price_last);
    }

    return tryToFind.toString();
  }

  return '0.0';
}

module.exports.router = router;
