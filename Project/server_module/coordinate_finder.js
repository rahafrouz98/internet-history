//This module is used to extract the  coordinate of each cube based on the dimensioins in their metadata
//PIDs are taken from statcan website at https://www150.statcan.gc.ca/n1/en/type/data?MM=1 as following and are saved at /server_module/pids.json:

require ("./json_templates/pids.json")
let statcanApi = require("./statcan_api.js");
class CoordinateFinder
{
    PIDs = null;
    metadataCollection = {};
    getCoordinates=null;
    statcanApi = null;
    constructor()
    {
        this.getCoordinates = {
            "internetUse": (category, subcategory)=>{return this.getCoordinateForInternetUse(category,subcategory);},
            "cyberCrime": (category, subcategory)=>{return this.getCoordinateForCyberCrime(category,subcategory);},
            "eCommerce":(category, subcategory)=>{return this.getCoordinateForECommerce(category,subcategory);}
        }
        this.PIDs = require ("./json_templates/pids.json")
        this.statcanApi = require("./statcan_api.js");
    }
    //This function is used to cache the metadata of the cubes in the metadata object for later use to extract the coordinates
    async #collectAllMetaData() 
    {
        let promises=[]
        for (let name in this.PIDs) 
        {
            let tempBody = JSON.stringify([{"productId":this.PIDs[name]}]);
            let promise = statcanApi.sendRequestToStatcan(tempBody,"metadata").then((result)=>this.metadataCollection[name] = result)                                                             
            .catch( err=>{
                            console.log(err)
                            throw err;
                        }) 
            promises.push(promise)
        }
        await Promise.all(promises)
        return this.metadataCollection;
    }
    //metadata is cached to the file to be used later in finding coordinates 
    async cacheMetaData()
    {
        let fs = require("fs");
        try
        {
            await this.#collectAllMetaData();
            fs.writeFileSync(__dirname +"/cached/meta.json",JSON.stringify(this.metadataCollection, null, 2));
        }
        catch(err)
        {
            console.log("The request for medtadata to Statcan was unsuccessful. Error: " + err)
            console.log("Server will use the last cached metadata")
            this.metadataCollection = require("/cached/meta.json")  
        }     
    }

    //this function is used to extract the coordinated of the cube PID: 22100135(Internet use by province and age group) based on brovided filters
    async getCoordinateForInternetUse(geo, ageGroup)
    {
        let dimension = "";
        for(let dimensionObject of this.metadataCollection["internetUse"][0]["object"]["dimension"])
        {
            if(dimensionObject["dimensionNameEn"]=="Geography")
            {
                for( let memberObject of dimensionObject["member"])
                {
                    if(memberObject["memberNameEn"]==geo)
                    {
                        dimension += (memberObject["memberId"] + '.');
                        break;
                    }
                }
            }
            //for "Internet use from any location" which is the second member of the coordinate. There is only one memberID for this dimension object
            else if (dimensionObject["dimensionNameEn"] == "Internet use from any location")
            {
                dimension += ('1.');
            }
            else if(dimensionObject["dimensionNameEn"] == "Age group")
            {
                for (let memberObject of dimensionObject["member"])
                {
                    if(memberObject["memberNameEn"]== ageGroup)
                    {
                        dimension += (memberObject["memberId"] + '.');
                        break;
                    }
                }
            }
        }
        dimension += "0.0.0.0.0.0.0"
        return dimension;
    }

    //this function is used to extract the coordinated of the cube PID:35100153(Cyber crime in Canada) based on brovided filters
    async getCoordinateForCyberCrime(geo, violation, statistic = "Year to date data", calendarQuarter = "Q1")
    {
        let dimension = ""

        for (let dimensionObject of this.metadataCollection["cyberCrime"][0]["object"]["dimension"])
        {
            if (dimensionObject["dimensionNameEn"] == "Geography")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == geo)
                    {
                        dimension += (memberObject["memberId"] + '.');
                        break;
                    }
                }
            }
            else if (dimensionObject["dimensionNameEn"] == "Cyber-related violation")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == violation)
                    {
                        dimension += memberObject["memberId"] + '.';
                        break;
                    }
                }
            }
            else if (dimensionObject["dimensionNameEn"] == "Statistics")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == statistic)
                    {
                        dimension += memberObject["memberId"] + '.';
                        break;
                    }
                }
            }
            else if (dimensionObject["dimensionNameEn"] == "Calendar quarter")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == calendarQuarter)
                    {
                        dimension += memberObject["memberId"] + '.';
                        break;
                    }
                }
            }
        }
        dimension += "0.0.0.0.0.0";
        return dimension;
    }

    //This function is used to extract the coordinated of the cube PID:21100234(E-commerce sales in Canada) based on brovided filters
    async getCoordinateForECommerce(industry, sales)
    {
        let dimension = "1." //the first dimension is geography and e-commerce cube has only one dimension for the geography which is Canada.
        for (let dimensionObject of this.metadataCollection["eCommerce"][0]["object"]["dimension"])
        {
            if (dimensionObject["dimensionNameEn"] == "North American Industry Classification System (NAICS)")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == industry)
                    {
                        dimension += memberObject["memberId"] + '.';
                        break;
                    }
                }
            }
            else if (dimensionObject["dimensionNameEn"] == "Sales")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == sales)
                    {
                        dimension += memberObject["memberId"] + '.';
                        break;
                    }
                }
            }
        } 
        dimension += "0.0.0.0.0.0.0";
        return dimension;
    }
}
let coordinateFinder = new CoordinateFinder();

module.exports = coordinateFinder;


