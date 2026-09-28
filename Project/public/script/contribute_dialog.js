//this class creates a form to provide tools for users to contribute new contents to the website

class ContributeDialog {
    html = null;
    parent = null;
    dialogButton = null;
    dialog = null;
    constructor(html, container, dialogButton) {
        this.initializeElements(html, container, dialogButton);
    }
    initializeElements(html, container, dialogButton) {
        this.html = html;
        this.parent = container;
        this.dialogButton = dialogButton;
        this.dialogButton.addEventListener("click", async (e) => {
            e.preventDefault();

            const {
                data: { session },
                error,
            } = await supabaseClient.auth.getSession();

            if (error || !session) {
                window.alert("Please sign in before contributing.");
                return;
            }

            this.parent.innerHTML = this.html;
            this.dialog = this.parent.querySelector("dialog");
            this.parent.classList.add("active");
            this.loadForm();
            this.dialog.showModal();
        });
    }
    loadForm() {
        // Close using either the X button or the existing Cancel button.
        const closeButtons = this.dialog.querySelectorAll(".dialog-close, form > div > button.cancel");

        closeButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                this.dialog.close();
                this.parent.innerHTML = "";
            });
        });
        //add li elements for the references
        let addReferenceButton = this.dialog.querySelector("form>div>button.reference");
        addReferenceButton.addEventListener("click", (e) => {
            e.preventDefault();
            let olReferences = this.dialog.querySelector("form>div>ol.reference");
            let liReference = document.createElement("li");
            liReference.innerHTML = `<input name="reference">`;
            olReferences.appendChild(liReference);
        });
        //add li elements for the videos
        let addVideoButton = this.dialog.querySelector("form>div>button.video");
        addVideoButton.addEventListener("click", (e) => {
            e.preventDefault();
            let olVideos = this.dialog.querySelector("form>div>ol.video");
            let liVideo = document.createElement("li");
            liVideo.innerHTML = `<input name="video">`;
            olVideos.appendChild(liVideo);
        });
        //add li elements for the images
        let addImageButton = this.dialog.querySelector("form>div>button.image");
        addImageButton.addEventListener("click", (e) => {
            e.preventDefault();
            let olImages = this.dialog.querySelector("form>div>ol.image");
            let liImage = document.createElement("li");
            liImage.innerHTML = `<div>Select File:<input type="file" accept="image/png, image/jpeg" name="image_file"></div>
                    <div>Image Title:<input name="image_name"></div>
                    <div>Image Reference:<input name="image_reference"></div>`;
            olImages.appendChild(liImage);
        });

        //add event listener for the submit button
        const submitButton = this.dialog.querySelector("form>div>button.submit");

        submitButton.addEventListener("click", async (e) => {
            e.preventDefault();

            if (submitButton.disabled) return;
            submitButton.disabled = true;

            try {
                const data = await this.constructJSON();
                const success = await this.postdata(data);

                if (success) {
                    this.dialog.close();
                    this.parent.innerHTML = "";
                    this.parent.classList.remove("active");
                }
            } catch (error) {
                console.error("Contribution failed:", error);
                window.alert("Unable to prepare your submission.");
            } finally {
                submitButton.disabled = false;
            }
        });
    }
    //it builds a json file based on the input values in the dialog form
    async constructJSON() {
        let dataType = this.parent.querySelector("form>div>select.domain").value;
        let category = this.parent.querySelector("form>div>input.category").value;
        let title = this.parent.querySelector("form>div>input.title").value;
        let start = this.parent.querySelector("form>div>input.start").value;
        let end = this.parent.querySelector("form>div>input.end").value;
        let content = this.parent.querySelector("form>div>textarea.content").value;
        let references = [];
        let referencesInputlist = this.parent.querySelectorAll("form>div>ol.reference>li>input");
        referencesInputlist.forEach((input) => {
            references.push(input.value);
        });
        let videos = [];
        let videosInputlist = this.parent.querySelectorAll("form>div>ol.video>li>input");
        videosInputlist.forEach((input) => {
            videos.push(input.value);
        });
        let images = [];
        let imagesList = this.parent.querySelectorAll("form>div>ol.image>li");
        for (let image of imagesList) {
            let imageObject = {};
            let inputsList = image.querySelectorAll("input");
            for (let input of inputsList) {
                if (input.name == "image_file" && input.value != "") {
                    let file = input.files[0];
                    console.log(input.value);
                    console.log(file);
                    let imageInBase64 = await this.convertImagetoBase64(file);
                    imageObject[input.name] = imageInBase64;
                } else {
                    imageObject[input.name] = input.value;
                }
            }
            images.push(imageObject);
        }

        let item = {
            dataType: dataType,
            category: category,
            title: title,
            start: start,
            end: end,
            references: references,
            videos: videos,
            images: images,
            content: content,
        };
        return item;
    }
    async convertImagetoBase64(file) {
        let promise = new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = () => reject(fileReader.error);
            fileReader.readAsDataURL(file);
        });
        return promise;
    }
    async postdata(data) {
        try {
            const {
                data: { session },
                error,
            } = await supabaseClient.auth.getSession();

            if (error || !session) {
                window.alert("Please sign in before submitting.");
                return false;
            }

            const response = await fetch("/contribute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const message =
                    response.status === 401
                        ? "Please sign in again before submitting."
                        : `Submission failed (${response.status}).`;

                window.alert(message);
                return false;
            }

            window.alert(await response.text());
            return true;
        } catch (error) {
            console.error("Contribution failed:", error);
            window.alert("Unable to connect. Please try again.");
            return false;
        }
    }
}
export { ContributeDialog };

/*
Giving constraints to the input element to receive a 4-digit number as a year is inspired by Blackbam[1].
Converting images to base64 for puting them in the JSON data is inspired by tencentcloud[2].
Converting an image to base64 by using the fileReader.readAsDataURL() inside a promise to handle the asyncronous 
behaviour of this function is inspired by 


References:
[1]Blackbam. "Can I use an HTML input type "date" to collect only a year?". Internet: https://stackoverflow.com/questions/34676752/can-i-use-an-html-input-type-date-to-collect-only-a-year, 2016 [Accessed MArch 7th].
[2]tencentcloud. "How to upload files using JSON data interface?". Interent: https://www.tencentcloud.com/techpedia/128003, 2025 [Accessed MArch 7th].
[3]Shovon Hasan. "Using Promises with FileReader". Interent: https://blog.shovonhasan.com/using-promises-with-filereader/, 2017 [accessed March 7th].

*/
