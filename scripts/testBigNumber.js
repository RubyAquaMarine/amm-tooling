const ethers = require('ethers');
const { runInContext } = require('vm');

function test(){

    let stringValue = "100000000000000000";// 1 ether
    if( !ethers.BigNumber.isBigNumber(stringValue ) ){

        const numberValue = ethers.BigNumber.from(stringValue);

        // Takes a string input, divides by INT 1 = 10, 2 = 100, 3 = 1000
        const toDec1 = ethers.utils.formatUnits("1", 2 );// 1 turns into 0.01
        const toDec2 = ethers.utils.formatUnits("100", 1 );// 100 to 10

        // turn the string into a BigNumber
        // this will fail if the string has any decimals. even 1234.0 will fail 
        // smallest value is 1
        const amount = ethers.BigNumber.from('1');//BigNumber Object


        const a = numberValue.div(200);// 0.5%
        



        console.log("Step A: " + numberValue.toString() + "\n"+ 
        "Step B: " + numberValue.add(numberValue)  + "\n"+ 
        "Step C: " + numberValue.sub(numberValue)  + "\n"+ 
        "Step D: " + numberValue.mul(numberValue)  + "\n"+ 
        "Step E: " + numberValue.div(numberValue)  + "\n"+ 
        "Step 1: " +a.toString()
        
        
        
        );

    }

}

test();