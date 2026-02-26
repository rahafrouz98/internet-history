//This module is used to extract the  coordinate of each cube based on the dimensioins in their metadata

let metadataCollection = require("./meta.json")


//this function is used to extract the coordinated of the cube PID: 22100135(Internet use by province and age group) based on brovided filters
function getCoordinateForInternetUse(geo, ageGroup)
{
    let dimension = "";

    for(let dimensionObject of metadataCollection["internetUse"][0]["object"]["dimension"])
    {
        if(dimensionObject["dimensionNameEn"]=="Geography")
        {
            for( memberObject of dimensionObject["member"])
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
            for (memberObject of dimensionObject["member"])
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
    let coordinateObj ={ "cube_name":"internetUse", "coordinate":dimension}
    return coordinateObj;
}

//this function is used to extract the coordinated of the cube PID:35100153(Cyber crime in Canada) based on brovided filters
function getCoordinateForCyberCrime(geo, violation, statistic, calendarQuarter)
{
    let dimension = ""

    for (let dimensionObject of metadataCollection["cyberCrime"][0]["object"]["dimension"])
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
    let coordinateObj ={ "cube_name":"cyberCrime", "coordinate":dimension}
    return coordinateObj;
    return dimension;
}

//This function is used to extract the coordinated of the cube PID:21100234(E-commerce sales in Canada) based on brovided filters
function getCoordinateForECommerce(industry, sales)
{
    let dimension = "1." //the first dimension is geography and e-commerce cube has only one dimension for the geography which is Canada.
    for (let dimensionObject of metadataCollection["eCommerce"][0]["object"]["dimension"])
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
    let coordinateObj ={ "cube_name":"eCommerce", "coordinate":dimension}
    return coordinateObj;
   
}
module.exports ={getCoordinateForCyberCrime,getCoordinateForInternetUse, getCoordinateForECommerce}
