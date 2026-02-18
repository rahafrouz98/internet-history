//this module includes functions to extract the actual data of the cubes.
import {PIDs} from "./coordinate.js";
async function getInternetUseData(coordinate)
{
    let PID = PIDs["internetUse"];
    let latestN = 20;
    let tempBody = [{
        "productId": PID,
        "coordinate": coordinate,
        "latestN": latestN}]    
    let options = 
    {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(tempBody)
    }
    try
    {
        let statCanResponse = await fetch("/internetuse",options)
        let data = await statCanResponse.json()
        return data
    }
    catch(err)
    {
        console.error(err)
    }
}




export {getInternetUseData}