//https://expressjs.com/en/resources/middleware/cors.html
//begining node.js
//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://www.geeksforgeeks.org/web-tech/express-js-express-json-function/

let express = require('express');
//core is used in case the client side is running in different port
let cors = require('cors');

//this module extracts and cache the metadata
let coordinateFinder = require("./server_module/coordinate_finder.js")

//these are child instances of DataEngine to extract data from statcan api endpoint construct data in the format of json and cache them in json files and memory
//cached files will be used instead of the data in the memory if statcan api was not available
let eCommerceDataEngine = require("./server_module/ecommerce_data_engine.js");
let internetUseEngine = require("./server_module/internet_data_engine.js");
let cyberCrimeDataEngine = require("./server_module/cybercrime_data_engine.js");

//this async function is created to cache the metadata from the statcan API and after it is resolved the server starts.
async function startServer()
{
     console.log("Data is being loaded from Statcan . . . ")
    try 
    {
        await coordinateFinder.cacheMetaData();
        let statcanData =
                    {
                        "internetUse":{},
                        "cyberCrime":{},
                        "eCommerce":{}
                    };
        [statcanData["internetUse"],statcanData["eCommerce"],statcanData["cyberCrime"] ]=
                           await Promise.all([internetUseEngine.loadData(),eCommerceDataEngine.loadData(),cyberCrimeDataEngine.loadData()])
        console.log("Data isloaded and ready. ")
    }
    catch(err)
    {
        console.error(err);
    }
    let app = express();
    app.use(cors());
    app.use(express.json())
    //__dirname is a global variable and returns the absolute path of the directory that the server.js file is actually in it.
    //express.static is providing access to the files in the folders without the need to specify their path in a serparate get request. So they
    //can be accessed by app.use('/') directly.
    app.use('/public', express.static(__dirname + '/public'))

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/html/index.html');
    })
  
    app.post('/ecommerce', async function (req, res) {
        console.log("request for StatCan E-Commerce api is received")
        let reqBody = req.body;
        let coordinateObj = getCoordinateForECommerce(reqBody["industry"], reqBody["sales"])
        try
        {
            let data = await extractDataFromCube(coordinateObj);
            res.json(data[0]["object"]["vectorDataPoint"]);
        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({error: err.message});
        }
    })
    app.post('/internetuse', async function (req, res) {
        console.log("request for StatCan Internet Use api is received")
        let reqBody = req.body;
        let coordinateObj = getCoordinateForInternetUse(reqBody["geo"], reqBody["agegroup"])
        try
        {
            data = await extractDataFromCube(coordinateObj);
            res.json(data[0]["object"]["vectorDataPoint"]);
        }
        catch(err)
        {
            // console.error(err);
            // res.status(500).json({error: err.message});
        }
    })
    app.post('/cybercrime', async function (req, res) {
        console.log("request for StatCan Cyber Crime api is received")
        let reqBody = req.body;
        let coordinateObj = getCoordinateForCyberCrime(reqBody["geo"], reqBody["violation"],reqBody["statistic"],reqBody["calendarquarter"])
        try
        {
            data = await extractDataFromCube(coordinateObj);
            res.json(data[0]["object"]["vectorDataPoint"]);
        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({error: err.message});
        }
    })

    app.listen(3000, function () {
    console.log('web server listening on port 3000')
    })
}
startServer()