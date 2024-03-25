const fs = require('fs');
const Router = require ('express');
const FILENAME = "server/data/farms.json";


const router = Router();

//http://localhost:3000/api/v1/farms?pair=RUBY-USDP

router.get('/', (req, res) => {
  //return pools json data 
  const timeIs = new Date().getTime();
 
  let data = JSON.parse(fs.readFileSync(FILENAME));

  data = data.coinmarketcap;
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
    ret_code : 200,
    ret_msg: "OK",
    ext_code: "",
    ext_info:"",
    result: {
      farms: data
    },
    timestamp: timeIs
  }

  // return res.send(Object.values(req.context.models.messages));
  // return res.send(Object.values(dataObject))
  return res.send(dataObject)
});


// return the farm data that matches the requested pair (AMM POOL aka RUBY-USDP)
function getFarmData(matchThis, ObjectIn) {
  let tryToFind = ObjectIn.find(obj => obj.pair === matchThis)
  return tryToFind;
}


module.exports.router = router;
