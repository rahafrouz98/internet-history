document.addEventListener("DOMContentLoaded", async()=>{
    let h1 = document.querySelector("body h1")
    h1.innerHTML = JSON.stringfy(await getCoordinateByIPD("22-10-0135-01"))

})
async function getCoordinateByIPD( PID )
{
    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    //https://www.statcan.gc.ca/en/developers/wds/user-guide
    let URL = `https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata`
    let tempBody = JSON.stringify([{productId:PID}])
    let options = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body:tempBody
    }
    try {
        let response = await fetch(URL, options)
        let data = await response.json()
        return data
    }
    catch{
        throw new Error("Fetching data from CubeMetadata API is unsuccessful");
    }
}