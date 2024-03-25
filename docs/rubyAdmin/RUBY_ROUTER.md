
# Ruby Router 
RubyRouter contract provides an interface to swap on ```amm``` and ```stable``` pools within the same contract. The swapping parameters are defined within ```swapDetails```. Use the following examples when setting up your trade routing. Since the base token is **USDP** within the ```amm```pools any coin to coin swap will require coin -> USDP -> coin. Therefore, two ```ammSwaps```  objects must exist within the array and ```order``` must include two objects within the array. 

- simple amm swaps 

```javascript

 const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: tokenIn,
            amountOut: tokenOut,
            path: [AssetAddress.RUBY, StableAddress.USDP],
            to: rubyRouterAddress,
            deadline: expiryDate
        }
        ],
             stableSwaps: [],
        order: [SwapType.AMM]
    };
```


- coin to coin swaps 


```javascript

   const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: tokenIn,
            amountOut: tokenOut,
            path: [AssetAddress.RUBY, StableAddress.USDP],
            to: rubyRouterAddress,
            deadline: expiryDate
        },
        {
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: tokenIn2,
            amountOut: tokenOut2,
            path: [StableAddress.USDP, AssetAddress.ETH],
            to: rubyRouterAddress,
            deadline: expiryDate
        }],
        stableSwaps: [],
        order: [SwapType.AMM, SwapType.AMM]
    };
```

- coin to other stable

```javascript
    const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
             amountIn: tokenIn,
            amountOut: tokenOut,
            path: [AssetAddress.RUBY, StableAddress.USDP],
            to: rubyRouterAddress,
            deadline: expiryDate
        }
        ],
        stableSwaps: [{
            stablePool: stableSwapAddress,
            tokenIndexFrom: StableIndex.USDP,
            tokenIndexTo: StableIndex.USDC,
            dx: tokenOut2,
            minDy: usdcAmountOut,
            deadline: expiryDate
        }],
        order: [SwapType.AMM, SwapType.STABLE_POOL]
    };
```


