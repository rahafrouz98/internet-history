//this class sends request to statcan and retreive data. https://www.statcan.gc.ca/en/developers/wds/user-guide
//productIds are retrieved from the website of statcan at https://www150.statcan.gc.ca/n1/en/type/data
//https://www.sitepoint.com/delay-sleep-pause-wait/ has inspired the algorithm to create the stopper
let fs = require("fs");
class StatApi
{
    URLs ={};
    constructor()
    {
        this.URLs ={
                        "metadata" :`https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata`,
                        "vectorpoint":`https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods`
                    }
    }

    async sendRequestToStatcan(reqBody,URLName)
    {
        let URL = this.URLs[URLName];
        let options = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body:reqBody}
        try{
            //[1] is used as an array because the recursive algorithm inside  needs a reference to the original value 
            let ApiResponse = await this.#delayRequest(URL, options,[1]);
            if ( ApiResponse["status"] === 429)
            {
                throw new Error( `Request for ${tempBody} in statcan.js was unsuccessful`)
            }
            let data = await ApiResponse.json()
            return data;
        }
        catch(err){
            console.error(err)
        }
    } 
    //this function will be used to stop the code for 5 seconds 
    #stoper()
    {
        return new Promise(resolve =>setTimeout(resolve,5000));
    }
    //StatCan sometimes returns a response with status 429 (for too many requests)
    //instead of the actual data. Folloing function will be used to resend the request with delay
    async #delayRequest(URL, options,trackerArray)
    {
        let statCanResponse = await fetch(URL, options);

        if (statCanResponse["status"]===200)
        {
            return statCanResponse;
        }
        else if ( trackerArray[0] <=3 && statCanResponse["status"]===429 )
        {
            await this.#stoper();
            trackerArray[0]++
            return this.#delayRequest(URL,options, trackerArray);
        }
        else if(trackerArray[0] >3 && statCanResponse["status"]===429)
        {
            let errorMessage = `Error in statcan_endpoint for ${options["body"]}: It is tried three times and failed. Last response:` + statCanResponse
            console.log(errorMessage)
            return({"status": 429})
        }
        else
        {
            console.log(statCanResponse)
            throw new Error("Something went wrong in fetching data from Statcan")
        }
    }
}
let statcanApi = new StatApi();

module.exports=statcanApi;
