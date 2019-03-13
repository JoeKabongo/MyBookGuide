const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    googleId:{
        type: String,
        required: true
    },
    imageLink:{
        type: String,
        required: false
    }
    

});

const Book = mongoose.model('Books', BookSchema);
module.exports = Book;


