## Depth
- * required
- GET/depth 
- parameters: ticker_id(string) , depth (integer 0-100)
- example: http://localhost:3000/api/v1/cg/depth
- example: http://localhost:3000/api/v1/cg/depth?ticker_id=RUBY_USDP
- example: http://localhost:3000/api/v1/cg/depth?ticker_id=RUBY_USDP&depth=2


## Tickers
- * required
- GET/tickers
- parameters: ticker_id(string) 
- example: http://localhost:3000/api/v1/cg/tickers
- example: http://localhost:3000/api/v1/cg/tickers?ticker_id=RUBY_USDP

`
{
"ticker_id": "RUBY_USDP",
"base_currency": "USDP",
"target_currency": "RUBY",
"last_price": "0.02122517576845737",
"base_volume": "1128.6688968535163",
"target_volume": "52816.39353659244",
"bid": "0.02115442518256251",
"ask": "0.021295926354352228",
"high": "0.02171288873009468",
"low": "0.0211825054586701"
}
`

## Pairs
- * required
- GET/pairs
- parameters: ticker_id(string) 
- example: http://localhost:3000/api/v1/cg/pairs
- example: http://localhost:3000/api/v1/cg/pairs?ticker_id=RUBY_USDP


## Pairs
- * required
- GET/historical_trades
- parameters: ticker_id(string), starttime(int) , endtime(int), limit(int), type(string)
- example: http://localhost:3000/api/v1/cg/historical_trades
- example: http://localhost:3000/api/v1/cg/historical_trades?ticker_id=RUBY_USDP&&limit=100&&type=buy


