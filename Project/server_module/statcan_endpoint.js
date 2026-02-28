//this module sends request to statcan to receive actual data of the cube
//https://www.sitepoint.com/delay-sleep-pause-wait/
const { response } = require("express");
let PIDs = require("./pids.json")
let i= 0

async function extractDataFromCube(coordinateObj)
{
    let PID = PIDs[coordinateObj["cube_name"]];
    let latestN = 20;
    let tempBody = [{
        "productId": PID,
        "coordinate": coordinateObj["coordinate"],
        "latestN": latestN}]
    let options = 
    {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(tempBody)
    }
    try
    {   
        let statCanResponse = await delayRequest(options,[1]);
        let data = await statCanResponse.json();
        return data
    }
    catch(err)
    {
        console.log(err)
        throw err;
    }
}
//eventhough await is used for fetch in the extractDataFromCube(), but StatCan sometimes returns a response with status 429 (for too many requests)
//instead of the actual data. Folloing function will be used to resend the request with delay
async function delayRequest(options,trackerArray)
{
    let statCanResponse = await fetch(`https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods`, options);
    if (statCanResponse["status"]===200)
    {
        return statCanResponse;
    }
    //status 429 means too many requests and request needs to be sent again later
    else if (statCanResponse["status"]===429 && trackerArray[0] <=3 )
    {
        await hold();
        trackerArray[0]++
        return delayRequest(options, trackerArray);
    }
    else if(trackerArray[0] >3)
    {
        let errorMessage = `Error in statcan_endpoint for ${options["body"]}: It is tried three times and failed. Last response:` + statCanResponse
         console.log(errorMessage)
        return({"errorMessage": errorMessage})
    }
}
function hold()
{
    return new Promise(resolve =>setTimeout(resolve,5000));
}


module.exports= {extractDataFromCube}