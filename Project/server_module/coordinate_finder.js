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
    async cacheMetaData() 
    {
        try
        {
            for (let name in this.PIDs) 
            {
                let tempBody = JSON.stringify([{"productId":this.PIDs[name]}]);
                let result = await statcanApi.sendRequestToStatcan(tempBody,"metadata");
                if(!result)
                {
                    throw new Error(`fetching data for ${name} was unsuccessful`);
                }
                this.metadataCollection[name] = result;                                                            
            }
            let fs = require("fs");
            fs.writeFileSync(__dirname +"/cached/meta.json",JSON.stringify(this.metadataCollection, null, 2));
        }
        catch(err)
        {
            console.log("The request for medtadata to Statcan was unsuccessful. Error: " + err)
            console.log("Server will use the last cached metadata")
            this.metadataCollection = require("./cached/meta.json")  
        }
    }

    //this function is used to extract the coordinated of the cube PID: 22100135(Internet use by province and age group) based on brovided filters
    async getCoordinateForInternetUse(geo, ageGroup)
    {
        let coordinate = "";
        for(let dimensionObject of this.metadataCollection["internetUse"][0]["object"]["dimension"])
        {
            if(dimensionObject["dimensionNameEn"]=="Geography")
            {
                for( let memberObject of dimensionObject["member"])
                {
                    if(memberObject["memberNameEn"]==geo)
                    {
                        coordinate += (memberObject["memberId"] + '.');
                        break;
                    }
                }
            }
            //for "Internet use from any location" which is the second member of the coordinate. There is only one memberID for this dimension object
            else if (dimensionObject["dimensionNameEn"] == "Internet use from any location")
            {
                coordinate += ('1.');
            }
            else if(dimensionObject["dimensionNameEn"] == "Age group")
            {
                for (let memberObject of dimensionObject["member"])
                {
                    if(memberObject["memberNameEn"]== ageGroup)
                    {
                        coordinate += (memberObject["memberId"] + '.');
                        break;
                    }
                }
            }
        }
        coordinate += "0.0.0.0.0.0.0"
        return coordinate;
    }

    //this function is used to extract the coordinated of the cube PID:35100153(Cyber crime in Canada) based on brovided filters
    async getCoordinateForCyberCrime(geo, violation, statistic = "Year to date data", calendarQuarter = "Q1")
    {
        let coordinate = ""

        for (let dimensionObject of this.metadataCollection["cyberCrime"][0]["object"]["dimension"])
        {
            if (dimensionObject["dimensionNameEn"] == "Geography")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == geo)
                    {
                        coordinate += (memberObject["memberId"] + '.');
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
                        coordinate += memberObject["memberId"] + '.';
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
                        coordinate += memberObject["memberId"] + '.';
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
                        coordinate += memberObject["memberId"] + '.';
                        break;
                    }
                }
            }
        }
        coordinate += "0.0.0.0.0.0";
        return coordinate;
    }

    //This function is used to extract the coordinated of the cube PID:21100234(E-commerce sales in Canada) based on brovided filters
    async getCoordinateForECommerce(industry, sales)
    {
        let coordinate = "1." //the first dimension is geography and e-commerce cube has only one dimension for the geography which is Canada.
        for (let dimensionObject of this.metadataCollection["eCommerce"][0]["object"]["dimension"])
        {
            if (dimensionObject["dimensionNameEn"] == "North American Industry Classification System (NAICS)")
            {
                for(let memberObject of dimensionObject["member"])
                {
                    if (memberObject["memberNameEn"] == industry)
                    {
                        coordinate += memberObject["memberId"] + '.';
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
                        coordinate += memberObject["memberId"] + '.';
                        break;
                    }
                }
            }
        } 
        coordinate += "0.0.0.0.0.0.0";
        return coordinate;
    }
}
let coordinateFinder = new CoordinateFinder();

module.exports = coordinateFinder;


