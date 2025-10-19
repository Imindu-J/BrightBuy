const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Browse all products (optionally filtered by category and search)
router.get('/', async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const searchTerm = req.query.search;
    
    let sql = 'SELECT * FROM Product WHERE Availability = 1';
    const params = [];
    
    if (categoryId) {
      sql += ' AND CategoryID = ?';
      params.push(categoryId);
    }
    
    if (searchTerm && searchTerm.trim()) {
      sql += ' AND (ProductName LIKE ? OR Brand LIKE ? OR Description LIKE ? OR SKU LIKE ?)';
      const searchPattern = `%${searchTerm.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add new product (warehouse or system admin)
router.post('/', authorize(['warehouse_admin', 'system_admin']), async (req, res) => {
  try {
    const { name, description, brand, price, categoryId, sku, imageURL } = req.body;
    const [result] = await db.query(
      `INSERT INTO Product (ProductName, Description, Brand, Base_price, CategoryID, SKU, ImageURL) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, brand, price, categoryId, sku, imageURL]
    );
    res.json({ message: 'Product added', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Advanced search endpoint with fuzzy matching
router.get('/search', async (req, res) => {
  try {
    const { q: searchTerm, category } = req.query;
    
    if (!searchTerm || !searchTerm.trim()) {
      return res.json([]);
    }
    
    const searchPattern = `%${searchTerm.trim()}%`;
    let sql = `
      SELECT DISTINCT p.*, c.CategoryName 
      FROM Product p 
      LEFT JOIN Category c ON p.CategoryID = c.CategoryID 
      WHERE p.Availability = 1 
      AND (
        p.ProductName LIKE ? 
        OR p.Brand LIKE ? 
        OR p.Description LIKE ? 
        OR p.SKU LIKE ?
        OR c.CategoryName LIKE ?
      )
    `;
    
    const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
    
    if (category && category !== 'all') {
      sql += ' AND p.CategoryID = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY p.ProductName';
    
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Fetch all variants
router.get('/variants', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Variant');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
});

// Fetch products with their variants (optional combined endpoint)
router.get('/with-variants', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, v.VariantID, v.Colour, v.Size, v.Model, v.Variant_Price, v.StockQuantity
      FROM Product p
      LEFT JOIN Variant v ON p.ProductID = v.ProductID
      WHERE p.Availability = 1
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products with variants' });
  }
});

module.exports = router;
