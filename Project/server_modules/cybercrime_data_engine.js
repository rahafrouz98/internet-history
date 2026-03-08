//it takes data from the Cyber Crime cube in statcan and construct and cache a json file for it
let DataEngine = require("./data_engine.js")

class CyberCrimeDataEngine extends DataEngine
{
    constructor()
    {
        super('/cached/cyber_crime.json', "cyberCrime","./json_templates/cyber_crime_data_template.json");
    }
     //this adda labels for the data sets to be used in the charts and template engine
    labelsExtractor()
    {
        this.data["labelsObject"] = {}
        this.data["labelsObject"]["year"]= this.yearListExtractor();
        this.data["labelsObject"]["geo"]= this.categoryListExtractor();
        this.data["labelsObject"]["violation"]=this.subcategoryListExtractor();
    }
}
                      
let cyberCrimeDataEngine = new CyberCrimeDataEngine();
module.exports= cyberCrimeDataEngine;