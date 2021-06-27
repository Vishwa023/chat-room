const mongoose = require('mongoose');

const URI = "mongodb+srv://Vishwa_Patel:vp12345@cluster0.uqes2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//Function which connects db
const connectDB = async() => {
    await mongoose.connect(URI, { useUnifiedTopology : true, useNewUrlParser: true });
    console.log("Database is connected ..... ");
};

module.exports = connectDB;