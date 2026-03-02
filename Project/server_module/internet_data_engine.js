//it takes data from the Internet Use in statcan and construct and cache a json file for it
let DataEngine = require("./data_engine.js")

class InterneDataEngine extends DataEngine
{
    constructor()
    {
        super("/cached/internet_use.json","internetUse", "./json_templates/internet_use_data_template.json");
    }
     //this adda labels for the data sets to be used in the charts and template engine
    labelsExtractor()
    {
        this.data["labelsObject"] = {}
        this.data["labelsObject"]["year"]= this.yearListExtractor();
        this.data["labelsObject"]["geo"]= this.categoryListExtractor();
        this.data["labelsObject"]["age"]=this.subcategoryListExtractor();
    }
}
                      
let internetUseEngine = new InterneDataEngine();
module.exports= internetUseEngine;