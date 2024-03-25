const fs = require('fs');
const Router = require('express');
const FILENAME = "server/data/farms.json";
const FILENAME2 = "server/data/stats.json";

const router = Router();//http://localhost:3000/api/v1/fe/stats?all=0

router.get('/', (req, res) => {

  const timeIs = new Date().getTime();
  const stats = JSON.parse(fs.readFileSync(FILENAME2));
  const farms = JSON.parse(fs.readFileSync(FILENAME));

  const lastUpdated = farms.lastUpdated;

  console.log("lastUpdated", lastUpdated)

  const staking = farms.frontend.staking;
  const data = farms.frontend.stats;
  let collectObj = data; 

  let reformat = {
    tvl: data.stats.tvl,
    price: data.stats.price,
    burned: data.stats.burned,
    volume: stats.total_trade_volume,
    fees: stats.total_fees
  }

  if (req.query) {
    if (req.query.all) {

      reformat = {
        tvl: data.stats.tvl,
        price: data.stats.price,
        burned: data.stats.burned,
        volume: stats.total_trade_volume,
        fees: stats.total_fees,
        //extra
        volume_amm: stats.amm_trade_volume,
        volume_stableswap: stats.ss_trade_volume,
        fees_amm: stats.amm_fees,
        fees_stableswap: stats.ss_fees,
        total_trades: stats.total_trades
      }

    }
  }
 
  // handle null case 
  const filteredPools = collectObj.topPools.filter(o =>
    o !== null
  );

  let sorted_pools = filteredPools.sort(function (a, b) {
    return b.tvl - a.tvl;
  });

  const filteredFarms = collectObj.topFarms.filter(o =>
    o !== null
  );

  let sorted_farms = filteredFarms.sort(function (a, b) {
    return b.apr - a.apr;
  });

  collectObj.topFarms = sorted_farms;
  collectObj.topPools = sorted_pools;
  collectObj.stats = reformat;
  collectObj.staking = staking;

  let dataObject = {
    result: collectObj,
    lastUpdated: lastUpdated,
    timestamp: timeIs
  }

  return res.send(dataObject);

});

module.exports.router = router;
