
const fs = require('fs');
const Router = require ('express');
const FILENAME = "server/data/farms.json";


const router = Router();


router.get('/', (req, res) => {
  //return pools json data 
  const timeIs = new Date().getTime();
 
  let data = JSON.parse(fs.readFileSync(FILENAME));

  const lastUpdated = data.lastUpdated;

  console.log("lastUpdated", lastUpdated)

  data = data.frontend.amm;
  // if query, match key and return that pools data
  if (req.query) {
    if (req.query.pair) {
      let amm = req.query.pair;
      console.log("DEBUG QUERY PAIR EXISTS ", req.query);
      // pass in the object and pass in the pair and find the object
      data = searchPoolData(amm, data)
    }

  }
 
  let dataObject = {
    result: data,
    lastUpdated: lastUpdated,
    timestamp: timeIs
  }

  // return res.send(Object.values(req.context.models.messages));
  // return res.send(Object.values(dataObject))
  return res.send(dataObject)
});


// return the farm data that matches the requested pair (AMM POOL aka RUBY-USDP)
function searchPoolData(matchThis, ObjectIn) {
  let tryToFind = ObjectIn.find(obj => obj.pair === matchThis)
  return tryToFind;
}


module.exports.router = router;
