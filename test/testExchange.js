
const client = require('graphql-request')

/*
import { GraphQLClient, gql } from 'graphql-request'
const query = gql`{
  hero {
    name  
  }
}`
const client = new GraphQLClient('<graphql-endpoint>')
const data = await client.request(query)
*/



//https://ruby-dev-thegraph.ruby.exchange/subgraphs/name/ruby/exchange/graphql
//https://ruby-prod-thegraph.ruby.exchange/subgraphs/name/ruby/exchange/graphql


//request(`${GRAPH_HOST[chainId]}/subgraphs/name/${RUBYROUTER[chainId]}`, query, variables)
const URL = 'https://ruby-prod-thegraph.ruby.exchange/subgraphs/name/ruby/exchange';

const variables = null;
async function testRuby() {

    const query = client.gql`{
      users(first:10){
        id
        liquidityPositions {
          id
        }
      }
    }`

    const app = new client.GraphQLClient(URL, {
      headers: {
        authorization: 'Bearer MY_TOKEN',
      },
    });

    const data = await app.request(query,variables).then(result=>{
        return result;
    }).catch(err=>{
        console.log(err)
    })

    console.log(data)
   
}


async function run() {

   
    await testRuby();
}

run();
