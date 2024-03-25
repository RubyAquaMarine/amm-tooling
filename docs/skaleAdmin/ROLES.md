
# Skale chain access control
[docs](https://github.com/skalenetwork/docs.skale.network/blob/1b80628012e8612fe15096e0aaf5b26d0ba5bcf4/components/develop/modules/ROOT/pages/skale-chain-access-control.adoc)

## Roles

| ROLE | Location| Usecase |
|----------|----------|----------|
| ALLOCATOR_ROLE | FileStorage | allow new address to deploy to filestorage | 
| CHAIN_CONNECTOR_ROLE | TokenManagerLinker | to connect a new schain to Europa | 
| DEFAULT_ADMIN_ROLE | | |
| DEPLOYER_ADMIN_ROLE |ConfigController  awqs | |
| DEPLOYER_ROLE | ConfigController | allow new address to deploy smart contracts |
| MTM_ADMIN_ROLE | ConfigController | allow multiple transactions from the same wallet | 
| REGISTRAR_ROLE | TokenManagerLinker | connect to new skale chain|
| TOKEN_REGISTRAR_ROLE| TokenManager | add new tokens to ima-bridge |

## Skale Default Contracts 
- ConfigController: `0xD2002000000000000000000000000000000000D2`
- Etherbase: `0xd2bA3e0000000000000000000000000000000000`
- FileStorage: `0xD3002000000000000000000000000000000000d3`
- Marionette: `0xD2c0DeFACe000000000000000000000000000000`
- TokenManagerLinker: `0xD2aAA00800000000000000000000000000000000`
- TokenManager: `0xD2aAA00500000000000000000000000000000000`


## Role Hash
1. DEFAULT_ADMIN_ROLE →
0x1effbbff9c66c5e59634f24fe842750c60d18891155c32dd155fc2d661a4c86d
0x0000000000000000000000000000000000000000000000000000000000000000
2. DEPLOYER_ADMIN_ROLE →
0x9544cf69999ca161b850d3ca69235f410d88604f143ae3be6650b68b133a5dae
3. DEPLOYER_ROLE →
0xfc425f2263d0df187444b70e47283d622c70181c5baebb1306a01edba1ce184c
4. MTM_ADMIN_ROLE →
0x4a674ad8ca91697aae9afc0f1850245e64feae02b627092a64943ed941e4d09f
5. ALLOCATOR_ROLE → 68bf109b95a5c15fb2bb99041323c27d15f8675e11bf7420a1cd6ad64c394f46
6. CHAIN_CONNECTOR_ROLE → 2785f35fe7d8743aa971942d8474737bb31895d396eff2cc688a481e0221e191

## some predeployed skale contracts have roles 
- DEPLOYER_ADMIN_ROLE, only ```marionette``` user flow: L1 MSW -> Marionette -> ConfigController.addToWhitelist()

## assign roles to contracts
- MINTER and BURNER role: After token contract deployment the roles are reassigned to the TokenManager 