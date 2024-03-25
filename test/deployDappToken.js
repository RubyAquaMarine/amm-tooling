const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewarder = require('../ruby_modules/rewarder.js');

const ABI_TOKEN = require('../abi/SkaleERC20.json')


const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);

// READ
// has roles 0x1de2ae2e60f7cb9757A2353Bc1BaA34C74763248 aka deployDappTokenAndMap
// latest SC but no assigned roles 0x552F57296FA143FcA7844299eE887De43f7412F2 aka deployMainnetToken

const CONTRACT_ADDRESS = '0x1de2ae2e60f7cb9757A2353Bc1BaA34C74763248';
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_admin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "instantiation",
        "type": "address"
      }
    ],
    "name": "ContractInstantiation",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "Deployer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MSW",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TokenManager",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TokenManagerLinker",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_chainName",
        "type": "string"
      }
    ],
    "name": "connectToChain",
    "outputs": [
      {
        "internalType": "bool",
        "name": "_isConnected",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_decimal",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_fromChainName",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_fromToken",
        "type": "address"
      }
    ],
    "name": "deployDappToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_decimal",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_fromChainName",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_fromToken",
        "type": "address"
      }
    ],
    "name": "deployDappTokenV2",
    "outputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_decimal",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_fromChainName",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_fromToken",
        "type": "address"
      }
    ],
    "name": "deployMainnetToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_wrapperTokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "getInstantiationCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_chainName",
        "type": "string"
      }
    ],
    "name": "isConnected",
    "outputs": [
      {
        "internalType": "bool",
        "name": "_isConnected",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isInstantiation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isInstantiationWrapper",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "latestToken",
    "outputs": [
      {
        "internalType": "contract ERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tokens",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "wrapperTokens",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// deploys wrapper also (doesn't require ROLES since no mapping or chain connecting is required)
// the chainname "mainnet" is not used within the SC at this point because there is no way to register the token from L2 side
async function deployMainnetToken() {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, accountOrigin);
  const test = await contract.deployMainnetToken(
    "deployMainnetToken",
    "DMT",
    18,
    'mainnet',
    '0x1b6bb3B35FD99dAe22DdE37823CA30f6F5E1E1B4');

  await test.wait();
  const address = await contract.latestToken();
  console.log("token", address)
}

// testing function: not prod
async function deployToken() {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, accountOrigin);
  const test = await contract.setGreeting(
    "tokenTest",
    "TNT",
    18);

  await test.wait();
  const address = await contract.latestToken();
  console.log("token", address)
}

async function assignRoleToToken() {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, accountOrigin);
  const address = await contract.latestToken();
  const tokenContract = new ethers.Contract(address, ABI_TOKEN, accountOrigin);
  const minterRole = await tokenContract.MINTER_ROLE();
  const hasRole = await tokenContract.hasRole(minterRole, config.skale.token_manager);
  console.log("hasMintRole: ", minterRole, hasRole)


  //  if (hasRole === false) {
  //      const res = await tokenContract.grantRole(minterRole, config.skale.token_manager);
  //      await res.wait(1);
  //    }

  const setRole = await contract.setRoles(address);
}

// older SC
async function latestToken() {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, accountOrigin);
  const admin = await contract.Deployer();
  const msw = await contract.MSW();
  console.log("ADMIN", admin, "MSW", msw)

  const address = await contract.latestToken();

  const token = new ethers.Contract(address, ABI_TOKEN, accountOrigin);
  const sym = await token.symbol();
  console.log("name of last deployed contract", sym, address)

}

// Latest Smart contract
async function latestTokenV2() {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, accountOrigin);
  const admin = await contract.Deployer();
  const msw = await contract.MSW();
  console.log("ADMIN", admin, "MSW", msw)

  const address = await contract.latestToken();
  const count = await contract.getInstantiationCount(accountOrigin.address);
  const t = await contract.isInstantiation(address);//Tokens
  const wt = await contract.isInstantiationWrapper(address);//wrapperTokens
  console.log("is Token| ", t.toString(), "is Wrapper | ", wt.toString());
  console.log(" Deployed Count: ", count.toString());

  const token = new ethers.Contract(address, ABI_TOKEN, accountOrigin);
  const sym = await token.symbol();
  console.log("name of last deployed contract", sym, address)

}

async function deployDappTokenAndMap() {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, accountOrigin);

  const test = await contract.deployDappToken(
    "Wrap WBOND",
    "WWBOND",
    18,
    'staging-weepy-fitting-caph',
    '0x6747eA6B1D2Df8C0b3C3fBB0B2dECb136b984320');

  await test.wait();
  const address = await contract.latestToken();
  console.log("token", address)
}


async function run() {

  await deployDappTokenAndMap();


  await latestToken();

}

run();