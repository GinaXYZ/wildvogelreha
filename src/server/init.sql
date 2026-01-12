-- Create tables for Wildvogel Rehastation

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role ENUM('user', 'staff', 'admin') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  imageUrl VARCHAR(255),
  category VARCHAR(100),
  author VARCHAR(100),
  date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  idproducts INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description LONGTEXT,
  category VARCHAR(100),
  amountLeft INT DEFAULT 0,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(idproducts) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  payment VARCHAR(50),
  status ENUM('pending', 'paid', 'shipped', 'delivered') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10, 2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(36) PRIMARY KEY,
  donor_name VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT IGNORE INTO users (id, username, password, firstname, lastname, email, role) VALUES
('admin-1', 'admin', '$2b$10$yRvvAaQxxRxaLQfP8l4DZuV/3wZg5Pz2KGqKz2YqKz2KGqKz2YqKq', 'Admin', 'User', 'admin@wildvogelreha.de', 'admin');

INSERT IGNORE INTO blog_posts (id, title, content, author, category, date) VALUES
('post-1', 'Willkommen auf unserer Seite', 'Herzlich willkommen zur Wildvogel Rehastation Waabs!', 'Admin', 'Allgemein', NOW());
