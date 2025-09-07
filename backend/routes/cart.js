const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Dakshayani@8",
  database: "ecommerce"
});

const JWT_SECRET = "mysecretkey123";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

router.post("/add", verifyToken, (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ error: "Product ID required" });

  const checkQuery = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(checkQuery, [req.userId, productId], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      const updateQuery = "UPDATE cart SET quantity = quantity + ? WHERE id = ?";
      db.query(updateQuery, [quantity || 1, results[0].id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Cart updated" });
      });
    } else {
      const insertQuery = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
      db.query(insertQuery, [req.userId, productId, quantity || 1], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Item added to cart" });
      });
    }
  });
});

router.get("/", verifyToken, (req, res) => {
  const query = `
    SELECT c.id, p.name, p.price, p.image, c.quantity 
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.delete("/remove/:id", verifyToken, (req, res) => {
  const cartId = req.params.id;
  const query = "DELETE FROM cart WHERE id = ? AND user_id = ?";
  db.query(query, [cartId, req.userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Item removed from cart" });
  });
});

module.exports = router;
