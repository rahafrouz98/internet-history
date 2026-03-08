//https://expressjs.com/en/resources/middleware/cors.html
//begining node.js
//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://www.geeksforgeeks.org/web-tech/express-js-express-json-function/
//because of the error message calhost:3000/contribute 413 (Payload Too Large) i increased the limit to 5mb inspired by
//https://stackoverflow.com/questions/73248270/node-js-express-json-limit-whitelist#:~:text=Sorted%20by:,use(express.
//https://gist.github.com/barbietunnie/5fa07012925ee0fe53a0?permalink_comment_id=2841489&utm_source for secode base64 image
//https://www.npmjs.com/package/unique-filename for unique file names for images
let express = require('express');
//core is used in case the client side is running in different ports
let cors = require('cors');
//module for reading and writing files
let fs = require("fs");
//provides module for createing unique file names for the uploaded images
let uniqueFilename = require('unique-filename');
//this module is used to extract the file's name from the path
let path = require('path');
//this module extracts and cache the metadata
let coordinateFinder = require("./server_modules/coordinate_finder.js")

//these are child instances of DataEngine to extract data from statcan api endpoint construct data in the format of json and cache them in json files and memory
//cached files will be used instead of the data in the memory if statcan api was not available
let eCommerceDataEngine = require("./server_modules/ecommerce_data_engine.js");
let internetUseEngine = require("./server_modules/internet_data_engine.js");
let cyberCrimeDataEngine = require("./server_modules/cybercrime_data_engine.js");

//this async function is created to cache the metadata from the statcan API and after it is resolved the server starts.
async function startServer()
{
     console.log("Data is being loaded from Statcan . . . ")
    let statcanData =
        {
            "internetUse":{},
            "cyberCrime":{},
            "eCommerce":{}
        };
    try 
    {
        await coordinateFinder.cacheMetaData();
        [statcanData["internetUse"],statcanData["eCommerce"],statcanData["cyberCrime"] ]=await Promise.all([internetUseEngine.loadData(),eCommerceDataEngine.loadData(),cyberCrimeDataEngine.loadData()]);
        console.log("Data is loaded and ready. ");
    }
    catch(err)
    {
        console.error(err);
    }
    let app = express();
    app.use(cors());
    app.use(express.json(({ limit: '10Mb' })))
    //__dirname is a global variable and returns the absolute path of the directory that the server.js file is actually in it.
    //express.static is providing access to the files in the folders without the need to specify their path in a serparate get request. So they
    //can be accessed by app.use('/') directly.
    app.use('/public', express.static(__dirname + '/public'))

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/html/index.html');
    })
    app.get('/history', function (req, res) { 
        try
        {
            let historyData = 
            { 
                "technology":require('./server_modules/database/technology.json'),
                "legislation":require('./server_modules/database/legislation.json')
            }
            res.json(historyData);
        }
        catch(err)
        {
            console.error('error at /statistics: '+err);
            res.status(500).json({error: err.message});
        }
    })

    app.get('/statistics', function (req, res) {
        try
        {
            res.json(statcanData);
        }
        catch(err)
        {
            console.error('error at /statistics: '+err);
            res.status(500).json({error: err.message});
        }
    })
    app.post('/contribute', function(req,res){
        let data = req.body;
        for(let image of data["images"])
        {
            if(image["image_file"]!=="")
            {
                let base64 = image["image_file"];
                //creates a unique file name
                let imageUniqePathName = uniqueFilename(__dirname+"/public/assets/images/history");
                imageUniqePathName += ".png";
                //saves the image in the folder with the unique file name
                cacheImage(imageUniqePathName, base64);
                //record the file address in the data and delete the base64 format of image
                let fileName = path.basename(imageUniqePathName)
                image["address"]= "/public/assets/images/history/"+fileName;
                delete image["image_file"];
            }
        }
        //save revise data in the json files
        saveContributedData(data)

        res.send("Thank you for contributing the content");
    })

    app.listen(3000, function () {
    console.log('web server listening on port 3000')
    })
}
startServer();
//this converets base64 to buffer and saves it in the folder
function cacheImage(savingPath,base64Data)
{
    let matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(savingPath, buffer);
}
function saveContributedData(data)
{
    if(data["end"]==="")
    {
        delete data["end"]
    }
    for(let i= data["references"].length-1; i>=0; i-- )
    {
        if (data["references"][i]=="")
        {
            data["references"].splice(i,1);
        }
    }
    for(let i= data["videos"].length-1; i>=0; i-- )
    {
        if (data["videos"][i]=="")
        {
            data["videos"].splice(i,1);
        }
    }
    if(data["dataType"] === "Technology")
    {   
        delete data["dataType"];
        data["review"] = "in process";
        originData=require('./server_modules/database/technology.json');
        originData.push(data);
        fs.writeFileSync(__dirname +"/server_modules/database/technology.json",JSON.stringify(originData, null, 2)) 
    }
    else
    {
        delete data["dataType"];
        data["review"] = "in process";
        originData=require('./server_modules/database/legislation.json');
        originData.push(data);
        fs.writeFileSync(__dirname +"/server_modules/database/legislation.json",JSON.stringify(originData, null, 2)) 
    }
}