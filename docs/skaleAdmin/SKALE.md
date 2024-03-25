# DepositBox 
- https://github.com/skalenetwork/skale-network/blob/5b00cae6736322f302c3a75331b19ee02b0a3596/releases/staging-v3/IMA/1.5.0-beta.0/mainnet/ima.json#L3461C35-L3461C77
- `0x2F4B31e661955d41bd6ab5530b117758C26C8159`


# 2023 Giving access to whitelist tokens from L1 to Europa 

## roles 
- TOKEN_REGISTRAR_ROLE : allows whitelists aka token mapping to other schains

what about L1 side 

DEPOSIT_BOX_MANAGER_ROLE : `0xadc0611617a946881d948c7506bdf0975adbe0cfb172896a62eb6a75f21f2ff9 `

### Steps 
The recommended process is

- l2: config controller.addToWhitelist(address), funcSig: 0xe43252d7- add an address to list that can deploy contracts

- l2:  Deploy the ERC20/ERC721/ERC1155 token contract on the SKALE chain.

- l2: Add the token to TokenManagerERC20/TokenManagerERC721/TokenManager1155 on the SKALE chain. (TokenManager Contract: 0xD2aAA00500000000000000000000000000000000)

- l2: Grant the token’s minter role to TokenManagerERC20/TokenManagerERC721/TokenManager1155 on the SKALE chain.

- l1: Add the token to DepositBoxERC20/DepositBoxERC721/DepositBox1155 on Mainnet.



# Skale network (mainnet)
The base layer is located on the Ethereum blockchain known as ```mainnet``` where several structural components exist. Lets discuss the commonly used smart contracts from a user's perspective. 

- IMA Bridge: Dedicated interface for token transfers (Lock,Mint,Burn,Release).
- - Community Pool: User deposits ```ETH``` into an unique address that has been allocated to that user. ```ETH``` is required for schain -> mainnet transfers (unlock and transfer).
- - Deposit Box: User transfers mainnet tokens to the Deposit Box contract using function ```depositERC20```.
- - TokenManager: Inter-connects ```mainnet``` and ```schain``` ecosystem to allow token transfers seemlessly. 


## IMA Bridge
IMA bridge consists of several architecture layers however for user simplicity, we will be working with two smart contracts called ```CommunityPool``` and ```DepositBox``` on the mainnet.

### Community Pool
Pass in the following parameters into the ```rechangeUserWallet``` function: schain name, user address (you can also gasUp your friends wallet), and ```ETH``` amount.

```javascript
string calldata schainName,
        address userAddress,
        uint256 amount
```
**Example code**  

- [sendEthToCommunityPool](https://github.com/RubyAquaMarine/RubyExchange-Test-Scripts/blob/main/sendEthToCommunityPool.js)
- [gasAnyWallet](https://github.com/RubyAquaMarine/RubyExchange-Test-Scripts/blob/main/GasAnyWallet.js)



### Deposit Box 
Pass in the following parameters into the ```depositERC20``` function: schain name, token address from mainnet, and the amount of tokens that you want to **bridge** over to the desired ```schain```. 

```javascript
string calldata schainName,
        address erc20OnMainnet,
        uint256 amount
```

**Example code**  
- [sendTokenToSchain](https://github.com/RubyAquaMarine/RubyExchange-Test-Scripts/blob/main/sendTokenToSchain.js)


# Skale network (schains)

## TokenManager

The skale network is a second layer ```L2``` that consists of a multichain ecosystem with interoperability. For user simplicity, we will discuss about:
- TokenManagerERC20: send L2 tokens to the appropiate TokenManager contract with function ```exitToMainERC20``` to bridge schain -> mainnet


## ExitToMain
Pass in the following parameters into the appropiate exitToMain_TokenType function to **burn** your schain tokens and **release** these assets on mainnet
```javascript
        address mainnetAddress,
        uint256 amount
```

**Example code**  
- [sendTokenToMain](https://github.com/RubyAquaMarine/RubyExchange-Test-Scripts/blob/main/sendTokenToMain.js)
