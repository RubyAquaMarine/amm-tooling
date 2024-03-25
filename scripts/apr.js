const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const stakerABI = require('../abi/rubyStaker.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);

const DAILY_VOLUME = 100000;
const RUBY_PRICE = '0.699'

const rubyStakerAddress = config.ammv2.stake;

async function rubyStakerTVL() {
    const stakerContract = new ethers.Contract(rubyStakerAddress, stakerABI, account);
    let totalSupply = await stakerContract.totalSupply()                        // Total Supply of RUBY locked within the contract
    let lockedTotalSupply = await stakerContract.lockedSupply()

    // format ruby 
    let numberOfRUBY = ethers.utils.formatUnits(totalSupply, 18)    
    console.log("RUBY staked: ", numberOfRUBY)

    //Big Numbers
    let x = ethers.utils.parseUnits(RUBY_PRICE, 'ether')                // ENTER RUBY PRICE
    let y = ethers.utils.parseUnits(numberOfRUBY, 'ether')

    // Create the ruby price (later use pair Reserves for pricing)
    let x_ = ethers.utils.formatUnits(x, 18)    
    console.log("RUBY Price: ", x_)

    let tvl = y.mul(x)
    // both values need to be formatted , use value 36
    let tvl_ = ethers.utils.formatUnits(tvl,36)    
    let tvl_out = numberOfRUBY*x_;
    console.log("TVL: $", tvl_)

    return tvl_out

}

async function createDailyRevenue(dailyVolume){
    //100 , 4 cents for every 100 USD of trading volume
    let times = dailyVolume / 100;
    let rev = times * 0.04;
    console.log("Daily Revenue: $", rev )

    return rev
}

async function usersShare(){

    const stakerContract = new ethers.Contract(rubyStakerAddress, stakerABI, account);
    let totalBalance = await stakerContract.totalBalance(account.address)
    let totalSupply = await stakerContract.totalSupply()                        // Total Supply of RUBY locked within the contract

    let share = ethers.utils.formatUnits(totalBalance,18)   
    let share_ = ethers.utils.formatUnits(totalSupply,18)   

    console.log(" Users Balance ", share )
    console.log(" Total ", share_ )
    console.log(" Users share percentage ", share/ share_ )

}


async function run(){
   
    console.log("Daily Trading volume on average: ",DAILY_VOLUME )

    let ann = await createDailyRevenue(DAILY_VOLUME ) * 365;// total rev over 1 year

    console.log("Annual Revenue: $", ann)

    let apr = ann / await rubyStakerTVL()

    console.log("ANNUAL PERCENTAGE ON RETURN ", apr)

    await usersShare()

}

run();