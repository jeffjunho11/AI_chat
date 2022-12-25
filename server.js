const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
var cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;
var request = require('request');

var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
const configuration = new Configuration({
    apiKey: '<apikey>',
});
const openai = new OpenAIApi(configuration);
  

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function(){
    console.log(`listening on ${port}`);
});

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});

// 번역기능 부분
var client_id = '<client ID>';
var client_secret = '<cliend secret>';

// 프론트 전송 부분
app.get('/content/:data', function(req, res){
    const { data } = req.params;
    var TransData = '';
    console.log('요청');
    console.log(data);

    var query = `${data}`;
    var options_ko = {
       url: api_url,
       form: {'source':'ko', 'target':'en', 'text':query},
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    
    request.post(options_ko, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            TransData = JSON.parse(body);

            openai.createCompletion({
                model: "text-davinci-003",
                prompt: TransData.message.result.translatedText,
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }).then(function(result){
                var options_en = {
                    url: api_url,
                    form: {'source':'en', 'target':'ko', 'text':result.data.choices[0].text},
                    headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                }
                request.post(options_en, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        JSONTrans_en = JSON.parse(body);
                        res.json({"content":`${JSONTrans_en.message.result.translatedText}`});
                    }else {
                        res.status(response.statusCode).end();
                        console.log('error = ' + response.statusCode);
                    }
                })
            });  
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });

    
})


