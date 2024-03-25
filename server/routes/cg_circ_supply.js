
const fs = require('fs');
const Router = require ('express');
const FILENAME = "server/data/supply.json";

const router = Router();

router.get('/', (req, res) => {
 
  const timeIs = new Date().getTime();
 
  let data = JSON.parse(fs.readFileSync(FILENAME));

  let dataObject = {
    result: data,
    timestamp: timeIs
  }

  return res.send(dataObject)
});

module.exports.router = router;
