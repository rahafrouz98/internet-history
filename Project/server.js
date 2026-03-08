
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
        //convert images from base64 to binary and save them in the local storage and record their addresses in the data
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
        //this property is added as an indication that data is added by useers andd needs to be reviewed. There could be a future extension for the admin to log in and
        //review and validate these items
        data["review"] = "in process";
        originData=require('./server_modules/database/legislation.json');
        originData.push(data);
        fs.writeFileSync(__dirname +"/server_modules/database/legislation.json",JSON.stringify(originData, null, 2)) 
    }
}


/* 
Applying promise.all() to increase the speed of fetching data is inspired by Mozilla[1].
Converting a base64 file to buffere and saving it in a file is inspired by Divine Hycenth[2].
To use Statcan API endpoints and extract data from this API the the Statcan API guide is used as the reference[3].
ProductIDs are retrieved from Statcan data page[4] and saved in the /server_modules/json_templates/pids.json.
The techinques to implement Express.js for the server is inspired by B.A Syed[5].
Using express.json() to read JSON data in the requests is inspired by geeksforgeeks[6].
After posting json files that contain images, error message calhost:3000/contribute 413 (Payload Too Large) was received and I increased the limit to 5mb, inspired by saibot-tsch[7].
To extract the third part of the base64 format for converting it to the buffer, a regular expression is applied and it is inspired by barbietunnie [8].
To generate unique names for the images of the contribution data from the users i used unique-filename inspired by npm[9].
Using path.basename for getting the file name from the path string is inspired by B.A Syed[5].


References:
[1]Mozilla. "Promise.all(). Interent: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all, 2025 [Accessed March 7th].
[2]Divine Hycenth. “Convert a Base64 data into an Image in Node.js”. Internet: https://dev.to/dnature/convert-a-base64-data-into-an-image-in-node-js-3f88, 2020 [Accessed March 7th].
[3]Statcan. “Web Data Service (WDS) User Guide”. Internet: https://www.statcan.gc.ca/en/developers/wds/user-guide, 2025 [Accessed March 7th].
[4]Statcan."Data". Interent: https://www150.statcan.gc.ca/n1/en/type/data, 2026 [Accessed March 7th].
[5]B.A Syed, "Beginning Nide.js", Apress, 2014.
[6]geeksforgeeks. "ExpressJS express.json() Function". Interent: https://www.geeksforgeeks.org/web-tech/express-js-express-json-function/, 2025 [Accessed March 7th].
[7]saibot-tsch. "Node.js: express.json limit whitelist".Interent: https://stackoverflow.com/questions/73248270/node-js-express-json-limit-whitelist, 2022 [accessed March 7th].
[8]barbietunnie. "decode-base64.js". Internet: https://gist.github.com/barbietunnie/5fa07012925ee0fe53a0, 2023 [accessed March 7th].
[9]npm, "unique-filename". Internet: https://www.npmjs.com/package/unique-filename, 2025 [Accessed March 7th]

*/