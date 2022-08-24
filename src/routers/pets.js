const express = require("express");
const router = express.Router();
const db = require("../../db");

// RETRIEVE ALL PETS (x)
// - query params
// -- type (x)
router.get("/", async (req, res) => {
  let sqlQuery = "SELECT * FROM pets"; 
  const params = [];

  if (req.query.type) {
    sqlQuery += " WHERE type ILIKE $1"; 
    params.push(req.query.type); 
  }

const qResult = await db.query(sqlQuery, params);

  res.json({ pets: qResult.rows });
});
// GET A PET BY ID(x)
router.get("/:id", async (req, res) => {
  const rp = req.params;
  let sqlQuery = "SELECT * FROM pets WHERE id = $1";
  const qResult = await db.query(sqlQuery, [rp.id]);
  res.json({ pets: qResult.rows });
});
// CREATE A PET (x)
router.post("/", async (req, res) => {
  const rb = req.body;
  let sqlQuery = `
      INSERT INTO pets(name, age, type, breed, microchip) 
      VALUES($1, $2, $3, $4, $5)
      RETURNING *
      `;
  const qResult = await db.query(sqlQuery, [
    rb.name,
    rb.age,
    rb.type,
    rb.breed,
    rb.microchip
  ]);
  res.status(201).json({ pets: qResult.rows });
});
// UPDATE A PET (x)
router.put("/:id", async (req, res) => {
  const rp = req.params;
  const rb = req.body; 
  let sqlQuery = `
      UPDATE pets SET name = $2, age = $3, type = $4, breed = $5, microchip = $6
      WHERE id = $1
      RETURNING *
      `;
  const qResult = await db.query(sqlQuery, [
    rp.id,
    rb.name,
    rb.age,
    rb.type,
    rb.breed,
    rb.microchip
  ]);
  res.status(201).json({ pets: qResult.rows });
});

// DELETING A PET (x)
router.delete("/:id", async (req, res) => {
  const rp = req.params.id;
  let sqlQuery = `
  DELETE FROM pets
  WHERE id = $1
  `;
  const qResult = await db.query(sqlQuery, [rp.id]);
  res.status(201).json({ pets: qResult.rows });
});

module.exports = router;
