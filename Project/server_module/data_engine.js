//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all has inspired to use Promise.all() to handle multiple async functions 
//at the same time and increase the speed
//https://nodejs.org/api/modules.html#modules_commonjs_modules has inspired to export a class 

//this class is used as the parent of three other classes for extracting data from api and constructiong it in the form of json
class DataEngine
{
    data={};
    coordianteFinder = null;
    statcanApi = null;
    dataType = null;
    cachedDataPath =null;
    PIDs = null;
    constructor(cachedpath,datatype,templatepath)
    {
        this.PIDs = require ("./json_templates/pids.json")
        this.data= require(templatepath);
        this.coordinateFinder = require("./coordinate_finder.js");
        this.statcanApi = require("./statcan_api.js");
        this.cachedDataPath = cachedpath;
        this.dataType = datatype;
    }
    async loadData()
    {
        let promises=[];
        for(let category in this.data)
        {
           for( let subcategory in this.data[category])                    
           {
                let tempCoord = await this.coordinateFinder.getCoordinates[this.dataType](category, subcategory);
                let latestN = 20;
                let reqBody = JSON.stringify([{
                        "productId": this.PIDs[this.dataType],
                        "coordinate": tempCoord,
                        "latestN": latestN}])
                try
                {
                    let result = await this.statcanApi.sendRequestToStatcan(reqBody,"vectorpoint");
                    let vector = result[0]["object"]["vectorDataPoint"];
                    this.data[category][subcategory]=vector
                }
                catch(err)
                {
                    console.log(`The request for ${reqBody} in data_engine.js was unsuccessful. Error: ` + err)
                    console.log(`Server will use the last cached data`)
                    this.data = require(this.cachedDataPath)
                }
            }
        }
        await Promise.all(promises);
        this.labelsExtractor();
        //this cache the extracted data in a file and if later the Statcan was not available at the moment that server starts, 
        //server will use this file as the latest available data.
        let fs = require("fs");
        fs.writeFileSync(__dirname +this.cachedDataPath,JSON.stringify(this.data, null, 2)) 
        return this.data;
    }

     //this adda labels for the data sets to be used in the charts and template engine
    labelsExtractor()
    {
        this.data["labelsObject"] = {};
        //for child classes this part will be completed
        //subcategoryListExtractor()
        //categoryListExtractor()
        //yearListExtractor()
    }

    //this function extract the subcategory list from the data and returns in the form of an array to be used later in the template engin and charts
    subcategoryListExtractor()
    {
        let subcategoryList=[];

        for(let category in this.data)
        {
            if(category!=="labelsObject")
            {
                for(let subcategory in this.data[category])
                {
                    subcategoryList.push(subcategory);
                }
             }
             //just ittereates through one of the categories to extract subcategories
             return subcategoryList;
        }
    }
    //this function extract the category and returns in the form of an array to be used later in the template engine and charts
    categoryListExtractor()
    {
        let categoryList=[]
        //it just itterate the first array of the data to extract the existing years in it
        for(let category in this.data)
        {     
            if(category!=="labelsObject")
            {
                categoryList.push(category);
            }      
        }
        return categoryList;
    }
    //this function extract the existing years and return in the form of an array to be used later in the template engin and charts
    yearListExtractor()
    {
        let years=[]
        //it just itterate the first category and subcategory of the data to extract the existing years
        for(let category in this.data)
        {
            if(category!=="labelsObject")
            {
                for(let subcategory in this.data[category])
                {
                    for(let row of this.data[category][subcategory])
                    {
                        let tempYear = row["refPer"];
                        tempYear = tempYear.split('-')[0];
                            years.push(tempYear);
                    }
                    return  years;
                }
            }
        }
    }
}

module.exports= DataEngine;