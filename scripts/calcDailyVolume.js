const ethers = require('ethers');
const fs = require('fs');
const FILENAME = "./server/data/historical_trades.json";


async function calcDaily(sortByPair) {

    let data = JSON.parse(fs.readFileSync(FILENAME));
    data = data.swaps;


    // 24 hour window
    const endTime = new Date().getTime() / 1000;
    const subTime = ((60 * 60) * 24) * 1; // in seconds
    const startTime = endTime - subTime;
    const time_end = endTime.toFixed(0);
    const time_start = startTime.toFixed(0);

    // filter by time and ticker
    let filtered = data.filter(o =>
        Number(o?.timestamp) >= Number(time_start) && Number(o?.timestamp) <= Number(time_end) && o?.ticker_id == sortByPair
    )

    data = filtered;

    const loop = data.length;
    // now add up all the base and target volume
    let base = 0;
    let target = 0;
    let total_volume = 0;
    let highest = 0; let max;
    let lowest = 0; let min;

    if(loop<=0 || loop == undefined || loop == null){
        console.log("No trades within the last 24 hours for ticker_id:", sortByPair)
        return;// no trades
    }

    for (let i = 0; i < loop; i++) {
        base += Number(data[i].base_volume);
        target += Number(data[i].base_volume);
        total_volume += Number(data[i].usd_volume);
        if (max == null || parseFloat(data[i].price) > parseFloat(max))
            max = parseFloat(data[i].price);

        if (min == null || parseFloat(data[i].price) < parseFloat(min))
            min = parseFloat(data[i].price);
    }

    highest = max;
    lowest = min;

    let obj = {};
    if (max != undefined && min != undefined) {
        obj = {
            ticker_id: sortByPair,
            hr24_volume: total_volume.toFixed(2),
            hr24_high: highest.toString(),
            hr24_low: lowest.toString()
        }

    }

    console.log(obj)
}

async function run() {
    //24 hour volume and high/low
    await calcDaily('RUBY_USDP');
    await calcDaily('WBTC_USDP');
    await calcDaily('ETHC_USDP');
    await calcDaily('SKL_USDP');

}

run();
