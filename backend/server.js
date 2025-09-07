 const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",   
  user: "root",        
  password: "Dakshayani@8", 
  database: "ecommerce"      
});

db.connect(err => {
  if (err) {
    console.log("MySQL connection error:", err);
    return;
  }
  console.log(" MySQL Connected...");
});

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);

