
const ethers = require('ethers');
const client = require('graphql-request');

const { writeHistoricalTrades } = require('../ruby_modules/users')

const { getTokenPriceFromSymbol } = require('../ruby_modules/amm');
const { writeJsonFile, usersHoldingRuby } = require('../ruby_modules/users')
const { getSwapPrice } = require('../ruby_modules/utils')

const CONSTANTS = require('../Constants.json')
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const URL = 'https://ruby-prod-thegraph.ruby.exchange/subgraphs/name/ruby/exchange';

async function getSwapID() {

  let variables = {
    id: 'lastID'
  }

  console.log("INPUT:", variables.id)

  // sorting (orderBy: timestamp, block: { number: 688945 }) 

  const swapQuery = client.gql`
      query swapQuery($id: String!) {
        swaps ( first: 1 )
        {
          id
        }
      }
    `

  const app = new client.GraphQLClient(URL);

  const data = await app.request(swapQuery, variables).then(result => {
    return result;
  }).catch(err => {
    console.log(err)
  })

  const length = data.swaps.length;

  if (length == 0) {
    console.error("END OF DATA")
    return length;
  }


  const lastSwapID = data.swaps[length - 1].id;

  return lastSwapID;

}


async function run() {


  let id = await getSwapID();
  console.log(" debug ", id)



}

run();
