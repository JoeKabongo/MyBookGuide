const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const request = require('request');
const Book = require("../models/Book");



// Dashboard
router.get('/', (req, res) =>{

   const user = req.user;
   const title = "Home page"
   Book.find()
    .then(books => {
        res.render('index', {user, books, title});

    }).catch(error => {
        console.log(error);
    });

});


router.post('/search', (req, res) => {
    let search = req.body.book;
    let title = `Search: ${search}`;
    let user = req.user;
    request('https://www.googleapis.com/books/v1/volumes?q='+ search + '&maxResults=40&key=AIzaSyBPnEU8-5NV4lMHC8EZIP7XDADolJBie5M', 
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let books = [];
                body =  JSON.parse(body);

                let items = body.items.length;
                for(var i=0; i < items; i++){
                    let book = {
                        title : body.items[i].volumeInfo.title,
                        author : body.items[i].volumeInfo.authors,
                        description : body.items[i].volumeInfo.description,
                        publishers : body.items[i].volumeInfo.publisher + " " + body.items[i].volumeInfo.publishedDate,
                        link: body.items[i].volumeInfo.infoLink,
                        id:body.items[i].id
                    }
                    try{
                        book["image"] = body.items[i].volumeInfo.imageLinks.thumbnail;
                    }catch(e){
                        book["image"] = "";

                    }
    
                    books.push(book);
                }
                res.render('searchresult',{user, books, search, title});  

            }
            else{

                console.log(error);
            }
        }
    );  

});

router.get('/book/:id', (req, res) => {
    let user = req.user;
    let book_id = req.params.id;
    request('https://www.googleapis.com/books/v1/volumes/' + book_id +'?key=AIzaSyBPnEU8-5NV4lMHC8EZIP7XDADolJBie5M', 
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              body =  JSON.parse(body);

                let book = {
                    title : body.volumeInfo.title,
                    author : body.volumeInfo.authors,
                    description : body.volumeInfo.description,
                    publishers : body.volumeInfo.publisher,
                    date : getDate(body.volumeInfo.publishedDate), 
                    pages : body.volumeInfo.pageCount,
                    link: body.volumeInfo.infoLink,
                    id:body.id,
                    image:body.volumeInfo.imageLinks.thumbnail,
                    category:body.volumeInfo.categories
                }
                let title = book.title  + ' by ' + book.author; 
                let added = false;
                if(user){
                    added = user.favoritBooks.includes(book_id);
                
                }
                console.log(added);
                res.render('bookpage', {user, book, title, added});
          }
          else{
              console.log(error);
          }   
      }
   ); 
}); 


function getDate(date){
    let result = "";
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    date = date.split("-");
    let month = parseInt(date[1]);
    result += months[month-1] + " "+date[2]+", "+date[0];
    return result;
}

module.exports = router;
