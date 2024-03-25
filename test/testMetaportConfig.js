const ethers = require('ethers');
const fs = require('fs');
const FILENAME = "metaport.json";

 const metaportConfig = {
    open: false,
    openButton: true,
    mainnetEndpoint: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    network: 'staging',
    chains: [
      'fancy-rasalhague',
      'whispering-turais',
      'glamorous-grumium'
    ],
    chainsMetadata: {
      'fancy-rasalhague': {
          alias: 'Europa SKALE Chain',
          minSfuelWei: '1',
          faucetUrl: ''
      },
      'whispering-turais': {
        alias: 'Block Brawlers SKALE Chain',
      },
      'glamorous-grumium': {
        alias: 'Crypto Blades SKALE Chain',
      },
    },
    tokens: {
      "whispering-turais": {
        "erc20": {
          "BRAWL": {
            "name": "Block Brawlers",
            "address": "0x1E4234208C7f1fFA5b7E0F5E391985cb5091897D"
          },
        }
      },
      "glamorous-grumium": {
        "erc20": {
          "SKILL": {
            "name": "Skill Token",
            "address": "0x351663044247B156fdA8674A8017b51Dcb76f01F"
          },
        }
      },
      "fancy-rasalhague": {
        "erc20": {
          "RUBY": {
            "name": "Ruby Token",
            "address": "0x83B38f79cFFB47CF74f7eC8a5F8D7DD69349fBf7"
          },
          "USDP": {
            "name": "Paxos USD",
            "address": "0x76A3Ef01506eB19D6B34C4bDcF3cDcdE14F6B11E"
          },
          "DAI": {
            "name": "DAI",
            "address": "0x4C45A6F9bB79977eF655b4147C14F9f40424ef00"
          },
          "USDC": {
            "name": "Circle USD",
            "address": "0x2Fc800Cf8c219DD07866f883F8f25a346F92d07b"
          },
          "USDT": {
            "name": "Tether USD",
            "address": "0x6faFE9419e37d20A402a6Bb942808a20a5a19972"
          },
          "SKL": {
            "name": "Skale Token",
            "address": "0xb840600e735b1113050fa89a9333069eb53ae52b"
          },
          "BTC": {
            "name": "Wrapped Bitcoin",
            "address": "0x1343F90aDa7A340b2014fEDEbA7D15772D284B72"
          },
        }
      },
    },
    theme: {
      primary: '#2dcb74',
      background: '#191919',
      mode: 'dark'
    }
  } 


  async function configWrite() {

    // make json file

    let testThis = JSON.stringify(metaportConfig)
    fs.writeFileSync(FILENAME, testThis);


}



async function configRead() {

    // make json file

    // open json file 
    let data = JSON.parse(fs.readFileSync(FILENAME));
    console.log("output:", data)

}

async function run() {

    await configWrite();

    await configRead();
}

run();