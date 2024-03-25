
const client = require('graphql-request')

const URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';

const variables = null;
async function testRuby() {

    const query = client.gql`{bundle(id: 1){id ethPrice}}`
    
    const app = new client.GraphQLClient(URL);

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
