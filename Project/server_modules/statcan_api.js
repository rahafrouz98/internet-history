
// this class provides tools for sending request to Statcan API receive and evaluate responses. It has a delay funcion and will resend the request to the Statcan if it was overwhelmed at that moment
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
            //the parameter [1] is used as an array because the recursive algorithm inside  needs a reference to the original value 
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
                throw new Error();
            }

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

/*Stopper() coded is inspired from James Hibbard[1].

References:
[1]James Hibbard. “Delay, Sleep, Pause &#038; Wait in JavaScript”. Internet: https://www.sitepoint.com/delay-sleep-pause-wait/, 2023 [Accessed March 7th].

*/
