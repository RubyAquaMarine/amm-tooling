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

  data = data.frontend.staking;
  
  let dataObject = {
    result: data,
    lastUpdated: lastUpdated,
    timestamp: timeIs
  }

  return res.send(dataObject)
});


module.exports.router = router;
