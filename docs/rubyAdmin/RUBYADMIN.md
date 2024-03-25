# RUBY TEAM 
- if masterchef runs out of rewards ```RUBY```, the ```deposit``` of new lp will fail. ```reportOnRewards.js``` includes ```RUBY``` balance of the maasterchef contract. 


Use these tools to adjust emission rates of rewards.

## Scirpts

Dual Rewards:  
- ```adjustDualRewards``` is a script that can set the tokenPerSecond emission rate without requiring the DualRewarder Contract address. 
- - This script requires only the ```pool_id``` and the ```amount``` in order to adjust the emissions. 
- - This script can also ```Kill``` emissions on all dual rewarders instantly without any inputs and set the same emission rate on all DualRewarder contracts. 
- - How to Use: Uncomment the required command within the ```run()``` function. 

MasterChef Admin Control:  
- ```adjustAdmin``` features include all admin functions for the ```masterchef``` contract and ```dual rewarder``` contract
- - ```adjustTokenPerSecondOnRewarder(rewarder_address, rewardAmount)``` emissions can also be adjusted with this script, however, the Dual rewarder contract addresses must be inputted. 
- - ```adjustTokenPerSecond(emissionRate)``` this will adjust the ```RubyPerSecond``` emissions rate. The ```total_amount``` emitted is divided proportional by the allocation Points assigned to those liquidity pools. 
- - ```adjustTreasuryFee``` valid values: 1-999: A value of 100 equals 10% of the emissions that will go to Treasury. 
- - ```adjustAllocationPoints(pool_number, allocation_points, rewarder_contract_address, overwrite_rewarder)``` use this function when ```adjusting``` the allocation Points and/or when ```updating``` the ```DualRewarder``` contract. If the Dual Rewarder contract address needs to be updated, the ```overwrite_rewarder``` = ```true```. Else, this function only adjusts the allocatoion points. 

## Allocation Points
```Allocation Points``` only control the distribution (share) percentage of ```RUBY``` to each pool. If RUBY rewards need to be turned off on a particular pool, ```adjustAllocationPoints(pool_number, 0 ...)```. If DualRewards need to be turned off, ```adjustTokenPerSecondOnRewarder(rewarder_address, 0)``` and when the rewards need to be turned on again, run ```adjustTokenPerSecondOnRewarder(rewarder_address, TokenPerSec)``` with the appropiate emission rate.  

```Scenario One:``` all pools are equal in rewards at the start.  
- each ```pool_id``` gets the same allocation point value.  It is best to start with ```a value of 1000 for each pool``` to allow greater precision of reward emissions later down the road. 
- after five pools are added, the ```Total Allocation Points``` is 5000 (1000*5) and now we can decrease the reward on a pool by lowering the value of 1000 to 500 (reduction in rewards). Calculation of rewards for this pool is now ```500/4500 = 11.11%``` and the 4 other pools with 1000 points are now allocated ```1000/4500 = 22.22%```. Before these changes, all pools received ```1000/5000 = 20.0%``` emiission allocation
- If ```allocPoints``` is decreased on one pool, the rewards are increased on the other pools. Total allocation Points decrease.
- If ```allocPoints``` is increased on any pool, the rewards are decreased on the other pools. Total Allocation Points increase. 

## Create Pools - add pair/pool
- pools need to be created within the Uniswap factory. run script ```createAMMPool``` and select the token A + B, also include the amount of tokens to deposit. Includes Pool Pricing
- after Lp token exists, a new farm pool can be registered. run script ```createFARMPool``` after editing the allocation Points, LP Token Address, and Rewarder Address. 
- - Dual Rewarder Contract can be added later by registering with ```adjustAllocationPoints``` within the ```createFARMPool``` script



