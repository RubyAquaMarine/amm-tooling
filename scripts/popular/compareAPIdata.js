
const axios = require('axios');

const POOLS_LOCAL_URL = 'http://localhost:3000/api/v1/fe/pools';
const POOLS_PROD_URL = 'https://api.ruby.exchange/api/v1/fe/pools';

const FARMS_LOCAL_URL = 'http://localhost:3000/api/v1/fe/farms';
const FARMS_PROD_URL = 'https://api.ruby.exchange/api/v1/fe/farms';

const STATS_LOCAL_URL = 'http://localhost:3000/api/v1/fe/stats?all=0';
const STATS_PROD_URL = 'https://api.ruby.exchange/api/v1/fe/stats?all=0';


async function getDataFromHost(url) {
    const res = await axios.get(url, {

    }).then(res => {
        return res;
    }).catch(err => {
        console.log("getTokenHolders error: ", err);
    })


    if (typeof res !== 'undefined') {
        return res.data;
    }

    return;
}

// endpoints
async function pools(local_url, prod_url) {

    const local = await getDataFromHost(local_url);
    const local_length = local.result.length;
    const local_values = Object.values(local.result);

    const prod = await getDataFromHost(prod_url);
    const prod_length = prod.result.length;
    const prod_values = Object.values(prod.result);

    console.log("Compare Local Host | Pools Length | , ", local_length, prod_length)

    if (typeof prod_length === 'number' && typeof local_length === 'number' && local_length === prod_length) {
        const length = prod_length;
        for (let i = 0; i < length; i++) {

            console.log('Compare Local Host | ', local_values[i].token1.symbol, local_values[i].token0.symbol, local_values[i].tvl, " | ", prod_values[i].tvl, " | diff: ", (local_values[i].tvl - prod_values[i].tvl))
        }
    }

}

async function farms(local_url, prod_url) {

    const local = await getDataFromHost(local_url);
    const local_length = local.result.length;
    const local_values = Object.values(local.result);

    const prod = await getDataFromHost(prod_url);
    const prod_length = prod.result.length;
    const prod_values = Object.values(prod.result);

    console.log("Compare Local Host | Farms Length | , ", local_length, prod_length)

    if (typeof prod_length === 'number' && typeof local_length === 'number' && local_length === prod_length) {
        const length = prod_length;
        for (let i = 0; i < length; i++) {

            console.log('Compare Local Host | ', local_values[i].ID, local_values[i].pair," | APR ",  local_values[i].poolAPR, " | ", prod_values[i].poolAPR, " | diff ", Number(local_values[i].poolAPR) - Number(prod_values[i].poolAPR))
        }
    }


}

async function stats(local_url, prod_url) {

    // check stats
    const local = await getDataFromHost(local_url);
    const local_keys = Object.keys(local.result.stats)
    const local_values = Object.values(local.result.stats)
    const local_length = local_keys.length;

    const prod = await getDataFromHost(prod_url);
    const prod_keys = Object.keys(prod.result.stats)
    const prod_values = Object.values(prod.result.stats)
    const prod_length = prod_keys.length;

    console.log("Compare Local Host | Stats Length", local_length, prod_length)

    if (typeof prod_length === 'number' && typeof local_length === 'number' && local_length === prod_length) {
        for (let i = 0; i < prod_length; i++) {
            console.log('Compare Local Host | ', local_keys[i], " | ", local_values[i], " | ", prod_values[i], " | diff", local_values[i] - prod_values[i])
        }
    }


    // check staking
    const staking_local_keys = Object.keys(local.result.staking)
    const staking_local_values = Object.values(local.result.staking)
    const staking_local_length = staking_local_keys.length;

    const staking_prod_keys = Object.keys(prod.result.staking)
    const staking_prod_values = Object.values(prod.result.staking)
    const staking_prod_length = staking_prod_keys.length;

    console.log("Compare Local Host | Staking Length", staking_local_length, staking_prod_length)

    if (typeof staking_prod_length === 'number' && typeof staking_local_length === 'number' && staking_local_length === staking_prod_length) {
        for (let i = 0; i < staking_prod_length; i++) {
            console.log('Compare Local Host | ', staking_prod_keys[i], " | ", staking_local_values[i], " | ", staking_prod_values[i], " | diff", staking_local_values[i] - staking_prod_values[i])
        }
    }

}


async function run() {

    await pools(POOLS_LOCAL_URL, POOLS_PROD_URL).then(res => {

    }).catch(err => {
        console.log("error: ", err);
    })

    await farms(FARMS_LOCAL_URL, FARMS_PROD_URL).then(res => {

    }).catch(err => {
        console.log("error: ", err);
    })

    await stats(STATS_LOCAL_URL, STATS_PROD_URL).then(res => {

    }).catch(err => {
        console.log("error: ", err);
    })
}

run();