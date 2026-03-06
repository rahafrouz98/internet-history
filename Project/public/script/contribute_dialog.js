//this class id for creating a form to contribute the content to the data base
//https://stackoverflow.com/questions/55352073/how-to-create-and-fill-list-item-with-a-button
//https://www.w3schools.com/html/html_youtube.asp
//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number
//https://stackoverflow.com/questions/34676752/can-i-use-an-html-input-type-date-to-collect-only-a-year
//https://developer.mozilla.org/en-US/docs/Web/API/Window/alert
//https://forum.freecodecamp.org/t/form-submission-cancelled-because-the-form-is-not-connected/482721
//https://stackoverflow.com/questions/31303071/how-to-upload-and-post-file-to-node-express-server
//https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects
//https://stackoverflow.com/questions/71882042/how-to-send-and-receive-formdata-through-fetch-to-node-and-express
//https://www.tencentcloud.com/techpedia/128003  Using Base64 Encoding (Alternative for APIs that only accept JSON)
//https://developer.mozilla.org/en-US/docs/Web/API/FileReader
//https://blog.shovonhasan.com/using-promises-with-filereader/#:~:text=Understanding%20FileReader,integrating%20it%20with%20an%20application.
//https://developer.mozilla.org/en-US/docs/Web/API/FileReader/result
//to convert a Base64 to buffer and buffer to image : https://dev.to/dnature/convert-a-base64-data-into-an-image-in-node-js-3f88
class ContributeDialog
{
    html = null;
    parent = null;
    dialogButton = null;
    dialog = null;
    constructor(html, container, dialogButton)
    {
        this.html = html;
        this.parent = container;
        this.dialogButton = dialogButton;
        this.dialogButton.addEventListener("click",()=>{
            this.parent.innerHTML = this.html;
            this.dialog = this.parent.querySelector("dialog");
            this.parent.classList.add("active");
            this.loadForm()
            this.dialog.showModal();
        })
    }
    loadForm()
    {
        //close the contribute dialog
        let closeButton = this.dialog.querySelector("form>div>button.cancel");
        closeButton.addEventListener("click", () => {
            this.dialog.close();
            this.parent.innerHTML="";
        });
        //add li elements for the references
        let addReferenceButton = this.dialog.querySelector("form>div>button.reference");
        addReferenceButton.addEventListener("click", ()=>{
            let olReferences = this.dialog.querySelector("form>div>ol.reference");
            let liReference = document.createElement("li");
            liReference.innerHTML = `<input name="reference">`
            olReferences.appendChild(liReference);
        });
        //add li elements for the videos
        let addVideoButton = this.dialog.querySelector("form>div>button.video");
        addVideoButton.addEventListener("click", ()=>{
            let olVideos = this.dialog.querySelector("form>div>ol.video");
            let liVideo = document.createElement("li");
            liVideo.innerHTML = `<input name="video">`
            olVideos.appendChild(liVideo);
        });
        //add li elements for the images
        let addImageButton = this.dialog.querySelector("form>div>button.image");
        addImageButton.addEventListener("click", ()=>{
            let olImages = this.dialog.querySelector("form>div>ol.image");
            let liImage = document.createElement("li");
            liImage.innerHTML = `<div>Select File:<input type="file" accept="image/png, image/jpeg" name="image_file"></div>
                    <div>Image Title:<input name="image_name"></div>
                    <div>Image Reference:<input name="image_reference"></div>`
            olImages.appendChild(liImage);
        });

        //add event listener for the submit button
        let form = this.dialog.querySelector("form");
        form.addEventListener("submit", async (e)=>{
            e.preventDefault();
           await this.postdata(await this.constructJSON())
            this.dialog.close();
            this.parent.innerHTML="";
        });
    }
    //it builds a json file based on the input values in the dialog form
    async constructJSON()
    {
        let dataType = this.parent.querySelector("form>div>select.domain").value;
        let category = this.parent.querySelector("form>div>input.category").value;
        let title = this.parent.querySelector("form>div>input.title").value;
        let start = this.parent.querySelector("form>div>input.start").value;
        let end = this.parent.querySelector("form>div>input.end").value;
        let content = this.parent.querySelector("form>div>textarea.content").value;
        let references=[];
        let referencesInputlist = this.parent.querySelectorAll("form>div>ol.reference>li>input");
        referencesInputlist.forEach(input=>{
            references.push(input.value);
        });
        let videos=[];
        let videosInputlist = this.parent.querySelectorAll("form>div>ol.video>li>input");
        videosInputlist.forEach(input=>{
            videos.push(input.value);
        });
        let images=[];
        let imagesList = this.parent.querySelectorAll("form>div>ol.image>li")
        for(let image of imagesList)
        {
            let imageObject = {};
            let inputsList =image.querySelectorAll("input");
            for(let input of inputsList)
            {   
                if(input.name == "image_file" && input.value!="")
                {
                    let file =input.files[0];
                    console.log(file)
                    let imageInBase64 = await this.convertImagetoBase64(file);
                    imageObject[input.name] = imageInBase64;
                }
                else
                {
                    imageObject[input.name]=input.value;
                }
            }
            images.push(imageObject);
        }
        let name = this.parent.querySelector("form>div>div>input.username").value;
        let email = this.parent.querySelector("form>div>div>input.email").value;

        let item ={
                    "dataType": dataType,
                    "category": category,
                    "title": title,
                    "start": start,
                    "end": end,
                    "references": references,
                    "videos": videos,
                    "images": images,
                    "content": content,
                    "username":name,
                    "email":email
        }
        return item;
    }
    async convertImagetoBase64(file)
    {
        let promise = new Promise( (resolve, reject)=>
        {
            let fileReader = new FileReader();
            fileReader.onload = ()=> resolve(fileReader.result);
            fileReader.onerror = () => reject(fileReader.error);
            fileReader.readAsDataURL(file);
        })
        return promise;
    }
    async postdata(data)
    {
        try{
            let options = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body:JSON.stringify(data)
                }
            console.log(options)
            let response = await fetch('/contribute', options);
            //let message = await response.text();
            //window.alert(message);
        }
        catch(err)
        {
            window.alert("Your submission failed. Try later.\n Error: "+err)
        }
    }
}
export {ContributeDialog};