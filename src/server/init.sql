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

-- Users (password = 'test123' für alle)
INSERT IGNORE INTO users (id, username, password, firstname, lastname, email, role) VALUES
('admin-1', 'admin', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Admin', 'User', 'admin@wildvogelreha.de', 'admin'),
('staff-1', 'marie', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Marie', 'Schmidt', 'marie@wildvogelreha.de', 'staff'),
('staff-2', 'tobias', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Tobias', 'Müller', 'tobias@wildvogelreha.de', 'staff'),
('staff-3', 'lisa', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Lisa', 'Wagner', 'lisa@wildvogelreha.de', 'staff'),
('user-1', 'testuser', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Test', 'User', 'user@wildvogelreha.de', 'user'),
('user-2', 'anna', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Anna', 'Becker', 'anna@email.de', 'user'),
('user-3', 'max', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Max', 'Hoffmann', 'max@email.de', 'user'),
('user-4', 'sarah', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Sarah', 'Klein', 'sarah@email.de', 'user'),
('user-5', 'felix', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Felix', 'Weber', 'felix@email.de', 'user'),
('user-6', 'laura', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Laura', 'Fischer', 'laura@email.de', 'user'),
('user-7', 'jonas', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Jonas', 'Schneider', 'jonas@email.de', 'user'),
('user-8', 'julia', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Julia', 'Meyer', 'julia@email.de', 'user'),
('user-9', 'lukas', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Lukas', 'Braun', 'lukas@email.de', 'user'),
('user-10', 'emma', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Emma', 'Hartmann', 'emma@email.de', 'user'),
('user-11', 'leon', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Leon', 'Krüger', 'leon@email.de', 'user'),
('user-12', 'mia', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Mia', 'Wolf', 'mia@email.de', 'user'),
('user-13', 'paul', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Paul', 'Schäfer', 'paul@email.de', 'user'),
('user-14', 'sophia', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Sophia', 'Koch', 'sophia@email.de', 'user'),
('user-15', 'ben', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Ben', 'Bauer', 'ben@email.de', 'user'),
('user-16', 'lena', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Lena', 'Richter', 'lena@email.de', 'user'),
('user-17', 'tim', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Tim', 'Neumann', 'tim@email.de', 'user'),
('user-18', 'hannah', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Hannah', 'Schwarz', 'hannah@email.de', 'user');

-- Blog Posts
INSERT IGNORE INTO blog_posts (id, title, content, author, category, date) VALUES
('post-1', 'Willkommen auf unserer Seite', 'Herzlich willkommen zur Wildvogel Rehastation Waabs! Wir freuen uns, dass Sie den Weg zu uns gefunden haben.', 'Admin', 'Allgemein', '2026-01-01 10:00:00'),
('post-2', 'Neuer Rotmilan aufgenommen', 'Heute wurde ein verletzter Rotmilan bei uns aufgenommen. Der Vogel hatte eine Flügelverletzung und wird nun von unserem Team versorgt.', 'Marie Schmidt', 'Patienten', '2026-01-02 14:30:00'),
('post-3', 'Winterfütterung startet', 'Mit dem Beginn der kalten Jahreszeit starten wir unsere Winterfütterung. Tipps zur richtigen Fütterung finden Sie hier.', 'Tobias Müller', 'Tipps', '2026-01-03 09:15:00'),
('post-4', 'Erfolgreiche Auswilderung', '5 Jungstörche wurden heute erfolgreich ausgewildert. Ein großer Erfolg für unser Team!', 'Lisa Wagner', 'Erfolge', '2026-01-04 16:00:00'),
('post-5', 'Spendenaufruf für neue Voliere', 'Wir benötigen Ihre Unterstützung für den Bau einer neuen Großvoliere. Jeder Euro hilft!', 'Admin', 'Spenden', '2026-01-05 11:00:00'),
('post-6', 'Workshop: Erste Hilfe für Wildvögel', 'Am 20. Januar findet unser Workshop zur Ersten Hilfe bei verletzten Wildvögeln statt.', 'Marie Schmidt', 'Events', '2026-01-06 13:45:00'),
('post-7', 'Eulen-Saison beginnt', 'Die Brutsaison der Eulen steht bevor. Wir bereiten uns auf vermehrte Aufnahmen vor.', 'Tobias Müller', 'Allgemein', '2026-01-07 10:30:00'),
('post-8', 'Danke an unsere Helfer', 'Ein großes Dankeschön an alle ehrenamtlichen Helfer, die uns täglich unterstützen!', 'Admin', 'Danke', '2026-01-08 15:20:00'),
('post-9', 'Kranich Kroni erholt sich', 'Unser Sorgenkind Kroni, ein verletzter Kranich, macht große Fortschritte bei der Genesung.', 'Lisa Wagner', 'Patienten', '2026-01-09 12:00:00'),
('post-10', 'Neue Medikamente eingetroffen', 'Dank großzügiger Spenden konnten wir wichtige Medikamente für unsere Patienten beschaffen.', 'Marie Schmidt', 'News', '2026-01-10 09:00:00'),
('post-11', 'Besuch von Schulklasse', 'Heute besuchte uns die 4. Klasse der Grundschule Waabs. Die Kinder waren begeistert!', 'Tobias Müller', 'Events', '2026-01-11 14:00:00'),
('post-12', 'Seltener Seeadler aufgenommen', 'Ein seltener Seeadler wurde bei uns eingeliefert. Die Behandlung verläuft planmäßig.', 'Admin', 'Patienten', '2026-01-12 08:30:00');

-- Products
INSERT IGNORE INTO products (title, price, description, category, amountLeft, image) VALUES
('Vogelfutter Premium Mix', 19.99, 'Hochwertiges Mischfutter für verschiedene Vogelarten', 'Futter', 50, 'image1.jpg'),
('Nistkästen Holz', 34.99, 'Natürliche Nistkästen aus Massivholz', 'Nistplätze', 20, 'image2.jpg'),
('Wärmlampe 100W', 24.99, 'Infrarot-Wärmlampe für Inkubation', 'Ausrüstung', 15, 'image3.jpg'),
('Medikament Antibiotika Set', 49.99, 'Veterinär-Antibiotikaset', 'Medikamente', 10, 'image4.jpg'),
('Futternapf Edelstahl 5L', 14.99, 'Robuster Futternapf aus Edelstahl', 'Zubehör', 30, 'image5.jpg'),
('Wildvogel T-Shirt', 29.99, 'Bio-Baumwolle T-Shirt mit Vogelmotiv', 'Merchandise', 40, 'image6.jpg'),
('Vogelbestimmungsbuch', 22.50, 'Umfassendes Nachschlagewerk heimischer Vögel', 'Bücher', 25, 'image7.jpg'),
('Transportbox klein', 39.99, 'Sichere Transportbox für kleine Vögel', 'Transport', 12, 'image8.jpg'),
('Transportbox groß', 59.99, 'Sichere Transportbox für größere Vögel', 'Transport', 8, 'image9.jpg'),
('Pipetten Set 10er', 8.99, 'Fütterungspipetten für Jungvögel', 'Zubehör', 60, 'image10.jpg'),
('Desinfektionsmittel 1L', 12.99, 'Spezielles Desinfektionsmittel für Volieren', 'Hygiene', 35, 'image11.jpg'),
('Wildvogel Tasse', 15.99, 'Keramiktasse mit Eulenmotiv', 'Merchandise', 50, 'image12.jpg'),
('Erste-Hilfe-Set Vögel', 44.99, 'Komplettes Set für Notfallversorgung', 'Medizin', 18, 'image13.jpg'),
('Mehlwürmer getrocknet 500g', 16.99, 'Proteinreiches Zusatzfutter', 'Futter', 45, 'image14.jpg'),
('Kalender 2026', 18.99, 'Wandkalender mit Vogelfotos', 'Merchandise', 30, 'image15.jpg');

-- Donations
INSERT IGNORE INTO donations (id, donor_name, amount, created_at) VALUES
('don-1', 'Familie Müller', 500.00, '2026-01-01 10:00:00'),
('don-2', 'Hans Schmidt', 100.00, '2026-01-02 11:30:00'),
('don-3', 'Anonym', 250.00, '2026-01-03 09:15:00'),
('don-4', 'Tierfreunde Kiel e.V.', 1000.00, '2026-01-04 14:00:00'),
('don-5', 'Maria Weber', 75.00, '2026-01-05 16:45:00'),
('don-6', 'Dr. Klaus Becker', 200.00, '2026-01-06 10:30:00'),
('don-7', 'Sparkasse Eckernförde', 2500.00, '2026-01-07 09:00:00'),
('don-8', 'Anonym', 50.00, '2026-01-08 13:20:00'),
('don-9', 'Schulklasse 4b', 127.50, '2026-01-09 11:00:00'),
('don-10', 'Peter und Inge Hoffmann', 350.00, '2026-01-10 15:30:00'),
('don-11', 'Landfrauen Waabs', 180.00, '2026-01-11 10:00:00'),
('don-12', 'Thomas Richter', 60.00, '2026-01-12 08:45:00'),
('don-13', 'Anonym', 500.00, '2025-12-20 12:00:00'),
('don-14', 'Firma Vogelschutz GmbH', 3000.00, '2025-12-15 09:30:00'),
('don-15', 'Elisabeth Krause', 150.00, '2025-12-10 14:15:00'),
('don-16', 'Jägerschaft Eckernförde', 800.00, '2025-12-05 11:00:00'),
('don-17', 'Anonym', 25.00, '2025-12-01 16:00:00'),
('don-18', 'Kindergarten Sonnenschein', 89.00, '2025-11-28 10:30:00'),
('don-19', 'Rotary Club Kiel', 1500.00, '2025-11-20 09:00:00'),
('don-20', 'Familie Petersen', 200.00, '2025-11-15 13:45:00');

-- Orders
INSERT IGNORE INTO orders (id, user_id, firstname, lastname, email, address, city, country, payment, status, created_at) VALUES
('order-1', 'user-2', 'Anna', 'Becker', 'anna@email.de', 'Hauptstr. 12', 'Kiel', 'Deutschland', 'PayPal', 'delivered', '2026-01-02 10:00:00'),
('order-2', 'user-3', 'Max', 'Hoffmann', 'max@email.de', 'Bahnhofstr. 5', 'Eckernförde', 'Deutschland', 'Kreditkarte', 'shipped', '2026-01-05 14:30:00'),
('order-3', 'user-4', 'Sarah', 'Klein', 'sarah@email.de', 'Bergweg 8', 'Rendsburg', 'Deutschland', 'Überweisung', 'paid', '2026-01-08 09:15:00'),
('order-4', 'user-5', 'Felix', 'Weber', 'felix@email.de', 'Seestr. 22', 'Flensburg', 'Deutschland', 'PayPal', 'pending', '2026-01-10 16:00:00'),
('order-5', 'user-6', 'Laura', 'Fischer', 'laura@email.de', 'Waldweg 3', 'Schleswig', 'Deutschland', 'Kreditkarte', 'delivered', '2026-01-03 11:00:00'),
('order-6', 'user-7', 'Jonas', 'Schneider', 'jonas@email.de', 'Parkstr. 15', 'Husum', 'Deutschland', 'PayPal', 'delivered', '2025-12-28 13:45:00'),
('order-7', 'user-8', 'Julia', 'Meyer', 'julia@email.de', 'Lindenallee 7', 'Kiel', 'Deutschland', 'Überweisung', 'shipped', '2026-01-09 10:30:00'),
('order-8', 'user-9', 'Lukas', 'Braun', 'lukas@email.de', 'Kirchstr. 19', 'Plön', 'Deutschland', 'Kreditkarte', 'paid', '2026-01-11 15:20:00'),
('order-9', 'user-10', 'Emma', 'Hartmann', 'emma@email.de', 'Dorfstr. 4', 'Waabs', 'Deutschland', 'PayPal', 'pending', '2026-01-12 12:00:00'),
('order-10', 'user-11', 'Leon', 'Krüger', 'leon@email.de', 'Am Hafen 11', 'Eckernförde', 'Deutschland', 'PayPal', 'delivered', '2025-12-20 09:00:00');

-- Order Items
INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('item-1', 'order-1', 1, 2, 19.99),
('item-2', 'order-1', 5, 1, 14.99),
('item-3', 'order-2', 2, 1, 34.99),
('item-4', 'order-2', 7, 1, 22.50),
('item-5', 'order-3', 6, 2, 29.99),
('item-6', 'order-4', 3, 1, 24.99),
('item-7', 'order-4', 10, 3, 8.99),
('item-8', 'order-5', 12, 2, 15.99),
('item-9', 'order-6', 8, 1, 39.99),
('item-10', 'order-6', 13, 1, 44.99),
('item-11', 'order-7', 14, 2, 16.99),
('item-12', 'order-7', 11, 1, 12.99),
('item-13', 'order-8', 15, 1, 18.99),
('item-14', 'order-9', 4, 1, 49.99),
('item-15', 'order-10', 9, 1, 59.99);
