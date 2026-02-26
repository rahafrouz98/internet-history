//The base of this template engine is taken from the week 11 of the module CM1040
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all has inspired to use Promise all
//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*

class HistoryTemplateEngine {

    #template_url = "/public/html/templates/history_template.html";
    #template ="";
    #data = {}
    #referenceLists={ "technology":[], "legislation":[]}
    constructor(data)
    {
        this.#data=data;
    }
 
    async #loadTemplate() 
    {
        try
        {
            let response = await fetch(this.#template_url);
            this.#template = await response.text();
        }
        catch(err)
        {
            throw err;
        }                                                                              
    }

    #referenceExtractor(item)
    {
        let tempReferenceList=[];
        //extract the references of content  
        item["references"].forEach(reference => {
            tempReferenceList.push(reference); 
            });
        //extract the references of images 
        item["images"].forEach(image=>{
            tempReferenceList.push(image["reference"]); 
        })
        return tempReferenceList;
    }
    #referenceColloctor()
    {
        this.#data["technology"].forEach((item)=>{
            this.#referenceLists["technology"].push(...this.#referenceExtractor(item))
        })
        this.#data["legislation"].forEach((item)=>{
            this.#referenceLists["legislation"].push(...this.#referenceExtractor(item))
        })
    }
    #referenceIndexEmbedder(item, tempTemplate, category)
    {
        let itemReferenceList = this.#referenceExtractor(item)

        tempTemplate = tempTemplate.replace(/{{r}}/g, (match) => {
            let tempIndex = this.#referenceLists[category].indexOf(itemReferenceList[0]);
            itemReferenceList.shift();
            return `[${tempIndex+1}]`;
         })

        return tempTemplate; 
    }
    //data-* is added to the elements to use them for linking them to the timeline
    #dataSetPlacer(item, tempTemplate)
    {
        tempTemplate = tempTemplate.replace(/{{#data-}}/, (match)=>{
            return `data-content=${item["id"]}`
        })
        return tempTemplate;
    }
    #yearPlacer(item, tempTemplate)
    {
        let year =""
         tempTemplate = tempTemplate.replace(/{{(#year)}}/, (match) => {
                if(item["end"])
                {
                    year = `(${item["start"]}-${item["end"]})`
                }
                else
                {
                    year = `(${item["start"]})`
                }
            
                return year;
            });
        return tempTemplate
    }

    #renderTemplate(data,category) 
    {
        //to prevent the original template from change
        let template = this.#template;
        let output= "";
        template = template.replace(/{{#items}}([\s\S]*?){{\/items}}/, (match, contentFragment)=>{
            data.forEach((item)=>{
                let tempTemplate= contentFragment;
                // Each loops (for videos and images)
                tempTemplate = tempTemplate.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, tempFragment) => {
                    const listOfThings = item[arrayName];
                    if (!listOfThings.length) {
                        return '';
                    }
                    if (arrayName === "videos" )
                    {
                        //This variable is used so it enables the program to embed multiple videos from the array of videos in each item( if there are multiple videos)
                        let tempTempFragment="";
                        //here the innerItem would be the link(string) to the video
                        listOfThings.forEach( (innerItem)=> {
                            tempTempFragment += tempFragment.replace( /{{(\w+)}}/, innerItem )
                        })
                        return tempTempFragment;
                    }
                    else if(arrayName === "images")
                    {
                        //This variable is used so it enables the program to embed multiple images from the array of videos in each item( if there are multiple images)
                        let tempTempFragment="";
                        //here the innerItem is an object that contains three elements
                        listOfThings.forEach( (innerItem)=> {
                            tempTempFragment += tempFragment.replace( /{{(\w+)}}/g, (match, imageElement)=>{
                                return innerItem[imageElement];
                            })
                        })
                        return tempTempFragment;

                    }
                });
                // Variable swapping
                tempTemplate = tempTemplate.replace(/{{(\w+)}}/g, (match, dataField) => {
                    return item[dataField];
                });

                //replace data-set
                tempTemplate = this.#dataSetPlacer(item, tempTemplate);

                //referencing
                tempTemplate = this.#referenceIndexEmbedder(item, tempTemplate, category);

                //year placing
                tempTemplate = this.#yearPlacer(item, tempTemplate);

                tempTemplate+= "\n";
                output+=tempTemplate;
            }) 
            return output;
        })
        return template;
    }
    async enginOperator()
    {
        try
        {
            await this.#loadTemplate();
            this.#referenceColloctor()
            let technologyHistoryHTML = this.#renderTemplate(this.#data["technology"], "technology");
            let legislationHistoryHTML = this.#renderTemplate(this.#data["legislation"], "legislation");
            return { "technology":technologyHistoryHTML,"legislation":legislationHistoryHTML};
        }
        catch(err)
        {
            throw err;
        }
    }
}

export{HistoryTemplateEngine}

