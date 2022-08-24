// API spec https://boolean-uk.github.io/api-express-database/
// Extension spec https://boolean-uk.github.io/api-express-database/extensions

const express = require('express')
const router = express.Router()
const db = require("../../db");

// RETRIEVE ALL BOOK (x)
// - query params
// -- type (x)
// -- topic (x)
// -- author ()
// -- page ()
// -- per page ()
router.get("/", async (req, res) => {
  const rq = req.query
  let sqlQuery = "SELECT * FROM books"; // this var is storing SQL for 'get all from the books table'
  const params = [];
//   console.log(params);

  // if the type query "books?type=Blank" is present, run this code
  if (req.query.type) {
    sqlQuery += " WHERE type ILIKE $1"; // $1 is a placeholder param, in this case for Fiction of Non-Fiction. It avoids user misuse. 
    params.push(rq.type); // this pushes the type query into the params array above
  }
  if(req.query.topic) {
    sqlQuery += " WHERE topic ILIKE $1";
    params.push(rq.topic)
  }
  if (req.query.author) {
    sqlQuery += " WHERE topic ILIKE $1";
    params.push(rq.author);
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

// -------- GET A BOOK BY ID(x) --------
// - 404 id not found (x)
router.get("/:id", async (req, res) => {
  const rp = req.params
  // console.log(rp);
  let sqlQuery = "SELECT * FROM books WHERE id = $1";
  
  const qResult = await db.query(sqlQuery, [rp.id]);
    if(!qResult.rowCount){ // throws an error if no rows are found. We are looking for a single row, so there are no rows to count
      return res.status(404).json({
        error: '404 - Book not found'
      })
    }
  res.json({ books: qResult.rows });
})

// -------- CREATE A BOOK (x) --------
// - errors! ()
// -- error if you try to create a book with a title AND author that already exists (x)
// -- error if any input fields are blank ()
router.post('/', async (req, res) => {
  const rb = req.body;

  // scan all titles in the table, if none match $1/$2 (rb.title/rb.author) it should NOT be undefined
  let existingBook = `
    SELECT title, author FROM books
    WHERE title = $1 AND author = $2
  `;
  const eResult = await db.query(existingBook, [rb.title, rb.author]);
  if (eResult.rows[0] != undefined) {
    return res.status(409).json({
      error: "409 - Book already exists",
    });
  }

  let sqlQuery = `
    INSERT INTO books(title, type, author, topic, publicationDate, pages) 
    VALUES($1, $2, $3, $4, $5, $6)
      `;
  const qResult = await db.query(sqlQuery, [
    rb.title,
    rb.type,
    rb.author,
    rb.topic,
    rb.publicationDate,
    rb.pages,
  ]);
  res.status(201).json({ books: qResult.rows });
});

// -------- UPDATE A BOOK (x) --------
// - 404 id not found (x)
// - 409 title already exists (x)
router.put('/:id', async (req, res) => {
  const rp = req.params; // require params pulls from the user supplied value (in this case id)
  const rb = req.body; // require body pulls from the JSON

  let existingBook = `
    SELECT title, author FROM books
    WHERE title = $1 AND author = $2
  `;
  const eResult = await db.query(existingBook, [
    rb.title, rb.author
  ])
  // console.log('eresult', eResult);
  if(eResult.rows[0] != undefined) {
    return res.status(409).json({ 
      error: "409 - Book already exists" 
    });
  }

  let sqlQuery = `
    UPDATE books SET title = $2, type = $3, author = $4, topic = $5, publicationDate = $6, pages = $7
    WHERE id = $1
    RETURNING *
    `;
  const qResult = await db.query(sqlQuery, [
    rp.id,
    rb.title,
    rb.type,
    rb.author,
    rb.topic,
    rb.publicationDate,
    rb.pages,
  ]);
  if (!qResult.rowCount) {
    return res.status(404).json({
      error: "404 - Book not found",
    });
  } 
  res.status(201).json({ books: qResult.rows });
});

// --------DELETING A BOOK (x) --------
// - 404 id not found (x)
router.delete('/:id', async (req, res) => {
  const rp = req.params.id
  // RETURNING * in this query will result in the book not actually being deleted
  let sqlQuery = `
  DELETE FROM books
  WHERE id = $1
  `;
  const qResult = await db.query(sqlQuery, [rp.id]);  
    if (!qResult.rowCount) {
      return res.status(404).json({
        error: "404 - Book not found",
      });
    }
  res.status(201).json({ books: qResult.rows });
})

module.exports = router
