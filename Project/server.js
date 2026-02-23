//https://expressjs.com/en/resources/middleware/cors.html
//begining node.js
//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://www.geeksforgeeks.org/web-tech/express-js-express-json-function/

let express = require('express');
//core is used incase the client side is running in different port
let cors = require('cors');
let meta = require('./server_module/metadata');


//this async function is created to cache the metadata from the statcan API and after it is resolved the server starts.
async function startServer()
{
    try 
    {
        await meta.cacheAllMetadata();
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
    app.get('/metadata', function (req, res) {
        res.json(meta.metadata);
    })
    app.get('/pids', function (req, res) {
        res.json(meta.PIDs);
    })
    app.post('/datapoint', async function (req, res) {
        let tempBody = req.body;
        let options = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(tempBody)
        }
        try
        {
            let response = await fetch(`https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods`, options);
            let data = await response.json();     
            res.json(data);
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