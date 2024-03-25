
const fs = require('fs');
const Router = require('express');
const FILENAME = "server/data/lottery.json";

const router = Router();

router.get('/', (req, res) => {
 
  const timeIs = new Date().getTime();
 
  let data = JSON.parse(fs.readFileSync(FILENAME));

  const lastUpdated = data.lastUpdated;

  console.log("lastUpdated", lastUpdated)

  // if query, match key and return that pools data
  if (req.query) {
    if (req.query.lotteryID) {
      let id = req.query.lotteryID;
      console.log("DEBUG QUERY PAIR EXISTS ", req.query);
      // pass in the object and pass in the pair and find the object
      data = searchLotteryData(id, data)
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



function searchLotteryData(matchThis, ObjectIn) {
  let tryToFind = ObjectIn.lotteries.find(obj => obj.lotteryID === matchThis)
  return tryToFind;
}


module.exports.router = router;