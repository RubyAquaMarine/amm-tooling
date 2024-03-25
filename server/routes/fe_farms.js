
const fs = require('fs');
const Router = require('express');
const FILENAME = "server/data/farms.json";


const router = Router();

//http://localhost:3000/api/v1/fe/farms?pair=RUBY_USDP

router.get('/', (req, res) => {

  const timeIs = new Date().getTime();

  let data = JSON.parse(fs.readFileSync(FILENAME));

  const lastUpdated = data.lastUpdated;

  console.log("lastUpdated", lastUpdated)

  data = data.frontend.farm;

  // filter out null and farmpool -1 
  const filtered = data.filter(o =>
    o !== null && o?.ID !== -1
  );

  data = filtered;
  // sort the pools 
  data.sort(function (a, b) {
    return a.ID - b.ID
  });

  // if query, match key and return that pools data
  if (req.query) {
    if (req.query.pair) {
      let farm = req.query.pair;
      console.log("DEBUG QUERY PAIR EXISTS ", req.query);
      // pass in the object and pass in the pair and find the object
      data = getFarmData(farm, data)
    }

  }

  let dataObject = {
    result: data,
    lastUpdated: lastUpdated,
    timestamp: timeIs
  }

  return res.send(dataObject)
});


// return the farm data that matches the requested pair (AMM POOL aka RUBY-USDP)
function getFarmData(matchThis, ObjectIn) {
  let tryToFind = ObjectIn.find(obj => obj?.pair === matchThis)
  return tryToFind;
}


module.exports.router = router;
