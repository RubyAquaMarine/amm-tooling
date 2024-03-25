
const fs = require('fs');
const Router = require('express');
const FILENAME = "server/data/historical_trades.json";

//http://localhost:3000/api/v1/cg/historical_trades?start_time=1660194307&&end_time=1660247949

//http://localhost:3000/api/v1/cg/historical_trades?start_time=1660194307&&end_time=1660247949&&type=sell

const router = Router();

router.get('/', (req, res) => {
  //return pools json data 
  const timeIs = new Date().getTime();

  let data = JSON.parse(fs.readFileSync(FILENAME));

  data = data.swaps;

  let filtered;

  if (req.query) {
    // start time only
    if (req.query.start_time && !req.query.end_time) {
      let value = req.query.start_time;
      console.log("FILTER TIME", value)
      filtered = data.filter(o =>
        o?.timestamp >= value
      )
      data = filtered;
    }

    //  end time only
    if (!req.query.start_time && req.query.end_time) {
      let value2 = req.query.end_time;
      console.log("FILTER TIME", value2)
      filtered = data.filter(o =>
        o?.timestamp <= value2
      )
      data = filtered;
    }

    // start and end time
    if (req.query.start_time && req.query.end_time) {
      let value1 = req.query.start_time;
      let value2 = req.query.end_time;
      console.log("FILTER TIME (start)", value1)
      console.log("FILTER TIME (end)", value2)
      filtered = data.filter(o =>
        o?.timestamp >= value1 && o?.timestamp <= value2
      )
      data = filtered;
    }

    // filter by type (buy/sell)
    if (req.query.type) {
      let value = req.query.type;
      filtered = data.filter(o =>
        o?.type == value
      )
      data = filtered;
    }

    // resize the array as a "limiter"
    if (req.query.limit) {
      let value = req.query.limit;
      //resize data
      data.length = value;
    }
  }
 
  let dataObject = {
    result: { swaps: data },
    timestamp: timeIs
  }

  return res.send(dataObject)
});



module.exports.router = router;
