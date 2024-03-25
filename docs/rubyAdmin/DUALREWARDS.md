## Setup:

1. [ ] The rewarder contract is deployed.
2. [ ] A fixed amount of your bonus token is transferred to the rewarder contract.
3. [ ] The reward rate is set on the rewarder contract. ```RubyAdmin/adjustDualRewarder.js```  function ```adjustRewarderTokenPerSec(0,"1")``` with ```pool_id``` and the ```TokenPerSecond``` string value
4. [ ] The rewarder contract is added to the pool on our MasterChefV2. Use script ```RubyAdmin/createFARMPOOL``` with function ```adjustAllocationPoints(pool_number, allocation_points, rewarder_contract_address, overwrite_rewarder)``` and include the rewarderContractAddress , bool = true (to overwrite the existing registry)
5. Users will now be able to claim double rewards when they start staking.


# Dual rewards ()
- link to contract call https://github.com/RubyExchange/backend/blob/master/contracts/RubyMasterChef.sol#L207 
- ```rewarderBonusTokenInfo(uint256 _pid)```  returns ```(address bonusTokenAddress, string memory bonusTokenSymbol``` , only ```one partner reward token``` can be assigned to one pool at a time.
- - ```SimpleRewarderPerSec``` contract aka the ```Partner Rewards``` requires a new deployment ```per``` LP pool and for each ```partnerToken``` if the reward token were to be updated/changed. 
- - if LP pool has USDP within the ```SimpleRewarderPerSec``` SC and later, the rewards are switched to ```SKL```, a new rewarder SC will need to be deployed, then run ```masterchef.set()``` with the new contract address 

# Contracts
- ```RubyMasterChef```
- ```SimpleRewarderPerSec``` requirements ```partnerToken.address``` and ```lp.address``` for the pool.  ```partnerRewardPerSec``` and ```chef.address``` required

## How It Works

The only thing you need to get this to work with MasterChefV2 is to implement a contract that conforms to the IRewarder interface.

This interface describes two functions:

```sol
interface IRewarder {
  using SafeERC20 for IERC20;

  function onRubyReward(address user, uint256 newLpAmount) external;

  function pendingTokens(address user) external view returns (uint256 pending);
}

```

- `pendingTokens` is purely for displaying stats on the frontend.

- The most important is `onRubyReward`, which is called whenever a user harvests from our MasterChefV2.

- - It is in this function where you would want to contain the logic to mint/transfer your project's tokens to the user.

- ```SimpleRewarderPerSec.sol```
- a fixed amount of reward tokens is transferred to the contract prior. Then our masterchef will
distribute it according to the reward rate set on it. This requires no coordination with your own masterchef whatsoever.

Key points:

- Easy setup, no coordination with your masterchef.
- Needs to be funded with your reward tokens beforehand.
- Once the rewarder is funded with your reward tokens, there is **no** way to get them back.

To stop:

1. Set reward rate on rewarder contract to 0.
