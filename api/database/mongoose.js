// This file will handle connection logic to Mongodb

const MONGODB_URI = 'mongodb+srv://Sml-Brr:YVmG4mNq24wxbku2@cluster0.jt4fy.mongodb.net/TaskManager?retryWrites=true&w=majority'
const mongoose = require('mongoose')

mongoose.connect(MONGODB_URI, () => {
    console.log("Connected to the database !")
}).catch((e)=>{
    console.log("Error could not connect to the database")
    console.log(e)
})

module.exports = { mongoose }