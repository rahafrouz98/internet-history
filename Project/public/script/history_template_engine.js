//This is a class for rendering the HTML elements for the main element of Legislation and Technology pages
//The base of this template engine is taken from the week 11 of the module CM1040

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


    #contentItemReferenceExtractor(item)
    {
        let tempReferenceList=[];
        //extract the references of content  
        item["references"].forEach(reference => {
                if(reference !="")
                {
                    tempReferenceList.push(reference); 
                }
            });
        return tempReferenceList;
    }
    #imageItemReferenceExtractor(item)
    {
        let tempReferenceList=[];
        //extract the references of images 
        item["images"].forEach(image=>{
                if(image["reference"]!="")
                {
                    tempReferenceList.push(image["reference"]); 
                }
            })
        return tempReferenceList;
    }
    #referenceColloctor()
    {
        //list of references for the technology
        this.#data["technology"].forEach((item)=>{
            let contentReferences = this.#contentItemReferenceExtractor(item);
            contentReferences.length > 0 ? this.#referenceLists["technology"].push(...contentReferences): null;
            let imageReferences = this.#imageItemReferenceExtractor(item);
            imageReferences.length > 0 ? this.#referenceLists["technology"].push(...imageReferences): null;
        })
        //list of references for the legislation
        this.#data["legislation"].forEach((item)=>{
            let contentReferences = this.#contentItemReferenceExtractor(item);
            contentReferences.length > 0 ? this.#referenceLists["legislation"].push(...contentReferences): null;
            let imageReferences = this.#imageItemReferenceExtractor(item);
            imageReferences.length > 0 ? this.#referenceLists["legislation"].push(...imageReferences): null;
        })
        console.log(this.#referenceLists)
    }
    #referenceIndexEmbedder(item, itemTemplate, category)
    {
        //in the reference list for each item, the references are sorted based on the order in which they are cited in the text.
        //this variable is used so  reference indexes get extracted  and inderted in the content according to their citted order.
        let tempContentItemReferenceList = this.#contentItemReferenceExtractor(item)
        //insert the references indices for the content
        itemTemplate = itemTemplate.replace(/{{r}}/g, (match) => {
            let tempIndex = this.#referenceLists[category].indexOf(tempContentItemReferenceList[0]);
            let referenceElement = `<a href="${tempContentItemReferenceList[0]}" title="${tempContentItemReferenceList[0]}" >[${tempIndex+1}]</a>`
            tempContentItemReferenceList.shift();
            return referenceElement;
         })
         let tempImageItemReferenceList = this.#imageItemReferenceExtractor(item)
         //insert reference index for each image 
         itemTemplate = itemTemplate.replace(/{{image_r}}/g, (match) => {
            let tempIndex = this.#referenceLists[category].indexOf(tempImageItemReferenceList[0]);
            let referenceElement = `<a href="${tempImageItemReferenceList[0]}" title="${tempImageItemReferenceList[0]}" >[${tempIndex+1}] </a>`
            tempImageItemReferenceList.shift();
            return referenceElement;
         })

        return itemTemplate; 
    }
    //data-* is added to the HTML elements to use them for linking and scrolling  them to the timeline
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
    #replaceImageFragment(imageTemplateFragment, imageItem) 
    {
        return imageTemplateFragment.replace(/{{(\w+)}}/g, (match, elementFragment)=>
            {
                if(elementFragment ==="image_name" && imageItem["reference"])
                {
                    //it will be used later when inserting reference indices in the template
                    return imageItem[elementFragment]+"{{image_r}}";
                }
                //it insertes the image name in the slt attribute of html
                else if(elementFragment ==="image_name_alt")
                {
                    return imageItem["image_name"];
                }
                return imageItem[elementFragment];
            });
    }

    #renderTemplate(data,category) 
    {
        //to prevent the original template from change
        let template = this.#template;
        let output= "";
        //this replace the fragment in between {{#items}} and {{\/items}} with the content of each item in the history data. I used this for loop here because
        //using pure regEx could not separate the outer and inner loop
        template = template.replace(/{{#items}}([\s\S]*?){{\/items}}/, (match, contentFragment)=>{
            data.forEach((item)=>{
                let tempTemplate= contentFragment;
                // Each loops for videos and images of the items in the history data
                tempTemplate = tempTemplate.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, itemTemplateFragment) => {
                    const listOfThings = item[arrayName];
                    if (arrayName === "videos" )
                    {
                        return listOfThings.map(video=>{return itemTemplateFragment.replace( /{{(\w+)}}/, video )}).join("");
                    }
                    else if(arrayName === "images")
                    {
                        return listOfThings.map(imageItem=>{return this.#replaceImageFragment(itemTemplateFragment, imageItem)}).join("");
                    }
                });
                // to replace contents, titles
                tempTemplate = tempTemplate.replace(/{{(\w+)}}/g, (match, dataField) => {
                    //it reserves the {{r}} in the image_names(inserted by #replaceImageFragment() ) for later to be replaced by reference images
                    if(dataField !== "image_r")
                    {
                       return item[dataField]; 
                    }
                    //it makes the {{image_r}} remain unchanged
                    else
                    {
                        return "{{image_r}}"
                    }
                });

                //replace data-set in the html element for each item for linking it to the vis-timeline
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
        // Each loops for references
        template = template.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayname ,itemTemplateFragment) => {
           return this.#referenceLists[category].map(reference=>{return itemTemplateFragment.replace( /{{(\w+)}}/, reference )}).join("");
        });
        
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

