# RubyExchange-Test-Scripts
make keys.json
```javascript
{
    "account": {
      "privateKey": "c7d02615--",
      "privateKeyAdmin": "c7d02615--"
    }
}
```

# Run
- $ npm install  
- $ node ```createCONSTANTS.js``` or ```npm run europa``` to populate the ```Constants.json``` with the latest token pairs and stableswap data
- set ```rpc``` and ```privateKey``` within any script
- run any script from ```/scripts``` or bots from ```/robots``` 
- run rest api server : see below

# Rest API Server
- ```npm install```
- create new file ```.env``` and add ```PORT=3000``` 
- ```npm run testnet``` or ```npm run europa``` to build the Constants.json (if both networks need to run simultaneously, git clone repo in a new folder)
- ```npm run crawlers``` (collects data and runs api service)

* Daily Tasks:

- run the api-server locally, and then compare with prod - `node scripts/popular/compareAPIdata`

### Routes 
```Rest API Server```:

base url ```api/v1/``` located ```server/index.js``` at line 9  
```base/``` : 


# Node and NPM verions
node: v14.17.0
npm: 6.14.13
