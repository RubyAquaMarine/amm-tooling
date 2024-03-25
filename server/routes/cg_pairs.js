
const fs = require('fs');
const Router = require ('express');
const FILENAME = "server/data/farms.json";

const router = Router();

router.get('/', (req, res) => {
 
  const timeIs = new Date().getTime();
 
  let data = JSON.parse(fs.readFileSync(FILENAME));

  data = data.coingecko.pairs;

  // if query, match key and return that pools data
  if (req.query) {
    if (req.query.ticker_id) {
      let pair= req.query.ticker_id;
      console.log("DEBUG QUERY PAIR EXISTS ", req.query);
      // pass in the object and pass in the pair and find the object
      data = getFarmData(pair, data)
    }

  }
 
  let dataObject = {
    result: data,
    timestamp: timeIs
  }

  return res.send(dataObject)
});


// return the farm data that matches the requested pair (AMM POOL aka RUBY-USDP)
function getFarmData(matchThis, ObjectIn) {
  let tryToFind = ObjectIn.find(obj => obj.ticker_id === matchThis)
  return tryToFind;
}

module.exports.router = router;
