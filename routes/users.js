var express = require("express");
var router = express.Router();
const { ensureSameUser } = require("../middleware/guards");
const db = require("../model/helper");
const { joinToJson, clubsSql, booksSql } = require("./commonfunctions");

function clubsFilters(query) {
  let filters = [];

  if (query.name) {
    filters.push(`clubs.name LIKE '%${query.name}%'`);
  }
  if (query.category) {
    filters.push(`clubs.category LIKE '%${query.category}%'`);
  }
  if (query.next_mtg_city) {
    filters.push(`clubs.next_mtg_city LIKE '%${query.next_mtg_city}%'`);
  }

  return filters.join(" AND ");
}

function bookFilters(query) {
  let filters = [];

  if (query.title) {
    filters.push(`books.title LIKE '%${query.title}%'`);
  }
  if (query.author) {
    filters.push(`books.author LIKE '%${query.author}%'`);
  }
  return filters.join(" AND ");
}

/**
 * Get all users
 **/
router.get("/", async function (req, res) {
  let sql = "SELECT * FROM users ORDER BY username";

  try {
    let results = await db(sql);
    let users = results.data;
    users.forEach((u) => delete u.password);
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

/**
 * Get one user.
 **/

router.get("/:userId", ensureSameUser, async function (req, res) {
  let { userId } = req.params;
  let whereC = clubsFilters(req.query);
  let whereB = bookFilters(req.query);
  let cSql = "";
  let bSql = "";

  try {
    whereC
      ? (cSql = `${clubsSql} WHERE ${whereC} AND users.id = ${userId}`)
      : (cSql = `${clubsSql} WHERE users.id = ${userId}`);
    whereB
      ? (bSql = `${booksSql} WHERE ${whereB} AND users.id = ${userId}`)
      : (bSql = `${booksSql} WHERE users.id = ${userId}`);

    let booksResults = await db(bSql);
    let clubsResults = await db(cSql);

    res.send(joinToJson(booksResults, clubsResults));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

/**
 * Add Book For One User.
 **/
router.post("/:user_id", async function (req, res) {
  let { user_id } = req.params;
  let { book_id, rating, comment, date_read, favorite } = req.body;
  // sql command line for inserting book
  let sql = `INSERT INTO users_books (user_id, book_id, rating, comment, date_read, favorite)
    VALUES (${user_id}, ${book_id}, ${rating}, '${comment}', '${date_read}', ${favorite}); SELECT LAST_INSERT_ID();`;
  // adding new book
  try {
    let results = await db(sql); // add book when function called

    //then get one user
    let whereC = clubsFilters(req.query);
    let whereB = bookFilters(req.query);
    let cSql = "";
    let bSql = "";

    whereC
      ? (cSql = `${clubsSql} WHERE ${whereC} AND users.id = ${user_id}`)
      : (cSql = `${clubsSql} WHERE users.id = ${user_id}`);
    whereB
      ? (bSql = `${booksSql} WHERE ${whereB} AND users.id = ${user_id}`)
      : (bSql = `${booksSql} WHERE users.id = ${user_id}`);

    let booksResults = await db(bSql);
    let clubsResults = await db(cSql);

    res.send(joinToJson(booksResults, clubsResults));
    // server error
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
