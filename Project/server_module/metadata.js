//This module is created to extract and cache (save a s a json file) the metadata of the cubes from the statcan based on the productIds and cache it in the metadata object
//it is being executed once and at the start of the server

//https://www.statcan.gc.ca/en/developers/wds/user-guide

//productIds are retrieved from the website of statcan
//https://www150.statcan.gc.ca/n1/en/type/data

const fs = require("fs")

let PIDs = {
                "cyberCrime": 35100153,  //cyber crime in canada
                "eCommerce": 21100234, //e-commerce saled in canada
                "internetUse": 22100135, //Internet use by province and age from 2018
};

async function getMetadataByPID(PID)
{
    let URL = `https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata`
    let tempBody = JSON.stringify([{productId:PID}])
    let options = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body:tempBody}
    try{
        let ApiResponse = await fetch(URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: tempBody})
        let data = await ApiResponse.json()
        return data;
    }
    catch(err){
        console.error(err)
        return err.message
    }
}  
let metadataCollection={};

//This function is used to cache the metadata of the cubes in the metadata object for later use to extract the coordinates
async function collectAllMetaData() 
{
    for (let name in PIDs) 
    {
        metadataCollection[name] = await getMetadataByPID(PIDs[name]);
    }
}

async function cacheMetaData()
{
    collectAllMetaData().then(()=>{fs.writeFileSync(__dirname +"/meta.json",JSON.stringify(metadataCollection, null, 2))}).catch(err=>{throw err;})
    fs.writeFileSync(__dirname +"/pids.json",JSON.stringify(PIDs, null, 2))
}
module.exports={cacheMetaData};



