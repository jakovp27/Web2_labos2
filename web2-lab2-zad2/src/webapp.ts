import express from 'express';
import fs from 'fs';
import path from 'path'
import https from 'https';
import {auth, requiresAuth } from 'express-openid-connect';
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
dotenv.config()
const app = express();
app.use(cookieParser());
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'pug');
var urlencodedParser = bodyParser.urlencoded({ extended: true })
app.use(urlencodedParser)

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

const config = {
  authRequired: false,
  idpLogout: true, //login not only from the app, but also from identity provider
  secret: process.env.SECRET,
  baseURL: externalUrl || `https://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-d52kuhytii7tndmi.us.auth0.com',
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code',
    //scope: "openid profile email"   
  },
};

//auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
//app.use(csrf({ cookie: true }))
let token:any = undefined
let check = true

app.get('/',async function (req, res) {
  let username: string | undefined;
  if (req.oidc.isAuthenticated()) 
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  console.log(req.oidc.user)
  token = req.oidc.user?.sid
  console.log(token)
  res.render('index', {username,check,token});
});

app.post('/',async function (req, res) {
  check = req.body.check;
  let username: string | undefined;
  if (req.oidc.isAuthenticated()) 
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  res.render('index', {username,check,token});
  
});

app.post('/prebaci',async function (req, res) {
    
  var racun = req.body.racun
  var iznos = req.body.iznos
  console.log(racun,iznos)
  let username: string | undefined;
  if (req.oidc.isAuthenticated()) 
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  if(!check){
    if(req.body._csrf==token){
      console.log("Uspjesno prebacivanje novaca")      
    }else{
      console.log("Pokusaj krade")
      var steal = true
      res.render('index', {username,racun,iznos,check,token,steal});
      return
    }
  }else{
    console.log("CSRF omogućen")
    console.log("Uspjesno prebacivanje novaca")  
  }
  res.render('index', {username,racun,iznos,check,token});

 

});


app.get("/sign-up", (req, res) => {
  res.oidc.login({
    returnTo: '/',
    authorizationParams: {
      screen_hint: "signup",
    },
  });
});
app.get("/log-in", (req, res) => {
  res.oidc.login({
    returnTo: '/',
    authorizationParams: {
      screen_hint: "login",
    },
  });
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


