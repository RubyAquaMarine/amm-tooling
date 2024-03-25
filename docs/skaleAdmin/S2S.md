# latest Skale S2S Mapping guide
- Origin Token ```address``` is used on both chain rpcs within the ```sendERC20ToChain``` && ```transferToSchainERC20``` SC calls. 
-- The target token ```address``` is only required within the SC call params on the target chain to check the users balance before IMA-Bridge transfer to origin chain. 
- addERC20ByOwner is only handled on the target chain. 






 
