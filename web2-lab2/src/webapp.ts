import express from 'express';
import fs from 'fs';
import path from 'path'
import https from 'https';
import db = require('./index');
import {auth, requiresAuth } from 'express-openid-connect';
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { ObjectFlags } from 'typescript';
dotenv.config()
//#region import { auth } from 'express-oauth2-jwt-bearer';

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'pug');
var urlencodedParser = bodyParser.urlencoded({ extended: false })


const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

let check = true
app.get('/', async function (req, res) {
  console.log("Pokrenuto")
  res.render('index',{check});
});

app.post('/',urlencodedParser, async function (req, res) {
  check = req.body.check;
  res.render('index',{check});
});



app.post('/userdata',urlencodedParser, async function (req, res) {
  console.log("Dohvaćam podatke")
  var name = req.body.username
  var results = await db.getInfo(name)
  console.log(results)
  if(results==null){
    var msg = "Ne postoji korisnik s tim korisničkim imenom!"
    res.render('index',{msg});
  } 
  console.log(results)
  res.render('private',{results});
});





if (externalUrl) {
  const hostname = '127.0.0.1';
  app.listen(port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${port}/ and from
  outside on ${externalUrl}`);
  });
}
else {
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
    .listen(port, function () {
      console.log(`Server running at https://localhost:${port}/`);
    });
}


