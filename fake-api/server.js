const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');

const server = jsonServer.create();
const router = jsonServer.router('./database.json');
const userdb = JSON.parse(fs.readFileSync('./db.json', 'UTF-8'));

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = '123456789';

const expiresIn = '1h'
var userConnected ;

// Create a token from a payload
function createToken(payload){
  return jwt.sign(payload, SECRET_KEY, {expiresIn})
}

// Verify the token
function verifyToken(token){
  return  jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ?  decode : err)
}

// Check if the user exists in database
function isAuthenticated({email, password}){
  const response =  userdb.userCompany.findIndex(user => user.email === email && user.password === password) !== -1 ;
  console.log(response);
  if (response){

     console.log(response);
     userConnected = userdb.userCompany.find(user => user.email === email && user.password === password);
     console.log(userConnected);


  }
 return response;
 }
// Register New User
server.post('/auth/register', (req, res) => {
  console.log("register endpoint called; request body:");
  console.log(req.body);
  const {email, password} = req.body;

  if(isAuthenticated({email, password}) === true) {
    const status = 401;
    const message = 'email and Password already exist';
    res.status(status).json({status, message});
    return
  }

fs.readFile("./db.json", (err, data) => {
    if (err) {
      const status = 401
      const message = err
      res.status(status).json({status, message})
      return
    };

    // Get current userCompany data
    var data = JSON.parse(data.toString());
console.log(data);
    // Get the id of last user
    var last_item_id = data.userCompany[data.userCompany.length-1].id;

    //Add new user
    data.userCompany.push({id: last_item_id + 1, email: email, password: password}); //add some data
    var writeData = fs.writeFile("./db", JSON.stringify(data), (err, result) => {  // WRITE
        if (err) {
          const status = 401
          const message = err
          res.status(status).json({status, message})
          return
        }
    });
});

// Create token for new user
  const access_token = createToken({email, password})
  console.log("Access Token:" + access_token);
  res.status(200).json({access_token})
})

// Login to one of the userCompany from ./db
server.post('/auth/login', (req, res) => {
  console.log("login endpoint called; request body:");
  console.log(req.body);
  const {email, password, remember} = req.body;
  if (isAuthenticated({email, password}) === false) {
    const status = 401
    const message = 'Incorrect email or password !'
    res.status(status).json({status, message})
    return
  }
    const playload = {password: password, email: email, remember: remember, firstname: userConnected.firstname,
      lastname: userConnected.lastname,
      id: userConnected.id,
      };

    const access_token = createToken({playload});

    console.log("Access Token:" + access_token);
    console.log("remember:" + remember);

     user = {access_token: access_token, email: email, remember: remember, firstname: userConnected.firstname,
      lastname: userConnected.lastname,
     
      id: userConnected.id,
     };

    res.status(200).json({ user })

})

server.use(/^(?!\/auth).*$/,  (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401
    const message = 'Error in authorization format'
    res.status(status).json({status, message})
    return
  }
  try {
    let verifyTokenResult;
     verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

     if (verifyTokenResult instanceof Error) {
       const status = 401
       const message = 'Access token not provided'
       res.status(status).json({status, message})
       return
     }
     next()
  } catch (err) {
    const status = 401
    const message = 'Error access_token is revoked'
    res.status(status).json({status, message})
  }
})
server.use(router)

  server.listen(3001, () => {
  console.log('Run Auth API Server')
  })