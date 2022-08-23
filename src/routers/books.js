// API spec https://boolean-uk.github.io/api-express-database/

const express = require('express')
const router = express.Router()
const db = require("../../db");

// RETRIEVE ALL BOOK (x)
// - query params
// -- type (x)
// -- topic (x)
router.get("/", async (req, res) => {
  let sqlQuery = "SELECT * FROM books"; // this var is storing SQL for 'get all from the books table'
  const params = [];
//   console.log(params);

  // if the type query "books?type=Blank" is present, run this code
  if (req.query.type) {
    sqlQuery += " WHERE type ILIKE $1"; // $1 is a placeholder param, in this case for Fiction of Non-Fiction. It avoids user misuse. 
    params.push(req.query.type); // this pushes the type query into the params array above
  }

  if(req.query.topic) {
    sqlQuery += " WHERE topic ILIKE $1";
    params.push(req.query.topic)
  }
  
  // this is waiting for a response from the db, adding the 'type' from the params const if one is specified
    const qResult = await db.query(sqlQuery, params);
    // if there is no type in the query params route
    // const qResult = await db.query(select * from books, []);
    // if there is a type in the query params route
    // const qResult = await db.query(select * from books where type = $1, ['Fiction']);

    // console.log(qResult);

    // rows property is an array of objects within the books object
    res.json({books: qResult.rows});
});
// GET A BOOK BY ID(x)
router.get("/:id", async (req, res) => {
const rp = req.params
  let sqlQuery = "SELECT * FROM books WHERE id = $1";
      const qResult = await db.query(sqlQuery, [rp.id]);
      res.json({ books: qResult.rows });
})
// CREATE A BOOK (x)
router.post('/', async (req, res) => {
    const rb = req.body
    let sqlQuery =
      `
      INSERT INTO books(title, type, author, topic, publicationDate, pages) 
      VALUES($1, $2, $3, $4, $5, $6)
      `;
    const qResult = await db.query(sqlQuery, [rb.title, rb.type, rb.author, rb.topic, rb.publicationDate, rb.pages]);
    res.status(201).json({ books: qResult.rows });
});



module.exports = router
