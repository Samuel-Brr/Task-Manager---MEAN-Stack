const express = require('express')
const app = express()

const { mongoose } = require('./database/mongoose')

const bodyParser = require('body-parser')

//Load in the mongoose models
const { List, Task } = require('./database/models')

//Load middleware
app.use(bodyParser.json())

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
    Task.find({
        _listId: req.params.listId
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
        title,
        _listId
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
        res.sendStatus(204)
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

app.listen(3000, ()=>{
    console.log("Server is listening on port 3000...")
}) 