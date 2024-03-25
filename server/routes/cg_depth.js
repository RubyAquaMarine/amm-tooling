
const fs = require('fs');
const Router = require('express');
const FILENAME = "server/data/farms.json";


const router = Router();

router.get('/', (req, res) => {
  //return pools json data 
  const timeIs = new Date().getTime();

  let data = JSON.parse(fs.readFileSync(FILENAME));

  data = data.coingecko.depth;
  // if query, match key and return that pools data
  if (req.query) {
    if (req.query.ticker_id && req.query.depth) {
      let pair = req.query.ticker_id;
      console.log("DEBUG QUERY : TICKER_ID EXISTS ", req.query);
      // pass in the object and pass in the pair and find the object
      // return a percentage of the full depth
      data = getFarmData(pair, data)
      let userInputDepth = Number(req.query.depth);
      if (userInputDepth == 0) {
        // do nothing, and return the full depth
      } else {
        let adjustToDecimal = Number(req.query.depth) * 0.01;
        let depth = Number(data.positive_depth) * adjustToDecimal;
        data.positive_depth = depth.toString();
        data.negative_depth = depth.toString();
      }

    } else if (req.query.ticker_id) {
      let pair = req.query.ticker_id;
      console.log("DEBUG QUERY : TICKER_ID EXISTS ", req.query);
      // pass in the object and pass in the pair and find the object
      data = getFarmData(pair, data)

    }

  }
  // if no query, return all the pairs

  let dataObject = {
    result: data,
    timestamp: timeIs
  }

  // return res.send(Object.values(req.context.models.messages));
  // return res.send(Object.values(dataObject))
  return res.send(dataObject)
});


// return the farm data that matches the requested pair (AMM POOL aka RUBY-USDP)
function getFarmData(matchThis, ObjectIn) {
  let tryToFind = ObjectIn.find(obj => obj.ticker_id === matchThis)
  return tryToFind;
}

module.exports.router = router;
