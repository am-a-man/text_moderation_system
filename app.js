const tf = require('@tensorflow/tfjs-node')
const toxicity = require('@tensorflow-models/toxicity');
const cors= require('cors');

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// import fetch from "node-fetch";
const fetch = require("cross-fetch")
const dotenv = require("dotenv")

const express = require("express");

dotenv.config()
const app = express();
app.use(cors());


// app.configure(function(){
//     app.use(express.bodyParser());
//   });


const port = process.env.PORT || 8080;
app.listen(port , () => {
    console.log(`app listening on port ${port}`);
});

const threshold = 0.9;
var model;


async function setUpModel() {
    console.log("[root]: starting to load model");
    // The minimum prediction confidence.
    await toxicity.load(threshold).then(mod => {
        console.log("[root]: model loaded");
        model = mod
    });
    
}

setUpModel() 

app.get('/', (req, res) => {
    console.log("[root]: GET request recieved at '/'");
    res.send(JSON.stringify({'status':'working'}))
})


app.get('/status', (req, res) => {
    console.log("[root]: GET request recieved at '/status'");
    while(model === undefined);

    res.send(JSON.stringify({
        'status': '1',
    }))
})

app.post('/api/post/NSFW/v1/status', (req, res, next) => {
    console.log('[root]: POST request recieved at /api/post/NSFW/v1/status')
    console.log(req.headers.body);
    var text = JSON.parse(req.headers.body).text;
    // var text = 'you suck'
    
    var response = {}
    
    model.classify([text]).then(predictions => {
        response['text'] = text;
        response['nsfw_status'] = predictions;
        res.send(JSON.stringify(response))
    })    
})


app.post('/api/post/NSFW/v2/status', jsonParser,  (req, res, next) => {
    console.log('[root]: POST request recieved at /api/post/NSFW/v2/status')
    console.log(req.body);
    var text = req.body.text;
    // var text = 'you suck'
    var response = {}
    
    model.classify([text]).then(predictions => {
        response['text'] = text;
        response['nsfw_status'] = predictions;

        response['true_categories'] = []
        predictions.forEach(element => {
            if(element.results[0].match)
                response['true_categories'].push(element.label)
        });

        res.send(JSON.stringify(response)) 
    })    

})

