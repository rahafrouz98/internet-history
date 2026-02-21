//this module includes functions to extract the actual data of the cubes.
import {PIDs} from "./coordinate.js";

//This function fetches the data from the statcan API via the server for the provided coordinate and cube name.

//This function fetches the data of Internet ude cube via the server
//cubeNames are "internetUse", "cyberCrime", "eCommerce"
async function getdataeData(coordinate, cubeName)
{
    let PID = PIDs[cubeName];
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
        let statCanResponse = await fetch("/datapoint",options)
        let data = await statCanResponse.json()
        return data
    }
    catch(err)
    {
        console.error(err)
    }
}


export {getdataeData}