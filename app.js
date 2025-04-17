// app.js - Main application file
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.HOST,
  user: 'anis',
  password: 'Powerbanana42127',
  database: 'shop_goodwill',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Add this right after creating the pool
pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'You need to be logged in' });
};

// User Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName]
    );
    
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, u.username as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;

    const queryParams = [];
    const countParams = [];

    if (category) {
      query += ' AND c.id = ?';
      queryParams.push(category);
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Use template literals for pagination
    query += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [products] = await pool.execute(query, queryParams);

    // Count query and params (separate from product query)
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      WHERE p.status = 'active'
    `;

    if (category) {
      countQuery += ' AND p.category_id = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const totalProducts = countResult[0].total;

    res.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error('Product fetch error:', {
      message: error.message,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


app.get('/api/products/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name, u.username as seller_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Cart Routes
app.get('/api/cart', isAuthenticated, async (req, res) => {
  try {
    const [cartItems] = await pool.execute(
      `SELECT ci.*, p.title, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.session.userId]
    );
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

app.post('/api/cart', isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Check if product exists and is available
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ? AND status = "active"',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or not available' });
    }
    
    // Check if already in cart
    const [existingItems] = await pool.execute(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.session.userId, productId]
    );
    
    if (existingItems.length > 0) {
      // Update quantity
      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, req.session.userId, productId]
      );
    } else {
      // Add new item
      await pool.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.session.userId, productId, quantity]
      );
    }
    
    res.status(201).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart' });
  }
});

app.delete('/api/cart/:id', isAuthenticated, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

// Order Routes
app.post('/api/orders', isAuthenticated, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { shippingAddress, billingAddress, paymentMethod } = req.body;
    
    // Get cart items
    const [cartItems] = await connection.execute(
      `SELECT ci.*, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.session.userId]
    );
    
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, shipping_address, billing_address, payment_method) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, totalAmount, shippingAddress, billingAddress, paymentMethod]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items
    for (const item of cartItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      
      // Update product status
      await connection.execute(
        'UPDATE products SET status = "sold" WHERE id = ?',
        [item.product_id]
      );
    }
    
    // Clear cart
    await connection.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [req.session.userId]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Order created successfully',
      orderId,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  } finally {
    connection.release();
  }
});

app.get('/api/orders', isAuthenticated, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.userId]
    );
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
  try {
    // Get order
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get order items
    const [orderItems] = await pool.execute(
      `SELECT oi.*, p.title, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    
    res.json({
      order: orders[0],
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// User Profile Routes
app.get('/api/profile', isAuthenticated, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, first_name, last_name, address, city, state, zip_code, phone, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/profile', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, address, city, state, zipCode, phone } = req.body;
    
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, address = ?, city = ?, state = ?, zip_code = ?, phone = ? WHERE id = ?',
      [firstName, lastName, address, city, state, zipCode, phone, req.session.userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Serve the frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;