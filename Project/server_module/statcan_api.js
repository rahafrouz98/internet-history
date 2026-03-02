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
            let apiResponse = await this.#delayRequest(URL, options,[1]);
            let data
            if (apiResponse)
            {
                data = await apiResponse.json()
            }
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
        try
        {
            let statCanResponse = await fetch(URL, options);

            if (statCanResponse["status"]===200)
            {
                return statCanResponse;
            }
            else if ( trackerArray[0] <=3 )
            {
                await this.#stoper();
                trackerArray[0]++
                return this.#delayRequest(URL,options, trackerArray);
            }
            else
            {
                return null;
            }
            // else 
            // {
            //     let errorMessage = `Error in statcan_endpoint for ${options["body"]}: It is tried three times and failed. Last response:` + statCanResponse
            //     console.log(errorMessage)
            //     //return this code:503 as an indication that the data is unavailable for some reason.
            //     //by geting this code in the other functions in the stack, the cached files (in the /project/server_module/cached folder) will be as the 
            //     //latest available data
            //     return({"status": 503})
            // }

        }
        catch(err)
        {
            console.log("A problem has encountered with fetch function in delayRequest() function.")
            return null;
        }

    }
}
let statcanApi = new StatApi();

module.exports=statcanApi;
