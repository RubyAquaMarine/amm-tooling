# latest Jan 2023
- Skale Chain Owner: MSW on L1 (eth/goerli) with 1/1 therefore can use MSW cli then submit the txs via Gnosis Safe UI through the L1 MSW
- L2 MSW Skale Chain Owner: MSW with no roles originally besides marionette (connect chains and addERC20byOwner) grantRoles enabled. Does not have DEPLOYER_ADMIN_ROLE


## MSW + MS cli needed
- MSW - add -> enter marionette address , then copy/paste abi -> then function call `execute` , 
- - then select the contract address (many skale contracts to choose from) , value `0` and the spliced payload from the MSW-cli-tool


within the `MSW-cli` : grant `DEPLOYER_ADMIN_ROLE` on configController: `0xD2002000000000000000000000000000000000D2`

- cli: `$ npx msig encodeData elated-tan-skat ConfigController grantRole 0x9544cf69999ca161b850d3ca69235f410d88604f143ae3be6650b68b133a5dae 0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8`
- addressTest: `0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8`
- Marionette: `0xD2c0DeFACe000000000000000000000000000000`


- skale bug, must give role `CHAIN_CONNECTOR_ROLE` to TokenManagerLinker: `0xD2aAA00800000000000000000000000000000000`
await MessageProxyForSchain.grantRole(CHAIN_CONNECTOR_ROLE, TokenManagerLinker.address)

### DEPLOYER_ADMIN_ROLE (stagingv3)
- Marionette: `0xD2c0DeFACe000000000000000000000000000000`
- MSW : `0xD244519000000000000000000000000000000000`
- MSW-L2-Signer2: `0xa17538295A564E97662324a8735a6EBa3b850c57`


## Give address Roles
Assign an address rights to create dummy tokens and whitelist on Europa
- run script ```grantRolesTo.js``` to give a new address the ability to deploy contracts, connect new schains, and register the token for s2s transfers
- with pKey of new RoleAddress, run ```whiteListToken.js``` with function ```roleHolder``` ( this function assumes all ROLES have been assigned)
- - ```whiteListToken.js``` with function ```forOwner``` must have all ROLES already assigned. isOwner()


# Europa design
Europa has governance: ```whitelisting``` requires many additional steps to configure every token. Adding a MS to grant these roles will require additional time for each schain and token. 
- all L1 Assets are whitelisted ```depositBoxContract.addERC20TokenByOwner``` requires ```targetChainName```  and```erc20OnMainnet``` l1 token address 
- All DappChain assets are whitelisted ```l2TokenManagerContract.addERC20TokenByOwner``` requires ```targetChainName``` , ```erc20OnMainChain```, ```erc20OnSchain```.  
- - ```erc20OnMainChain``` is the token contract address ...
- - ```erc20OnSchain``` is the token contract address on ...
