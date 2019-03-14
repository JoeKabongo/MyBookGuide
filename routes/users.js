const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const request = require('request');
const { ensureAuthenticated } = require('../config/auth');

const Member = require("../models/Member");
const Book = require("../models/Book");


//login Page
//display books
router.get('/login', (req, res) => {
  let title = "Login";
  let id_list = [];
  for(var index=0; index < id_list.length; index++){
    request('https://www.googleapis.com/books/v1/volumes/' + id_list[index] +'?key=AIzaSyBPnEU8-5NV4lMHC8EZIP7XDADolJBie5M', 
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              body =  JSON.parse(body);
              const newBook = new Book({
                title: body.volumeInfo.title,
                author :body.volumeInfo.authors,
                googleId:body.id,
                imageLink: body.volumeInfo.imageLinks.thumbnail
              });

              newBook.save()
                .then(book=> {
                  console.log("it was successfull")
                }).catch(error => {
                  console.log("something went wrong");
                })


               

          }
          else{
              console.log(error);
          }   
      }
   ); 

  }
  
  res.render('login',{title});
});


//register Page
router.get('/register', (req, res) => {
  const title = "Register";
  res.render('register', {title});
});


//register handler
router.post('/register', (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const password2 = req.body.password2.trim();

  let errors = [];


  //make sure all field are filled
  if(!email || !password || !password2){
    errors.push("All fields must be filled");
  }

  //check to see if all password maches
  if(password != password2){
    errors.push("Passwords does not match");
  }
  
  //check to see if the passwords matches
  Member.findOne({email:email})
  .then(user =>{
    //if user with that email already exist
    if(user){
      errors.push('Email has already been taken, sorry!');
      res.render('register', {errors, email, name, password, password2}); 

      
    }else{
      //create a new user
      if(errors.length != 0){
        res.render('register', {errors, email, name, password, password2});
      }
      else{
        const newUser = new Member({
          name:name,
          email:email,
          password:password
        });

        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
              newUser.password  = hash;
              newUser.save()
                .then(user=> {
                  req.flash('success_msg', 'You are not logged in');
                  res.redirect('/users/login');
                }).catch(error => {
                  console.log(error);
                })

          });
        });
      }

    }
  })
  .catch(err => {
      errors.push("Something went wrong, try again please");
      res.render('register', {errors, email, name, password, password2});
  });
     
});


//login handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);

});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

//Users saved books
router.get('/mybooks', ensureAuthenticated, (req, res) => {
  const title = "My books";
  const user = req.user;
  const user_book = user.favoritBooks;
  console.log(user_book);
  if(user_book.length == 0){
    res.render('savedbooks', {user, title});
  }
  let  books = [];
  for(let index=0; index < user_book.length; index++){
    request('https://www.googleapis.com/books/v1/volumes/' + user_book[index]+'?key=AIzaSyBPnEU8-5NV4lMHC8EZIP7XDADolJBie5M', 
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              body =  JSON.parse(body);

                let book = {
                    title : body.volumeInfo.title,
                    author : body.volumeInfo.authors,
                    description : body.volumeInfo.description,
                    publishers : body.volumeInfo.publisher + " " + body.volumeInfo.publishedDate,
                    link: body.volumeInfo.infoLink,
                    id:body.id
                }

                try{
                    book["image"] = body.volumeInfo.imageLinks.thumbnail;
                }catch(e){
                    book["image"] = "";

                }

                
                books.push(book);
              
              if(books.length == user_book.length){
                res.render('savedbooks', {user, books, title})
              }

          }
          else{
              console.log(error);
          }   
      }
   ); 
  }
});



//user profile
router.get('/profile', ensureAuthenticated, (req, res) => {
  const user = req.user;
  const title = "My profile";
  console.log(req.user.favoritBooks);

  res.render('profile', {user, title});
});


//edit profile
router.post('/editprofile', ensureAuthenticated, (req, res) => {
  let user = req.user;
  let new_name = req.body.new_name.trim();
  let new_email = req.body.new_email.trim();
  let new_password = req.body.new_password;
 

  //
  let verify_password = req.body.verify_password;


  //make sure the password match before making any changes
  bcrypt.compare(verify_password, req.user.password, (err, isMatch) => {
    if (err) throw err;
    if (isMatch) {
       //update name if not empty
       if(new_name != ''){
         req.user.name = new_name;
       }

        //update email if not empty
       if(new_email != ''){
        req.user.email = new_email;
       }
       //update password if not empty
       if(new_password !=''){

          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(new_password, salt, function(err, hash) {
                req.user.password  = hash;
            });
          });
       }
       req.user.save();

       req.flash('success_msg', 'Your info has been updated');
       res.redirect('/users/profile');
    } else {
      req.flash('error_msg', 'Your password did not match');
      res.redirect('/users/profile');
    }
  });

});

//allow user to add a book to their list 
router.post('/addBook', (req, res) => {
    let user = req.user;
    const book_id = req.body.book_id
    if(!user){
      req.flash('error_msg', 'You must login to save a book');
      res.redirect(`/book/${book_id}`);
    }
    else{
      let book_id = req.body.book_id;
     
      if(user.favoritBooks.includes(book_id)){
        req.flash('error_msg', 'This book is already in your list');
        res.redirect(`/book/${book_id}`);
      }
      else{
        user.favoritBooks.push(book_id);
        user.save();
        req.flash('success_msg', 'Book has been added to your list');
        res.redirect(`/book/${book_id}`);
      }
    }
    
    
});

//allow user to remove a book from their list
router.delete('/removeBook', (req, res) => {
  let user = req.user;
  let book_id = req.body.book;
  user.favoritBooks = user.favoritBooks.filter(item => item!= book_id);
  user.save();
  res.json({'success':true});

});
router.post('/removeBook', (req, res) => {
  let user = req.user;
  let book_id = req.body.book_id;
  user.favoritBooks = user.favoritBooks.filter(item => item!= book_id);
  user.save();

  req.flash('success_msg', 'Book has been removed to your list');
  res.redirect(`/book/${book_id}`);
});


module.exports = router


