//this module sends request to statcan to receive actual data of the cube

let PIDs = require("./pids.json")

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
        let statCanResponse = await fetch(`https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods`, options)
        let data = await statCanResponse.json()
        return data
    }
    catch(err)
    {
        console.log(err)
        throw err;
    }
}

module.exports= {extractDataFromCube}