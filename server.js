const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
var cors = require('cors');
const path = require('path');
const app = express();
const port = 30002;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function(){
    console.log(`listening on ${port}`);
});

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});

app.get('/content/:data', function(req, res){
    const { data } = req.params;
    console.log('요청');
    
    const configuration = new Configuration({
        apiKey: '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',
    });
    const openai = new OpenAIApi(configuration);
      
    openai.createCompletion({
        model: "text-davinci-003",
        prompt: data,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    }).then((result) => {
        console.log(result.data.choices[0].text);
        res.json({"content":`${result.data.choices[0].text}`});
    })
})


