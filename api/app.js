const express = require('express')
const app = express()

let cors = require('cors')

const { mongoose } = require('./database/mongoose')

const bodyParser = require('body-parser')

//Load in the mongoose models
const { List, Task, User } = require('./database/models')

/* MIDDLEWARE  */

//BODY PARSER
app.use(bodyParser.json())

// // CORS HEADERS MIDDLEWARE
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

//     res.header(
//         'Access-Control-Expose-Headers',
//         'x-access-token, x-refresh-token'
//     );

//     next();
// });

const corsOptions = {
    exposedHeaders: ['x-access-token','x-refresh-token']
}

app.use(cors(corsOptions))

// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE  */



// ROUTE HANDLERS


// LIST ROUTES


/**
 * GET /lists 
 * Purpose: Get all lists   
*/

app.get('/lists', (req,res) => {
    // We want to return an array of all the lists in the database
    List.find().then((lists)=>{
        res.send(lists)
    })
} )
 
/**
 * POST /lists
 * Purpose: Create a list
 */
app.post('/lists', (req,res) => {
    //Create new list ad return the new list doc back yo the user with id
    const title = req.body.title;
    
    const newList = new List({
        title
    })

    newList.save().then((listDoc)=>{
        res.send(listDoc)
    })
})


/**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */
app.patch('/lists/:id', (req,res) => {
    List.findByIdAndUpdate({_id: req.params.id}, {
        $set: req.body
    }).then(() => {
        res.sendStatus(204) 
    })
})

/**
 * DELETE /lists/:id
 * Purpose: Delete a specified list
 */
app.delete('/lists/:id', (req,res) => {
    List.findOneAndRemove({
        _id: req.params.id
    }).then((removedListDoc) => {
        res.status(200).send(removedListDoc)
    } )
})

app.get('/lists/:listId/tasks', (req,res)=>{

    const listId = req.params.listId 

    
    Task.find({
        _listId: listId
    }).then((tasks)=>{
        res.status(200).send(tasks)
    })


})

// app.get('/lists/:listId/task/:taskId', (req,res)=>{
//     const listId = req.params.listId
//     const taskId = req.params.taskId

//     Task.findOne({
//         _listId: listId,
//         _id: taskId,
//     }).then((task)=>{
//         res.status(200).send(task)
//     })
// })

app.post('/lists/:listId/task', (req,res)=>{
    const title = req.body.title;
    const _listId = req.params.listId
    
    const newTask = new Task({
        title: title,
        _listId: _listId
    })

    newTask.save().then((taskDoc)=>{
        res.status(201).send(taskDoc)
    })
})

app.patch('/lists/:listId/task/:taskId', (req,res)=>{
    const listId = req.params.listId
    const taskId = req.params.taskId

    Task.findOneAndUpdate({
        _listId: listId,
        _id: taskId,
    },{
        $set: req.body
    }).then(() => {
        res.status(204).send({message: "task completed from the api"})
    })
})

app.delete('/lists/:listId/task/:taskId', (req,res)=>{
    const listId = req.params.listId
    const taskId = req.params.taskId
    
    Task.findOneAndRemove({
        _listId: listId,
        _id: taskId,
    }).then((removedTaskDoc)=>{
        res.status(200).send(removedTaskDoc)
    })
})

// USER ROUTES

/**
 * POST /users
 * Purpose: Sign up
 */
 app.post('/users', (req, res) => {
    // User sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

/**
 * POST /users/login
 * Purpose: Login
 */
 app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
 app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})


app.listen(3000, ()=>{
    console.log("Server is listening on port 3000...")
}) 