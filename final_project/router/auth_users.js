const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  if (users.find(user => user.username === username)) {
    return false;
  }
  else return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validUser=users.filter((user)=>{
  return (user.username==username && user.password==password);
})
if(validUser.length>0){
  return validUser[0];
}
else{
  return false;
}
}

//only registered users can login
regd_users.post("/login",(req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(404).json({ error: 'Username and password are required.' });
  }

  // User authentication successful, generate JWT token
  let user=authenticatedUser(username,password);
  if(user){
      const token = jwt.sign({ username: user.username }, 'fingerprint_customer', { expiresIn: "1h" });
      req.session.authorization = {
      token,username
      }
      return res.status(200).send("User successfully logged in");
  }
  else{
    return res.status(200).json({message:"Invalid Login,User not registered"});
  }
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
 
  const {isbn} =req.params;
  
  const review=req.body.review;
  const username = req.body.username;

  if (!isbn || !review) {
    return res.status(400).json({ success: false, message: 'ISBN and review are required' });
  }

  // Find the book in the database
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }
  if (book.reviews[username]) {
    // If the user already posted a review, modify the existing review
    book.reviews[username] = review;
    res.json({ success: true, message: 'Review modified successfully' });
  } else {
    // If the user has not posted a review, add a new review
    book.reviews[username] = review;
    res.json({ success: true, message: 'Review added successfully' });
  }
});
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const { username } = req.user;
  
    // Find the book in the database
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
  
    // Check if the user has posted a review for the given ISBN
    if (book.reviews[username]) {
      // Delete the user's review
      delete book.reviews[username];
      return res.json({ success: true, message: 'Review deleted successfully' });
    } else {

        return res.status(404).json({ success: false, message: 'Review not found' });
    }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;