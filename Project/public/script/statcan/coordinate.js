//This module is used to extract the coordinates of the cubes based on the provided filters.

let metadata ={};
let PIDs = null;

async function fetchPIDs()
{
    try{
        let response = await fetch("/pids")
        PIDs = await response.json()
    }
    catch(err)
    {
        console.error(err)
    }
}

async function fetchMetadata()
{
    try{
        let response = await fetch("/metadata")
        metadata = await response.json()
    }
    catch(err)
    {
        console.error(err)
    }
}

//this function is used to extract the coordinated of the cube PID: 22100135(Internet use by province and age group) based on brovided filters
async function getCoordinateForInternetUse(geo, ageGroup)
{
    if (!PIDs)
    {
        await fetchPIDs()
    }
    let PID = PIDs["internetUse"]
    if (!metadata[PID])
    {
         await fetchMetadata()
    }
       
    
    let dimension = ""

    for (let dimensionElement of metadata[PID][0]["object"]["dimension"])
    {
        if (dimensionElement["dimensionNameEn"] == "Geography")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == geo)
                {
                    dimension += (memberElement["memberId"] + '.');
                    break;
                }
            }
        }
        //for "Internet use from any location" which is the second member of the coordinate
        else if (dimensionElement["dimensionNameEn"] == "Internet use from any location")
            dimension += ("1.") //the second dimension of the cube has only one member.
        else if (dimensionElement["dimensionNameEn"] == "Age group")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == ageGroup)
                {
                    dimension += memberElement["memberId"] + '.';
                    break;
                }
            }
        }
    }
    dimension += "0.0.0.0.0.0.0"
    return dimension;
}

//this function is used to extract the coordinated of the cube PID:35100153(Cyber crime in Canada) based on brovided filters
async function getCoordinateForCyberCrime(geo, violation, statistic, calendarQuarter)
{
    if (!PIDs)
    {
        await fetchPIDs()
    }
    let PID = PIDs["cyberCrime"]
    if (!metadata[PID])
    {
         await fetchMetadata()
    }
    
    let dimension = ""

    for (let dimensionElement of metadata[PID][0]["object"]["dimension"])
    {
        if (dimensionElement["dimensionNameEn"] == "Geography")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == geo)
                {
                    dimension += (memberElement["memberId"] + '.');
                    break;
                }
            }
        }
        else if (dimensionElement["dimensionNameEn"] == "Cyber-related violation")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == violation)
                {
                    dimension += memberElement["memberId"] + '.';
                    break;
                }
            }
        }
        else if (dimensionElement["dimensionNameEn"] == "Statistics")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == statistic)
                {
                    dimension += memberElement["memberId"] + '.';
                    break;
                }
            }
        }
        else if (dimensionElement["dimensionNameEn"] == "Calendar quarter")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == calendarQuarter)
                {
                    dimension += memberElement["memberId"] + '.';
                    break;
                }
            }
        }
    }
    dimension += "0.0.0.0.0.0"
    return dimension;
}

//This function is used to extract the coordinated of the cube PID:21100234(E-commerce sales in Canada) based on brovided filters
async function getCoordinateForECommerce(geo, industry, salesType)
{
    if (!PIDs)
    {
        await fetchPIDs()
    }
    let PID = PIDs["eCommerce"]
    if (!metadata[PID])
    {
         await fetchMetadata()
    }
    
    let dimension = "1." //the first dimension is geography and e-commerce cube has only one dimension for the geography which is Canada.

    for (let dimensionElement of metadata[PID][0]["object"]["dimension"])
    {
        if (dimensionElement["dimensionNameEn"] == "North American Industry Classification System (NAICS)")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == industry)
                {
                    dimension += memberElement["memberId"] + '.';
                    break;
                }
            }
        }
        else if (dimensionElement["dimensionNameEn"] == "Sales")
        {
            for(let memberElement of dimensionElement["member"])
            {
                if (memberElement["memberNameEn"] == salesType)
                {
                    dimension += memberElement["memberId"] + '.';
                    break;
                }
            }
        }
    }
    dimension += "0.0.0.0.0.0.0"
    return dimension;
}

export {getCoordinateForCyberCrime,getCoordinateForInternetUse, getCoordinateForECommerce, PIDs}

/*cheet sheet for the memberID of the dimensions. this data is extracted by console logging.
PID: 22100135:
    dimension 1 (Geography):
        1. Canada   
        2. Newfoundland and Labrador
        3. Prince Edward Island
        4. Nova Scotia      
        5. New Brunswick
        6. Quebec
        7. Ontario
        8. Manitoba
        9. Saskatchewan
        10. Alberta
        11. British Columbia
    dimension 2 (Internet use from any location):
        1. Internet use from any location
    dimension 3 (Age group):
        1. Total, 15 years and over
        2. 15 to 24 years
        3. 25 to 44 years
        4. 45 to 64 years
        5. 65 years and over
PID: 21100234:   
    dimension 1 (Geography):
        1. Canada   
    dimension 2 (North American Industry Classification System (NAICS))
        1. Spectator sports
        2. Promoters (presenters) of performing arts, sports and similar events
        3-. Agents and managers for artists, athletes, entertainers and other public figures
    dimension 3 (Sales):
        1- Total sales
        2- E-commerce sales
        3- E-commerce as a percentage of total sales
PID: 35100153:
    dimension 1 (Geography):
        1. Canada
        2. Atlantic
        3. Quebec
        4. Ontario
        5. Prairies
        6. British Columbia
        7. Territories
    dimension 2 (Cyber-related violation):
        1. Total, all violations
        2. Invitation to sexual touching
        3. Sexual exploitationchec
        4. Luring a child via a computer
        5. Voyeurism
        6. Non-consensual distribution of intimate images
        7. Extortion
        8. Criminal harassment
        9. Indecent/Harassing communication
        10. Uttering threats
        11. Other violent violations
        12.Fraud
        13. Identity theft
        14. Identity fraud
        15. Mischief
        16.Other non-violent violations
        17.Fail to comply with order
        18. Indecent acts
        19. Child sexual abuse and exploitation material
        20. Making or distributing child sexual abuse and exploitation material
        21. Corrupting morals
        22. Breach of probation 
        23. Utter threats to property or animal
        24. Offences against the personn and reputaion (Part VIII Criminal Code)
        25. Other Criminal Code 
        26. Other violations
    dimension 3 (Statistics):
        1. Quarterly data
        2.Year to date data
    dimension 4 (Calendar quarter):
        1- Q1
        2- Q2
        3- Q3
        4- Q4
    */