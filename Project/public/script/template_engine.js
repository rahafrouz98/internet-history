//The base of this template engine is taken from the week 11 of the module CM1040
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all has inspired to use Promise all

class HistoryItemsTemplateEngine {

    #template_url = "/public/html/history_items_template.html";
    #template ="";
    #technologyData=[];
    #legislationData=[];
    #techReferenceList=[]
    #legReferenceList=[]
    //This function sorets the data pased on their start date 
    #sortData(data)
    {
        data.sort((a,b)=>Number(a.start)-Number(b.start))
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
    async #fetchTechnologyHistory()
    {
        try
        {
            let response = await fetch("/public/assets/json/technology.json");
            let data = await response.json();
            this.#sortData(data.technology);
            return data;
        }
        catch(err)
        {
            throw  err;
        }
        
    }
    async #fetchLegislationHistory()
    {
        try
        {
            let response = await fetch("/public/assets/json/legislation.json");
            let data = await response.json();
            this.#sortData(data.legislation);
            return data;
        }
        catch(err)
        {
            throw  err;
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
        this.#technologyData["technology"].forEach((item)=>{
            this.#techReferenceList.push(...this.#referenceExtractor(item))
        })
        this.#legislationData["legislation"].forEach((item)=>{
            this.#legReferenceList.push(...this.#referenceExtractor(item))
        })
    }
    #referenceEmbedder(item, tempTemplate, category)
    {
        let itemReferenceList = this.#referenceExtractor(item)
        let source =[]
        if (category == "technology")
        {
            source = this.#techReferenceList;
        }
        else 
            source = this.#legReferenceList;

        tempTemplate = tempTemplate.replace(/{{r}}/g, (match) => {
            let tempIndex = source.indexOf(itemReferenceList[0]);
            itemReferenceList.shift();
            return `[${tempIndex+1}]`;
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

    #renderTemplate(data) {
        let category = Object.keys(data)[0]
        //to prevent the original template from change
        let template = this.#template;
        let output= "";
        template = template.replace(/{{#items}}([\s\S]*?){{\/items}}/, (match, contentFragment)=>{
            data[category].forEach((item)=>{
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

                //referencing
                tempTemplate = this.#referenceEmbedder(item, tempTemplate, category);

                //year placing
                tempTemplate = this.#yearPlacer(item, tempTemplate);

                tempTemplate+= "\n";
                output+=tempTemplate;
            }) 
            console.log(output)
            return output;
        })
        console.log(template)
        return template;
    }
    async enginOperator()
    {
        try
        {
             await this.#loadTemplate();
            //PromiseAll is used so both asyncfunctions work in parallel
            const [technologyData, legislationData] = await Promise.all([ this.#fetchTechnologyHistory(), this.#fetchLegislationHistory()])
            this.#technologyData=technologyData;
            this.#legislationData=legislationData;
            this.#referenceColloctor()
            let technologyHistoryHTML = this.#renderTemplate(technologyData);
            let legislationHistoryHTML = this.#renderTemplate(legislationData);
            return [technologyHistoryHTML,legislationHistoryHTML];
        }
        catch(err)
        {
            throw err;
        }
    }
}

export{HistoryItemsTemplateEngine}

