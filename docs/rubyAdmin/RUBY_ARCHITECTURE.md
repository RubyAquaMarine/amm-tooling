# Ruby.Exchange Architecture
This document describes the contract architecture of the Ruby Protocol.

## Introduction
Ruby.Exchange's contract architecture is composed of several different components:
  
- Generic AMM exchange (Uniswap V2-style exchange, forked from SushiSwap)  
- StablePool exchange (Curve Finance-style pool for like-assets, forked from Saddle Finance)  
- Farms (MasterChef implementation, based on SushiSwap's MasterChef design, forked from Trader Joe)  
- Ruby staking (Ellipsis.Finance staking/rewards implementation)  
- Ruby router (original implementation, aka "Intelligent Trade Router")  
- RubyToken (based on SushiToken implementation, with changes made due to bridging requirements)  

## Components
### Generic AMM Exchange  
The generic AMM is a Uniswap V2-style exchange. This is used for swapping different types of assets, based on the liquidity provided. The contracts are forked from the SushiSwap contracts repo. Some slight changes have been made:
1. ETH-related functions have been removed. Functions including addLiquidityETH, removeLiquidityETH, removeLiquidityETHWithPermit, removeLiquidityETHSupportingFeeOnTransferTokens, removeLiquidityETHWithPermitSupportingFeeOnTransferTokens, swapExactETHForTokens, swapTokensForExactETH, swapExactTokensForETH, and swapETHForExactTokens have been removed. This means that swaps cannot be initiated from ETH, and the output cannot be ETH. This is because the native token on SKALE Chains is worthless (sfuel), and the ETH token is represented as an ERC20 token. The AMM works with ERC20 tokens only.

2. Permissions for creating Pools have been added. Only a previously whitelisted actor can create liquidity pools. Anyone can add liquidity to an already created pool.
As per the original Uniswap V2 design, a fee is charged on each swap. The swap fee is set to be 0.30% of the swap amount (30 BIPS). If a protocol fee is enabled (the feeTo address is set at the UniswapV2Factory.sol contract), then: 

- 0.25% of the swap amount (83.3% of the total fee) goes to the liquidity providers.
- 0.05% of the swap amount (16.7% of the total fee) goes to the feeTo address.

In the Ruby Protocol, the ```feeTo``` address is set to the address of the **RubyMaker** contract.

## RubyMaker
The RubyMaker contract converts tokens received for fees into RUBY, and distributes 80% of the converted amount to Ruby stakers (via the RubyStaker.sol contract). The remaining 20% of the converted amount is burned.

The fee math is as follows:
1. 0.05% (1/6 of the total fee of 0.30%) are sent to the RubyMaker contract
2. 0.04% (80% of the fee) are converted to Ruby and sent to the RubyStaker contract
3. 0.01% (20% of the fee) are burned

The RubyMaker contract is a fork from the SushiMaker contract, but is modified so that it burns the converted RUBY, and also is integrated with the RubyStaker contract.

## StablePool exchange
The StableSwap pool represents a single pool for like-assets. The assets are stablecoins, specifically USDP, USDT, USDC, and Dai. 

The StablePool contracts are forked from Saddle Finance, and no changes are applied to them. The StablePool is deployed with the following parameters:  
- Tokens: USDP, USDC, USDT, and Dai  
- Initial A parameter: 200  
- Swap Fee: 0.04% (4 BPS)  
- Admin Fee: 0  

# Farm
Liquidity providers on both the AMM and StablePool can lock their LP tokens for additional rewards in RUBY tokens. This feature is enabled by the Ruby Farm. The earned RUBY rewards have a vesting period of 3 months, and are paid out by the RubyStaker contract. The vesting period for pending unvested tokens starts when a user deposits or withdraws LP tokens, or explicitly claims the pending reward tokens (deposit, withdraw, and claim functions).

The Farm feature is implemented via the RubyMasterChef contract. The RubyMasterChef contract is a fork of Trader Joe MasterChefJoeV2 contract, which is based on Sushi's MasterChef contracts.

The MasterChef contracts supports double farm rewards. For each pool a separate rewarder could be specified with its own logic, implementing the IRewarder interface.
The double rewards (if a rewarder is set for the pool) are minted upon interaction with the deposit and withdraw functions.

Changes are made from the Trader Joe MasterChef contract:
1. Only a single fee recipient is present in our MasterChef (treasuryAddr), and the fee to the fee recipient is specified via the treasuryPercent variable. Thus the LP percent when calculating RUBY rewards is dependent only on the treasuryPercent variable.
2. The RubyMasterChef contract needs to be pre-seeded with RUBY tokens in order to pay RUBY rewards. RubyMasterChef transfers RUBY tokens upon reward triggers, but does not mint them. This is because the RUBY token will be launched on Ethereum mainnet, and then bridged over to the S-Chain. The IMA bridge will be used for this. The IMA bridge works by minting and burning tokens. Thus the IMA bridge contracts need to be assigned minter role to the RUBY token contract. Having multiple minters could leave to insolvencies in our case.
3. RubyMasterChef is made to work in collaboration with the RubyStaker contract. Upon claiming RUBY rewards (that is when withdraw, deposit and claim functions are called), the mint function on the RubyStaker contract is called with the user's address and amount that needs to be rewarded. After that the amount of RUBY that needs to be sent is transferred to the RubyStaker contract. All of this is done by the _mintRubyRewards internal function.
4. Additional admin/management functions have been added, for:
- Updating the address of the RubyStaker
- Emergency withdrawal of RUBY tokens

# Ruby Staking
The Ruby Protocol features staking and locking functionality, which allows the users (RUBY holders) to stake and lock their tokens, and earn platform rewards. The staking and locking feature is forked from Ellipsis Finance's EpsStaker contract.  

The staking and locking functionality is implemented by the RubyStaker contract. Additionally the rewards from RubyMasterChef are paid by the RubyStaker contract.  
The lock period is 13 weeks.  

Users who stake their tokens earn trading fees from the AMM exchange (the fee that is distributed via the RubyMaker contract), and will also earn trading fees from the StablePool in the future.  

Users who lock their tokens earn the same fees, but additionally they earn the penalty rewards, which are collected from users who do not want to wait for their RubyMasterChef rewards to fully mature.  

User rewards from the RubyMasterChef contract have a 3 month lock period, from the moment they are "set for vesting". The rewarded users can choose not to wait for 3 months and claim the rewarded tokens before that time, for a 50% penalty fee. If a user chooses not to wait, they will only be able to claim 50% of the rewarded tokens instantly, and the other half will be distributed to users who have locked their tokens. The penalty amount is streamed to the locked users in the subsequent one week (rewardsDuration).  

The following changes have been made from Ellipsis Finance's EpsStaker contract:  

1. rewardDistributors mapping has been changed because we have two different types of rewards with the same reward token (RUBY). The first type of rewards are the RUBY rewards from the RubyMasterChef contract, while the second type of rewards are from the RubyMaker contract and RubyFeeSwapper (in the future).
2. rewardToken has been added to the Reward structure, for the same reason as above.
3. setRewardMinter function has been added as the rewardMinter has not been set in the constructor. Also there is only one rewardMinter in our architecture. The rewardMinter is the RubyMasterChef contract.
4. Changes in the code to accommodate the rewardDistributors change, so that uint256 rewardIds are used instead of reward token addresses.  
  
# Ruby Router  
The Ruby Protocol enables swapping between different types of pools in a single transaction. Swaps between the AMM pools (Uniswap V2 pools) and the StablePools are enabled by using the RubyRouter contract. The RubyRouter contract receives swap parameters which contain which swaps need to be executed and their order. All of the slippages for the swaps are calculated outside the contract, and the contract is just fed with the swap orders it needs to execute. The algorithm for the swaps that need to be executed, and their order, is calculated on our frontend. There are four different types of swaps enabled:  

- AMM only, e.g. ETH -> USDP (leveraging the UniswapV2Router only)
- StablePool only, e.g. USDC -> USDT (leveraging the StablePool only)
- AMM to StablePool, e.g. ETH -> USDC (leveraging the UniswapV2Router and the StablePool)
- StablePool to AMM, e.g. USDT -> ETH (leveraging the StablePool and the UniswapV2Router).

Currently the base token on the AMM is USDP, and everything is routed through it. For example, for the ETH -> USDC swap, the route looks like:

**Swaps:** 
- ETH -> USDP (AMM)
- USDP -> USDC (StablePool)

**Execution order:**
- [AMM, StablePool]

# Ruby Token (RUBY)  
The Ruby Token (token_mappings/RubyToken.sol) is the implementation of the Ruby token on the S-Chain. The RubyTokenMainnet.sol is the implementation on Ethereum mainnet.  
  
Upon launch on mainnet, the total supply of the token (200 million) will be minted to the deployer.  
 
The implementation on the S-Chain is based on the SushiToken, but a few things are different:
1. AccessControl is implemented instead of Ownable. DEFAULT_ADMIN_ROLE is set to the deployer, while MINTER and BURNER roles should be set to the IMA bridge contracts by the deployer. The BURNER role should be set to the RubyMaker too, so that fee tokens can be burned.
2. Only the IMA bridge can mint tokens and IMA Bridge and the RubyMaker contract can burn tokens.

## Forked Codebase (Versions):  

- SushiSwap: https://github.com/sushiswap/sushiswap/tree/bef474629c6ab75f0efc511234f32d760db241aa 
- Saddle Finance: https://github.com/saddle-finance/saddle-contract/tree/6f37f97b9600196c75416e2f579165e74906eb76
- Trader Joe: https://github.com/traderjoe-xyz/joe-core/tree/ec25d93533427328c576c38e7987485ba0ffd27d
- Ellipsis.Finance: https://github.com/ellipsis-finance/ellipsis/tree/6bdf7788020695b72034f5c9f1fda11c5e3cefb7


# Ruby Exchange 
Differences in codebase from uniswap
- ```getAmountsOut``` requires 3 inputs instead of 2 (uniswap)
```
{
                "internalType": "uint256",
                "name": "feeMultiplier",
                "type": "uint256"
}
```
- get user fee from ```rubyNFT```
```
const routerContract = new ethers.Contract(ammRouterAddress, routerABI, account);
    let nftAdmin = await routerContract.nftAdmin();
    const nftContract = new ethers.Contract(nftAdmin, nftABI, account);
    let fee= await nftContract.calculateAmmSwapFeeDeduction(account.address)
    console.log("DEBUG swapFee ", fee.toString()) 
```
