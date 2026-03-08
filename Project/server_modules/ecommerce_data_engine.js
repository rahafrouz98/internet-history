//it takes data from the E-Commerce cube in statcan and construct and cache a json file for it
let DataEngine = require("./data_engine.js")  

class ECommerceDataEngine extends DataEngine
{
    constructor()
    {
        super('/cached/e_commerce.json', "eCommerce","./json_templates/e_commerce_data_template.json");
    }
     //this adda labels for the data sets to be used in the charts and template engine
    labelsExtractor()
    {
        this.data["labelsObject"] = {}
        this.data["labelsObject"]["year"]= this.yearListExtractor();
        this.data["labelsObject"]["industry"]= this.categoryListExtractor();
        this.data["labelsObject"]["salesType"]=this.subcategoryListExtractor();
    }
}
                      
let eCommerceDataEngine = new ECommerceDataEngine();
module.exports= eCommerceDataEngine;