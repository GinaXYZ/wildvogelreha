require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only_2024!';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shop',
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kein Token' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Bitte erst anmelden.' });
    req.user = user;
    next();
  });
}

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

app.listen(3000, () => {
  console.log('API läuft auf http://localhost:3000');
});

app.get('/api/blog', async (req, res) => {
  const query = `
    SELECT id, title, content, imageUrl, category, author, date 
    FROM blog_posts 
    ORDER BY date DESC
  `;
  try {
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    console.error('Fehler beim Abrufen der Blog-Einträge:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Blog-Einträge' });
  }
});

app.post('/api/blog', authenticateToken,async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung für Blog-Posts' });
  }

  const { title, content, imageUrl, category, author } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Titel und Inhalt sind erforderlich' });
  }
  const id = uuidv4();
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = `
    INSERT INTO blog_posts (id, title, content, imageUrl, category, author, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [id, title, content, imageUrl || null, category || null, author, date];
  try {
    await pool.query(query, values);
    const newPost = { id, title, content, imageUrl, category, author, date };
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Fehler beim Erstellen des Blog-Eintrags:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Blog-Eintrags' });
  }
});

app.delete('/api/blog/:id',authenticateToken, async (req, res) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Löschen' });
  }

  const { id } = req.params;
  const query = 'DELETE FROM blog_posts WHERE id = ?';
  try {
    const [result] = await pool.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog-Eintrag nicht gefunden' });
    }
    res.status(200).json({ message: 'Blog-Eintrag erfolgreich gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen des Blog-Eintrags:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Blog-Eintrags' });
  }
});


app.post('/api/register', async (req, res) => {
  const { username, password, firstname, lastname, email } = req.body;
  if (!username || !password || !firstname || !lastname || !email) {
    return res.status(400).json({ error: 'Alle Felder (Benutzername, Passwort, Vorname, Nachname, E-Mail) sind erforderlich' });
  }
  const assignedRole = 'customer';
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (id, username, password, firstname, lastname, email, role) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [id, username, hashedPassword, firstname, lastname, email, assignedRole];
  try {
    await pool.query(query, values);
    res.status(201).json({ message: 'Benutzer erfolgreich registriert', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Benutzername oder E-Mail existiert bereits' });
    }
    console.error('Fehler beim Registrieren:', err);
    res.status(500).json({ error: 'Fehler beim Registrieren' });
  }
});

app.post('/api/login',async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
  }
  const query = 'SELECT id, username, password, role FROM users WHERE username = ?';
  try {
    const [results] = await pool.query(query, [username]);
    const user = results[0];
    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({
      token, 
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error('Fehler beim Login:', err);
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    console.error('Keine Benutzer-ID bereitgestellt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const query = 'SELECT id, username, firstname, lastname, email, date, role FROM users WHERE id = ?';
  try {
    const [results] = await pool.query(query, [userId]);
    if (results.length === 0) {
      console.error('Benutzer nicht gefunden');
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }
    const user = results[0];
    res.json({
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      date: user.date,
    });
  } catch (err) {
    console.error('Fehler bei der Datenbankabfrage:', err);
    res.status(500).json({ error: 'Fehler bei der Datenbankabfrage' });
  }
});


app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const category = req.query.category; 
  const searchTerm = req.query.search; 

  let whereClauses = [];
  let queryParams = [];

  if (category && category !== 'Alle') {
    whereClauses.push("category = ?");
    queryParams.push(category);
  }

  if (searchTerm) {
    whereClauses.push("(title LIKE ? OR description LIKE ?)");
    queryParams.push(`%${searchTerm}%`);
    queryParams.push(`%${searchTerm}%`);
  }

  const whereCondition = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const productsQuery = `
    SELECT idproducts AS id, title, price, description, category, amountLeft, image
    FROM products
    ${whereCondition}
    ORDER BY title ASC
    LIMIT ?
    OFFSET ?
  `;

  const finalProductsParams = [...queryParams, limit, offset];

  const countQuery = `
    SELECT COUNT(*) as count
    FROM products
    ${whereCondition}
  `;

  const finalCountParams = [...queryParams];


  try {
    const [results] = await pool.query(productsQuery, finalProductsParams);
    const [[{ count }]] = await pool.query(countQuery, finalCountParams);

    res.json({
      results: results,
      count: count
    });
  } catch (err) {
    console.error('Fehler beim Abrufen der Produkte aus der DB:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Produkte' });
  }
});

app.post('/api/products', authenticateToken,async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nur Admins können Produkte hinzufügen' });
  }

  const { title, price, description, category, amountLeft, image } = req.body;
  if (!title || !price || !description || !category || !amountLeft || !image) {
    return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt sein.' });
  }
  const id = uuidv4();
  const query = `
    INSERT INTO products (idproducts, title, price, description, category, amountLeft, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    await pool.query(query, [id, title, price, description, category, amountLeft, image]);
    res.status(201).json({ message: 'Produkt erfolgreich hinzugefügt', id });
  } catch (err) {
    console.error('Fehler beim Hinzufügen des Produkts:', err);
    res.status(500).json({ error: 'Fehler beim Hinzufügen des Produkts' });
  }
});


app.get('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const query = `
    SELECT c.product_id AS idproducts, p.title, p.price, p.image, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.idproducts
    WHERE c.user_id = ?
  `;
  try {
    const [results] = await pool.query(query, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Fehler beim Abrufen des Warenkorbs:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen des Warenkorbs' });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { cart } = req.body;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: 'Cart muss ein Array sein' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    if (cart.length > 0) {
      const insertPromises = cart.map(item => {
        if (!item || typeof item.id === 'undefined' || typeof item.quantity === 'undefined' || item.quantity <= 0) {
          return Promise.resolve();
        }
        const insertQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
        return connection.query(insertQuery, [userId, item.id, item.quantity]);
      });
      await Promise.all(insertPromises);
    }
    await connection.commit();
    res.json({ message: 'Warenkorb erfolgreich aktualisiert' });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Verarbeiten des Warenkorbs:', error);
    res.status(500).json({
      error: 'Fehler beim Verarbeiten des Warenkorbs',
      details: error.message
    });
  } finally {
    connection.release();
  }
});


app.get('/api/category', async (req, res) => {
  const query = 'SELECT DISTINCT category FROM products';
  try {
    const [results] = await pool.query(query);
    const categories = results.map(row => row.category);
    res.json(categories);
  } catch (err) {
    console.error('Fehler beim Abrufen der Kategorien:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Kategorien' });
  }
});


app.post('/api/order', authenticateToken,async (req, res) => {
  const { firstname, lastname, email, address, city, country, payment, cart, userId } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Warenkorb ist leer.' });
  }
  const orderId = uuidv4();
  const orderQuery = `
    INSERT INTO orders (id, user_id, firstname, lastname, email, address, city, country, payment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      orderQuery,
      [orderId, userId || null, firstname, lastname, email, address, city, country, payment]
    );
    const items = cart.map(item => [
      uuidv4(), 
      orderId,
      item.idproducts || item.id,
      item.quantity,
      item.price
    ]);
    const itemsQuery = 'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ?';
    await connection.query(itemsQuery, [items]);
    await connection.commit();
    res.json({ message: 'Bestellung erfolgreich aufgegeben', orderId });
  } catch (orderErr) {
    await connection.rollback();
    console.error('Fehler beim Anlegen der Bestellung:', orderErr);
    res.status(500).json({ error: 'Fehler beim Anlegen der Bestellung' });
  } finally {
    connection.release();
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  let query, params;
  if (role === 'admin' || role === 'staff') {
    query = `
      SELECT o.*, oi.product_id, oi.quantity, oi.price, p.title, p.image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.idproducts
      ORDER BY o.created_at DESC
    `;
    params = [];
  } else {
    query = `
      SELECT o.*, oi.product_id, oi.quantity, oi.price, p.title, p.image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.idproducts
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    params = [userId];
  }
  try {
    const [results] = await pool.query(query, params);
    const orders = [];
    const map = {};
    results.forEach(row => {
      if (!map[row.id]) {
        map[row.id] = {
          id: row.id,
          user_id: row.user_id,
          firstname: row.firstname,
          lastname: row.lastname,
          created_at: row.created_at,
          payment: row.payment,
          address: row.address,  
          city: row.city,         
          country: row.country,   
          items: [],
          status: row.status,
        };
        orders.push(map[row.id]);
      }
      map[row.id].items.push({
        product_id: row.product_id,
        title: row.title,
        image: row.image,
        quantity: row.quantity,
        price: row.price
      });
    });
    res.json(orders);
  } catch (err) {
    console.error('Fehler beim Abrufen der Bestellungen:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Bestellungen' });
  }
});

app.post('/api/order-status', authenticateToken,async (req, res) => {
  const { orderId, status } = req.body;
  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  try {
    await pool.query(query, [status, orderId]);
    res.json({ message: 'Status aktualisiert' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
  }
});


app.get('/api/donations', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const [results] = await pool.query(
      'SELECT id, donor_name, amount, created_at FROM donations ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM donations');
    res.json({ results, count });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Spenden' });
  }
});

app.get('/api/donations/top10', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT donor_name, amount, created_at, id FROM donations ORDER BY amount DESC LIMIT 10'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Spenden' });
  }
});


app.get('/api/blog/latest', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  try {
    const [results] = await pool.query(
      'SELECT id, title, content, date AS created_at FROM blog_posts ORDER BY date DESC LIMIT ?',
      [limit]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Blogposts' });
  }
});


app.get('/api/map-items', async (req, res) => {
  const query = `
    SELECT id, label, class, x, y, image, name, species, age, description, status 
    FROM map_items ORDER BY id
  `;
  try {
    const [results] = await pool.query(query);
    const formattedItems = results.map(row => ({
      id: row.id,
      label: row.label,
      class: row.class,
      x: parseFloat(row.x),
      y: parseFloat(row.y),
      image: row.image,
      details: {
        name: row.name,
        species: row.species,
        age: row.age,
        description: row.description,
        status: row.status
      }
    }));
    res.json(formattedItems);
  } catch (err) {
    console.error('Fehler beim Laden der Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Map Items' });
  }
});

app.post('/api/map-items', authenticateToken,async (req, res) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
  }
  const { label, class: itemClass, x, y, image, details } = req.body;
  const query = `
    INSERT INTO map_items (label, class, x, y, image, name, species, age, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    label,
    itemClass || 'voliere-new',
    x,
    y,
    image,
    details.name,
    details.species || '',
    details.age || '',
    details.description || '',
    details.status || 'Gesund'
  ];
  try {
    const [result] = await pool.query(query, values);
    res.json({ id: result.insertId, message: 'Item erstellt' });
  } catch (err) {
    console.error('Fehler beim Erstellen des Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Map Items' });
  }
});

app.put('/api/map-items/:id', authenticateToken,async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
  }
  
  const { id } = req.params;
  const { label, class: itemClass, x, y, image, details } = req.body;
  const query = `
    UPDATE map_items 
    SET label = ?, class = ?, x = ?, y = ?, image = ?, 
        name = ?, species = ?, age = ?, description = ?, status = ?
    WHERE id = ?
  `;
  const values = [
    label,
    itemClass,
    x,
    y,
    image,
    details.name,
    details.species,
    details.age,
    details.description,
    details.status,
    id
  ];
  try {
    await pool.query(query, values);
    res.json({ message: 'Item aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Map Items' });
  }
});

app.delete('/api/map-items/:id', authenticateToken,async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Löschen' });
  }

  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM map_items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Map Item nicht gefunden' });
    }
    res.json({ message: 'Item gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen des Map Items:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Map Items' });
  }
});
app.put('/api/blog/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
  }

  const { id } = req.params;
  const { title, content, imageUrl, category } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Titel und Inhalt sind erforderlich' });
  }
  
  const query = `
    UPDATE blog_posts 
    SET title = ?, content = ?, imageUrl = ?, category = ?
    WHERE id = ?
  `;
  
  try {
    const [result] = await pool.query(query, [title, content, imageUrl || null, category || null, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog-Eintrag nicht gefunden' });
    }
    res.json({ message: 'Blog-Eintrag erfolgreich aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Blog-Eintrags:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Blog-Eintrags' });
  }
});
app.post('/api/contact', async (req, res) => {
  const { firstname, lastname, email, telefon, msg } = req.body;
  if (!firstname || !lastname || !email || !telefon) {
    return res.status(400).json({ error: 'Vorname, Nachname, E-Mail und Telefon sind erforderlich' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail Adresse' });
  }
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Ungültige Telefonnummer' });
  }
  const id = uuidv4();
  const query = 'INSERT INTO contacts (id, firstname, lastname, email, telefon, msg) VALUES (?, ?, ?, ?, ?, ?)';
  try {
    await pool.query(query, [id, firstname, lastname, email, telefon, msg || null]);
    res.json({ 
      message: 'Kontaktdaten erfolgreich gespeichert',
      id
    });
  } catch (err) {
    console.error('Fehler beim Speichern des Kontakts:', err);
    res.status(500).json({ error: 'Fehler beim Speichern der Daten' });
  }
});

app.get('/api/contacts', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const [results] = await pool.query(
      'SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM contacts');
    res.json({ results, count });
  } catch (err) {
    console.error('Fehler beim Laden der Kontakte:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Kontakte' });
  }
});

app.put('/api/contacts/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, price, description, category, amountLeft, image } = req.body;
  
  if (!title || !price || !description || !category || !amountLeft || !image) {
    return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt sein.' });
  }
  
  const query = `
    UPDATE products 
    SET title = ?, price = ?, description = ?, category = ?, amountLeft = ?, image = ?
    WHERE idproducts = ?
  `;
  
  try {
    const [result] = await pool.query(query, [title, price, description, category, amountLeft, image, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produkt nicht gefunden' });
    }
    res.json({ message: 'Produkt erfolgreich aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Produkts:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Produkts' });
  }
});
app.delete('/api/contacts/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
    res.json({ message: 'Kontakt gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});


app.get('/api/patients', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const [results] = await pool.query(
      'SELECT id, name, species, status, admission_date, created_at, details FROM patients ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM patients');
    res.json({ results, count });
  } catch (err) {
    console.error('Fehler beim Laden der Patienten:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Patienten' });
  }
});

app.post('/api/patients', authenticateToken,async (req, res) => {
  const { name, species, status, admission_date, details } = req.body;
  if (!name || !species || !status || !admission_date) {
    return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt sein.' });
  }
  const id = uuidv4();
  const query = `
    INSERT INTO patients (id, name, species, status, admission_date, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  try {
    await pool.query(query, [id, name, species, status, admission_date, details || null]);
    res.status(201).json({ message: 'Patient erfolgreich hinzugefügt', id });
  } catch (err) {
    console.error('Fehler beim Hinzufügen des Patienten:', err);
    res.status(500).json({ error: 'Fehler beim Hinzufügen des Patienten' });
  }
});

app.put('/api/patients/:id', authenticateToken,async (req, res) => {
  const { id } = req.params;
  const { status, details } = req.body;
  const query = 'UPDATE patients SET status = ?, details = ? WHERE id = ?';
  try {
    await pool.query(query, [status, details, id]);
    res.json({ message: 'Patient aktualisiert' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Patienten:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Patienten' });
  }
});
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nur Admins können Produkte löschen' });
  }
  
  try {
    const [result] = await pool.query('DELETE FROM products WHERE idproducts = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produkt nicht gefunden' });
    }
    res.json({ message: 'Produkt erfolgreich gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen des Produkts:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Produkts' });
  }
});