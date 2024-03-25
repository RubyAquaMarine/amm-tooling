const fs = require('fs');
const Router = require('express');
const FILENAME_CL = "server/data/currentLottery.json";

const router = Router();

router.get('/', (req, res) => {
 
  const timeIs = new Date().getTime();
 
  let data = JSON.parse(fs.readFileSync(FILENAME_CL));

  const lastUpdated = data.lottery.lastUpdated;

  console.log("lastUpdated", lastUpdated)
 
  let dataObject = {
    result: data,
    lastUpdated: lastUpdated,
    timestamp: timeIs
  }

  return res.send(dataObject)
});

module.exports.router = router;