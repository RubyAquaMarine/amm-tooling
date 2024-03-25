//node scripts/skaleadmin/deployDappTokenStaging
/*
 GOAL: Deploy tokens within 1 click

 SETUP: 
 - change the TOKEN_DEPLOYER_FACTORY address
*/




const ethers = require('ethers');
const ABI_TOKEN = require('../../abi/SkaleERC20.json')
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
const token_linker_abi = require('../../abi/skale_token_linker.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);
const schain_tokenLinker = '0xD2aAA00800000000000000000000000000000000'




const TOKEN_DEPLOYER_FACTORY = '0x75962bB3a0e014Ddd26609d39FaFb8Fa8e792291';

const TARGET_CHAIN_NAME = 'staging-weepy-fitting-caph';



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
        "name": "str1",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "str2",
        "type": "string"
      }
    ],
    "name": "_concatenateStrings",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
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


// deploys erc20 clone, wrapper, and maps l2 token to l1 mainnet token 
//UBXS Token (UBXS) 6
async function deployMainnetToken() {
  const contract = new ethers.Contract(TOKEN_DEPLOYER_FACTORY, ABI, accountOrigin);
  const test = await contract.deployMainnetToken(
    "Europa UBXS Token",
    "UBXS",
    6,
    '0xbD9d4afEdb9549817415a4e14b5712b4632Fe6B5', { gasLimit: "9000000" });

  await test.wait();
  const address = await contract.latestToken();
  console.log("token", address)
}

async function _checkTokenRoles(address) {

  const tokenContract = new ethers.Contract(address, ABI_TOKEN, accountOrigin);

  //if token contract does not have these functions

  try {
    const minterRole = await tokenContract.MINTER_ROLE();
    const burnRole = await tokenContract.BURNER_ROLE();

    if (minterRole && burnRole) {
      let hasRole = await tokenContract.hasRole(minterRole, config.skale.token_manager);
      console.log("hasMinterRole: ", minterRole, hasRole)

      hasRole = await tokenContract.hasRole(burnRole, config.skale.token_manager);
      console.log("hasBurnerRole: ", burnRole, hasRole)
    }



  } catch (error) {
    console.log("No MINTER BURNER on contract")
    return 'error';
  }

}




async function checkLatestTokenDeployment() {
  const contract = new ethers.Contract(TOKEN_DEPLOYER_FACTORY, ABI, accountOrigin);
  const admin = await contract.Deployer();
  const msw = await contract.MSW();
  console.log("ADMIN", admin, "MSW", msw)

  const address = await contract.latestToken();
  const count = await contract.getInstantiationCount(accountOrigin.address);

  const t = await contract.isInstantiation(address);//Tokens
  const wt = await contract.isInstantiationWrapper(address);//wrapperTokens

  if (t === true) {
    await _checkTokenRoles(address);
  }

  const token = new ethers.Contract(address, ABI_TOKEN, accountOrigin);
  const sym = await token.symbol();
  console.log("name of last deployed contract", sym, address)
  console.log("is Token  ", t.toString(), " | is Wrapper  ", wt.toString());

  const lengthTokens = Number(count[0]);
  const lengthWraps = Number(count[1]);

  let allTokens = [];
  let allWraps = [];
  for (let index = 0; index < lengthTokens; index++) {
    allTokens[index] = await contract.tokens(accountOrigin.address, index);
  }

  for (let index = 0; index < lengthWraps; index++) {
    allWraps[index] = await contract.wrapperTokens(accountOrigin.address, index);
  }

  console.log("all tokens ", allTokens)
  console.log("all wrapped tokens ", allWraps)

}

async function deployDappTokenAndMap() {
  const contract = new ethers.Contract(TOKEN_DEPLOYER_FACTORY, ABI, accountOrigin);

  const test = await contract.deployDappToken(
    "Nebula TGOLD",
    "TBOND",
    18,
    'staging-weepy-fitting-caph',
    '0xcC54c83C43e1c5A5d351435D313d1Cd259907E22', { gasLimit: "9000000" });

  await test.wait();
  const address = await contract.latestToken();
  console.log("token", address)
}

async function connectSchain() {
  const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, accountOrigin);
  let isConnected = await tokenManagerLinkerContract.hasSchain(TARGET_CHAIN_NAME);
  console.log("is Skale Chain connected: ", isConnected);

}


async function run() {

  //  await connectSchain(); // if chain is already connected, SC is throwing error

  // await deployMainnetToken();

  //  await deployDappTokenAndMap();

  // AFTER DEPLOYMENT : check information clear

  await checkLatestTokenDeployment();

  await _checkTokenRoles('0xaB5149362daCcC086bC4ABDde80aB6b09cBc118E')

  await _checkTokenRoles('0x54390420424b4FDE96559a9ee153574e76D60532')

}

run();

/* ok everything is working 
August 21 : https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com/tx/0xfb3355a2b34a7ce1f5238abda2d75996113b16847dc7e63b2e4906ed05adbe5c/logs
 "Nebula TGOLD",
    "TBOND",
    18,
    'staging-weepy-fitting-caph',
    '0xcC54c83C43e1c5A5d351435D313d1Cd259907E22');

 on staging europa:  0x8a9A308D2c0D3F8c0EB7272DaA13F4725843f969



 https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com/tx/0xf6692f654131e97db35dae86096ab24aaa3eb7657fa885a7c604385d55b57244/logs 
  const test = await contract.deployMainnetToken(
    "Europa HMT",
    "HMT",
    18,
    '0xd3A31D57FDD790725d0F6B78095F62E8CD4ab317', {gasLimit : "9000000"});



*/