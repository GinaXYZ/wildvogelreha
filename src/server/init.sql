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

CREATE TABLE IF NOT EXISTS contacts (
  id VARCHAR(36) PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(100),
  telefon VARCHAR(50),
  msg LONGTEXT,
  status ENUM('neu', 'bearbeitet', 'erledigt') DEFAULT 'neu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(100) NOT NULL,
  status ENUM('in Behandlung', 'stabil', 'kritisch', 'ausgewildert', 'verstorben') DEFAULT 'in Behandlung',
  admission_date DATE NOT NULL,
  details LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100),
  class VARCHAR(50),
  x DECIMAL(10, 6),
  y DECIMAL(10, 6),
  image VARCHAR(255),
  name VARCHAR(100),
  species VARCHAR(100),
  age VARCHAR(50),
  description LONGTEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data

-- Users (password = 'test123' für alle)
INSERT IGNORE INTO users (id, username, password, firstname, lastname, email, role) VALUES
('admin-1', 'admin', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Admin', 'User', 'qiiina122@hotmail.de', 'admin'),
('staff-1', 'marie', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Marie', 'Schmidt', 'marieqiiina122@hotmail.de', 'staff'),
('staff-2', 'tobias', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Tobias', 'Müller', 'tobiasqiiina122@hotmail.de', 'staff'),
('staff-3', 'lisa', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Lisa', 'Wagner', 'lisaqiiina122@hotmail.de', 'staff'),
('user-1', 'testuser', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Test', 'User', 'userqiiina122@hotmail.de', 'user'),
('user-2', 'anna', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Anna', 'Becker', 'anna@email.de', 'user'),
('user-3', 'max', '$2b$10$fKe3o.ieH5jBcmdQrcto6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Max', 'Hoffmann', 'max@email.de', 'user'),
('user-4', 'sarah', '$2b$10$fKe3o.ieH5jBcmdQrctgo6uV.GAzVrmtRfznE7CVATuKpTDbtd14Py', 'Sarah', 'Klein', 'sarah@email.de', 'user'),
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
('Vogelfutter Premium Mix', 19.99, 'Hochwertiges Mischfutter für verschiedene Vogelarten', 'Futter', 50, '/api/images/image1.jpg'),
('Nistkästen Holz', 34.99, 'Natürliche Nistkästen aus Massivholz', 'Nistplätze', 20, '/api/images/image1.jpg'),
('Wärmlampe 100W', 24.99, 'Infrarot-Wärmlampe für Inkubation', 'Ausrüstung', 15, '/api/images/image1.jpg'),
('Medikament Antibiotika Set', 49.99, 'Veterinär-Antibiotikaset', 'Medikamente', 10, '/api/images/image1.jpg'),
('Futternapf Edelstahl 5L', 14.99, 'Robuster Futternapf aus Edelstahl', 'Zubehör', 30, '/api/images/image1.jpg'),
('Wildvogel T-Shirt', 29.99, 'Bio-Baumwolle T-Shirt mit Vogelmotiv', 'Merchandise', 40, '/api/images/image1.jpg'),
('Vogelbestimmungsbuch', 22.50, 'Umfassendes Nachschlagewerk heimischer Vögel', 'Bücher', 25, '/api/images/image1.jpg'),
('Transportbox klein', 39.99, 'Sichere Transportbox für kleine Vögel', 'Transport', 12, '/api/images/image1.jpg'),
('Transportbox groß', 59.99, 'Sichere Transportbox für größere Vögel', 'Transport', 8, '/api/images/image1.jpg'),
('Pipetten Set 10er', 8.99, 'Fütterungspipetten für Jungvögel', 'Zubehör', 60, '/api/images/image1.jpg'),
('Desinfektionsmittel 1L', 12.99, 'Spezielles Desinfektionsmittel für Volieren', 'Hygiene', 35, '/api/images/image1.jpg'),
('Wildvogel Tasse', 15.99, 'Keramiktasse mit Eulenmotiv', 'Merchandise', 50, '/api/images/image1.jpg'),
('Erste-Hilfe-Set Vögel', 44.99, 'Komplettes Set für Notfallversorgung', 'Medizin', 18, '/api/images/image1.jpg'),
('Mehlwürmer getrocknet 500g', 16.99, 'Proteinreiches Zusatzfutter', 'Futter', 45, '/api/images/image1.jpg'),
('Kalender 2026', 18.99, 'Wandkalender mit Vogelfotos', 'Merchandise', 30, '/api/images/image1.jpg');

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

-- Contacts (Kontaktanfragen)
INSERT IGNORE INTO contacts (id, firstname, lastname, email, telefon, msg, status, created_at) VALUES
(1, 'Hans', 'Meier', 'hans.meier@email.de', '0431-123456', 'Ich habe einen verletzten Vogel gefunden. Was soll ich tun?', 'new', '2026-01-10 09:30:00'),
(2, 'Sabine', 'Koch', 'sabine.koch@web.de', '0461-789012', 'Kann ich bei Ihnen ehrenamtlich mitarbeiten?', 'answered', '2026-01-08 14:15:00'),
(3, 'Michael', 'Berg', 'm.berg@gmail.com', '0170-1234567', 'Wann sind Ihre Öffnungszeiten für Besucher?', 'answered', '2026-01-05 11:00:00'),
(4, 'Petra', 'Schulz', 'petra.schulz@gmx.de', '04351-55667', 'Ich möchte eine Führung für unsere Schulklasse buchen.', 'new', '2026-01-11 16:45:00'),
(5, 'Klaus', 'Jansen', 'k.jansen@t-online.de', '0152-9876543', 'Nehmen Sie auch Tauben auf?', 'answered', '2026-01-03 10:20:00');

-- Patients (Vogelpatienten)
INSERT IGNORE INTO patients (id, name, species, status, admission_date, details, created_at) VALUES
(1, 'Rico', 'Rotmilan', 'in_treatment', '2026-01-02', 'Flügelverletzung durch Stromleitung. Wird operiert.', '2026-01-02 14:30:00'),
(2, 'Ella', 'Schleiereule', 'recovered', '2025-12-15', 'Unterernährt aufgefunden. Vollständig erholt.', '2025-12-15 09:00:00'),
(3, 'Max', 'Mäusebussard', 'in_treatment', '2026-01-05', 'Kollision mit Auto. Leichte Gehirnerschütterung.', '2026-01-05 11:20:00'),
(4, 'Kroni', 'Kranich', 'in_treatment', '2025-12-20', 'Bleivergiftung. Langzeitbehandlung erforderlich.', '2025-12-20 08:45:00'),
(5, 'Adler', 'Seeadler', 'critical', '2026-01-12', 'Schwere Verletzungen. Intensivbehandlung.', '2026-01-12 08:30:00'),
(6, 'Fips', 'Waldkauz', 'released', '2025-11-10', 'Jungvogel aus Nest gefallen. Erfolgreich aufgezogen.', '2025-11-10 15:00:00'),
(7, 'Luna', 'Uhu', 'in_treatment', '2026-01-08', 'Flügelbruch. OP erfolgreich, Reha läuft.', '2026-01-08 10:00:00'),
(8, 'Sturmi', 'Weißstorch', 'recovered', '2025-10-01', 'Hat Zugtermin verpasst. Überwintert bei uns.', '2025-10-01 14:00:00'),
(9, 'Felix', 'Turmfalke', 'released', '2025-12-28', 'Leichte Prellungen. Schnell erholt.', '2025-12-28 16:30:00'),
(10, 'Greif', 'Habicht', 'in_treatment', '2026-01-09', 'Vergiftungsverdacht. Unter Beobachtung.', '2026-01-09 12:00:00'),
(11, 'Schnippi', 'Waldschnepfe', 'released', '2025-12-05', 'Kollision mit Fenster. Vollständig genesen.', '2025-12-05 09:15:00'),
(12, 'Olga', 'Steinkauz', 'in_treatment', '2026-01-06', 'Unterernährt. Wird aufgepäppelt.', '2026-01-06 13:45:00'),
(13, 'Blitz', 'Wanderfalke', 'recovered', '2025-11-20', 'Kollision mit Glasscheibe. Erholt sich gut.', '2025-11-20 11:30:00'),
(14, 'Rudi', 'Rotkehlchen', 'released', '2026-01-03', 'Von Katze angegriffen. Kleine Wunden verheilt.', '2026-01-03 10:00:00'),
(15, 'Hilde', 'Graureiher', 'in_treatment', '2026-01-11', 'Angelschnur um Bein gewickelt. Wird behandelt.', '2026-01-11 14:00:00'),
(16, 'Korax', 'Kolkrabe', 'in_treatment', '2026-01-07', 'Flügelverletzung. Gute Prognose.', '2026-01-07 10:30:00'),
(17, 'Amsel', 'Amsel', 'released', '2025-12-30', 'Jungvogel, aus Nest gefallen.', '2025-12-30 08:00:00'),
(18, 'Specht', 'Buntspecht', 'recovered', '2025-12-18', 'Leichte Verletzung. Fast wieder fit.', '2025-12-18 15:30:00'),
(19, 'Walli', 'Waldohreule', 'critical', '2026-01-10', 'Schwere Infektion. Intensivpflege.', '2026-01-10 09:00:00'),
(20, 'Möwe', 'Silbermöwe', 'in_treatment', '2026-01-04', 'Ölverschmutzung. Wird gereinigt.', '2026-01-04 16:00:00');

-- Map Items (Vogelkarte/Stationsübersicht) - x,y sind relative Positionen 0.0-1.0
INSERT IGNORE INTO map_items (id, label, class, x, y, image, name, species, age, description, status, created_at) VALUES
(1, 'Rico', 'voliere', 0.15, 0.20, '/image1.jpg', 'Rico', 'Rotmilan', '3 Jahre', 'Flügelverletzung, wird behandelt', 'in_treatment', '2026-01-02 14:30:00'),
(2, 'Ella', 'voliere', 0.35, 0.15, '/image1.jpg', 'Ella', 'Schleiereule', '2 Jahre', 'Unterernährt aufgefunden', 'recovered', '2025-12-15 09:00:00'),
(3, 'Adler', 'station', 0.55, 0.25, '/image1.jpg', 'Adler', 'Seeadler', '5 Jahre', 'Intensivbehandlung', 'critical', '2026-01-12 08:30:00'),
(4, 'Luna', 'voliere', 0.75, 0.20, '/image1.jpg', 'Luna', 'Uhu', '4 Jahre', 'Flügelbruch, Reha läuft', 'in_treatment', '2026-01-08 10:00:00'),
(5, 'Aufzucht', 'station', 0.20, 0.45, '/image1.jpg', NULL, NULL, NULL, 'Aufzuchtstation für Jungvögel', 'available', '2026-01-01 08:00:00'),
(6, 'Kroni', 'voliere', 0.45, 0.40, '/image1.jpg', 'Kroni', 'Kranich', '2 Jahre', 'Bleivergiftung, Langzeitbehandlung', 'in_treatment', '2025-12-20 08:45:00'),
(7, 'Greif', 'station', 0.65, 0.50, '/image1.jpg', 'Greif', 'Habicht', '3 Jahre', 'Vergiftungsverdacht, Quarantäne', 'in_treatment', '2026-01-09 12:00:00'),
(8, 'Sturmi', 'voliere', 0.25, 0.70, '/image1.jpg', 'Sturmi', 'Weißstorch', '1 Jahr', 'Überwintert bei uns', 'recovered', '2025-10-01 14:00:00'),
(9, 'Blitz', 'voliere', 0.50, 0.65, '/image1.jpg', 'Blitz', 'Wanderfalke', '2 Jahre', 'Kollision mit Glasscheibe', 'recovered', '2025-11-20 11:30:00'),
(10, 'Hilde', 'teich', 0.75, 0.75, '/image1.jpg', 'Hilde', 'Graureiher', '3 Jahre', 'Angelschnur um Bein', 'in_treatment', '2026-01-11 14:00:00');

-- Appointments (Terminverwaltungssystem - Software Development Project Management)
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  end_time TIME,
  category ENUM('sprint-planung', 'team-meeting', 'code-review', 'deployment', 'testing', 'dokumentation', 'planning', 'sonstiges') DEFAULT 'sonstiges',
  priority ENUM('niedrig', 'mittel', 'hoch', 'dringend') DEFAULT 'mittel',
  status ENUM('geplant', 'in_bearbeitung', 'erledigt', 'abgesagt') DEFAULT 'geplant',
  room VARCHAR(10),
  patient_id INT,
  assigned_to VARCHAR(36),
  recurring BOOLEAN DEFAULT FALSE,
  recurring_interval ENUM('taeglich', 'woechentlich', 'monatlich') DEFAULT NULL,
  notes LONGTEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Appointments Testdaten (2023-2027) - Software Development Theme
INSERT IGNORE INTO appointments (id, title, description, appointment_date, appointment_time, end_time, category, priority, status, room, patient_id, assigned_to, recurring, recurring_interval, notes, created_by) VALUES
-- 2023
(1, 'Sprint Planning Week 1', 'Q1 Sprint kickoff', '2023-01-05', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'A101', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(2, 'Daily Standup', 'Team synchronization', '2023-01-12', '09:30:00', '10:00:00', 'team-meeting', 'niedrig', 'erledigt', 'B201', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(3, 'Code Review: Auth Module', 'Login system review', '2023-02-03', '10:00:00', '11:00:00', 'code-review', 'hoch', 'erledigt', 'C301', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(4, 'Testing: UI Components', 'Component test coverage', '2023-02-18', '14:00:00', '15:00:00', 'testing', 'mittel', 'erledigt', 'D401', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(5, 'Deployment to Production', 'v1.0 release', '2023-03-10', '16:00:00', '18:00:00', 'deployment', 'hoch', 'erledigt', 'A102', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(6, 'API Documentation Update', 'Swagger docs', '2023-03-22', '08:00:00', '08:30:00', 'dokumentation', 'dringend', 'erledigt', 'B202', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(7, 'Sprint Planning Week 5', 'Q1 Sprint 2', '2023-04-05', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'C302', NULL, 'admin-1', FALSE, NULL, NULL, 'admin-1'),
(8, 'Planning: Q2 Roadmap', 'Feature planning', '2023-04-20', '09:00:00', '12:00:00', 'planning', 'mittel', 'erledigt', 'D402', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(9, 'Sprint Planning Week 9', 'Q2 kickoff', '2023-05-02', '09:00:00', '10:00:00', 'sprint-planung', 'hoch', 'erledigt', 'A103', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(10, 'Code Review: Database Layer', 'ORM review', '2023-05-18', '10:00:00', '11:00:00', 'code-review', 'hoch', 'erledigt', 'B203', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(11, 'Infrastructure Setup', 'CI/CD pipeline', '2023-06-01', '08:00:00', '12:00:00', 'deployment', 'niedrig', 'erledigt', 'C303', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(12, 'Security Testing', 'Penetration test', '2023-06-15', '11:00:00', '12:00:00', 'testing', 'mittel', 'erledigt', 'D403', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(13, 'Sprint Review & Demo', 'Stakeholder presentation', '2023-07-08', '14:00:00', '15:00:00', 'team-meeting', 'hoch', 'erledigt', 'A104', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(14, 'Documentation Sprint', 'API & code docs', '2023-07-22', '09:00:00', '11:00:00', 'dokumentation', 'mittel', 'erledigt', 'B204', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(15, 'Code Review: Payment Module', 'Payment integration', '2023-08-05', '10:00:00', '11:00:00', 'code-review', 'dringend', 'erledigt', 'C304', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(16, 'Planning: Performance Optimization', 'Refactoring plan', '2023-09-10', '10:00:00', '12:00:00', 'planning', 'niedrig', 'erledigt', 'D404', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(17, 'Load Testing Setup', '1000 RPS testing', '2023-09-25', '08:00:00', '10:00:00', 'testing', 'mittel', 'erledigt', 'A105', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(18, 'Sprint Planning Q4', 'Final quarter planning', '2023-10-15', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'B205', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(19, 'Infrastructure Maintenance', 'Server updates', '2023-11-01', '09:00:00', '12:00:00', 'deployment', 'hoch', 'erledigt', 'C305', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(20, 'Year End Review', '2023 retrospective', '2023-12-20', '14:00:00', '16:00:00', 'team-meeting', 'mittel', 'erledigt', 'D405', NULL, 'admin-1', FALSE, NULL, NULL, 'admin-1'),
-- 2024
(21, 'Sprint Planning Week 1', '2024 kickoff', '2024-01-03', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'A101', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(22, 'Code Review: New Features', 'Feature module', '2024-01-18', '11:00:00', '12:30:00', 'code-review', 'dringend', 'erledigt', 'B201', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(23, 'Documentation Update', 'API docs v2.0', '2024-02-05', '08:00:00', '09:00:00', 'dokumentation', 'niedrig', 'erledigt', 'C301', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(24, 'Planning: Tech Debt', 'Refactoring roadmap', '2024-02-20', '14:00:00', '15:00:00', 'planning', 'mittel', 'erledigt', 'D401', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(25, 'Testing: Edge Cases', 'Comprehensive testing', '2024-03-08', '10:00:00', '11:00:00', 'testing', 'hoch', 'erledigt', 'A102', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(26, 'Infrastructure Upgrade', 'Database migration', '2024-03-25', '07:00:00', '15:00:00', 'deployment', 'mittel', 'erledigt', 'B202', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(27, 'Code Review: Security Fix', 'Vulnerability patch', '2024-04-10', '08:30:00', '09:30:00', 'code-review', 'hoch', 'erledigt', 'C302', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(28, 'Sprint Release', 'v2.0 deployment', '2024-04-28', '16:00:00', '18:00:00', 'deployment', 'hoch', 'erledigt', 'D402', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(29, 'Sprint Planning Q2', 'Q2 features kickoff', '2024-05-05', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'A103', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(30, 'Integration Tests', 'End-to-end testing', '2024-05-22', '09:00:00', '11:00:00', 'testing', 'dringend', 'erledigt', 'B203', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(31, 'Code Quality Review', 'Code coverage report', '2024-06-12', '10:00:00', '11:00:00', 'code-review', 'mittel', 'erledigt', 'C303', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(32, 'Security Audit', 'Penetration testing', '2024-06-28', '09:00:00', '11:00:00', 'testing', 'mittel', 'erledigt', 'D403', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(33, 'Performance Optimization', 'Speed improvements', '2024-07-15', '09:00:00', '12:00:00', 'planning', 'hoch', 'erledigt', 'A104', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(34, 'Deployment v2.5', 'Feature release', '2024-07-30', '17:00:00', '19:00:00', 'deployment', 'hoch', 'erledigt', 'B204', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(35, 'Documentation: API v2', 'Updated docs', '2024-08-12', '08:00:00', '09:00:00', 'dokumentation', 'niedrig', 'erledigt', 'C304', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(36, 'Code Refactoring', 'Module cleanup', '2024-08-28', '09:00:00', '12:00:00', 'code-review', 'niedrig', 'erledigt', 'D404', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(37, 'Sprint Planning Q3', 'Q3 kickoff', '2024-09-08', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'A105', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(38, 'Testing Strategy Review', 'Test coverage analysis', '2024-09-25', '10:00:00', '12:00:00', 'team-meeting', 'mittel', 'erledigt', 'B205', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(39, 'Planning: Scalability', 'Architecture review', '2024-10-10', '14:00:00', '15:30:00', 'planning', 'mittel', 'erledigt', 'C305', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(40, 'Infrastructure Maintenance', 'Server optimization', '2024-10-28', '08:00:00', '12:00:00', 'deployment', 'hoch', 'erledigt', 'D405', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(41, 'Code Review: Payment Gateway', 'Payment system', '2024-11-15', '10:00:00', '11:00:00', 'code-review', 'hoch', 'erledigt', 'A101', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(42, 'Testing: Mobile App', 'iOS/Android tests', '2024-11-28', '10:00:00', '12:00:00', 'testing', 'mittel', 'erledigt', 'B201', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(43, 'Sprint Planning Q4', 'Final quarter', '2024-12-20', '09:00:00', '10:00:00', 'sprint-planung', 'niedrig', 'erledigt', 'C301', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
-- 2025
(44, 'New Year Planning', 'Strategy for 2025', '2025-01-02', '09:00:00', '11:00:00', 'planning', 'mittel', 'erledigt', 'D401', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(45, 'Code Quality Audit', 'Code analysis', '2025-01-15', '08:00:00', '11:00:00', 'code-review', 'niedrig', 'erledigt', 'A102', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(46, 'Testing: Critical Path', 'End-to-end validation', '2025-02-03', '10:00:00', '11:00:00', 'testing', 'hoch', 'erledigt', 'B202', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(47, 'Sprint Planning Week 1', 'Q1 features', '2025-02-18', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'C302', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(48, 'Documentation Refresh', 'Update tech docs', '2025-03-05', '08:30:00', '09:30:00', 'dokumentation', 'mittel', 'erledigt', 'D402', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(49, 'Infrastructure Upgrade', 'Hardware refresh', '2025-03-22', '07:00:00', '15:00:00', 'deployment', 'mittel', 'erledigt', 'A103', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(50, 'Sprint Planning Q2', 'Q2 roadmap', '2025-04-08', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'B203', NULL, 'admin-1', FALSE, NULL, NULL, 'admin-1'),
(51, 'Performance Testing', 'Load testing 5k RPS', '2025-04-25', '09:00:00', '12:00:00', 'testing', 'hoch', 'erledigt', 'C303', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(52, 'Code Review: Microservices', 'Service split', '2025-05-10', '10:00:00', '12:00:00', 'code-review', 'dringend', 'erledigt', 'D403', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(53, 'Team Retrospective', 'Q1 review', '2025-05-28', '14:00:00', '15:00:00', 'team-meeting', 'mittel', 'erledigt', 'A104', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(54, 'Deployment v3.0', 'Major release', '2025-06-12', '16:00:00', '18:00:00', 'deployment', 'hoch', 'erledigt', 'B204', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(55, 'Testing: Regression Suite', 'Full regression', '2025-06-28', '09:00:00', '12:00:00', 'testing', 'mittel', 'erledigt', 'C304', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(56, 'Planning: Mobile App', 'Native app design', '2025-07-15', '14:00:00', '15:30:00', 'planning', 'niedrig', 'erledigt', 'D404', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(57, 'Code Review: Mobile SDK', 'SDK implementation', '2025-08-05', '09:00:00', '11:00:00', 'code-review', 'niedrig', 'erledigt', 'A105', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(58, 'Security Testing: OAuth', 'Auth layer testing', '2025-08-22', '10:00:00', '11:00:00', 'testing', 'dringend', 'erledigt', 'B205', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(59, 'Sprint Planning Q3', 'Q3 kickoff', '2025-09-10', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'erledigt', 'C305', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(60, 'Testing: API Versioning', 'v3 vs v2 compatibility', '2025-09-28', '10:00:00', '12:00:00', 'testing', 'mittel', 'erledigt', 'D405', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(61, 'Documentation: Mobile API', 'Mobile docs', '2025-10-15', '11:00:00', '12:30:00', 'dokumentation', 'hoch', 'erledigt', 'A101', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(62, 'Infrastructure: Cloud Migration', 'AWS migration', '2025-10-30', '08:00:00', '12:00:00', 'deployment', 'hoch', 'erledigt', 'B201', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(63, 'Code Review: Cloud SDK', 'Serverless functions', '2025-11-12', '10:00:00', '11:30:00', 'code-review', 'mittel', 'erledigt', 'C301', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(64, 'Testing: Mobile App Beta', 'Beta testing', '2025-11-28', '10:00:00', '12:00:00', 'testing', 'mittel', 'erledigt', 'D401', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(65, 'Planning: 2026 Roadmap', 'Long-term planning', '2025-12-10', '09:00:00', '11:00:00', 'planning', 'mittel', 'erledigt', 'A102', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(66, 'Year End Review', '2025 retrospective', '2025-12-22', '14:00:00', '16:00:00', 'team-meeting', 'mittel', 'erledigt', 'B202', NULL, 'admin-1', FALSE, NULL, NULL, 'admin-1'),
-- 2026 current and future
(67, 'Sprint Planning Week 3', 'Sprint 3 kickoff', '2026-01-21', '09:00:00', '10:00:00', 'sprint-planung', 'hoch', 'geplant', 'C302', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(68, 'Daily Standup', 'Team sync', '2026-01-21', '09:30:00', '10:00:00', 'team-meeting', 'mittel', 'geplant', 'D402', NULL, 'staff-2', TRUE, 'taeglich', NULL, 'admin-1'),
(69, 'Code Review: Backend API', 'REST endpoints', '2026-01-22', '10:00:00', '11:00:00', 'code-review', 'dringend', 'geplant', 'A103', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(70, 'Testing: Integration Tests', 'E2E validation', '2026-01-22', '14:00:00', '15:30:00', 'testing', 'niedrig', 'geplant', 'B203', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(71, 'Code Review: Frontend UI', 'React components', '2026-01-23', '10:00:00', '11:00:00', 'code-review', 'mittel', 'geplant', 'C303', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(72, 'Documentation: API Update', 'v3 API docs', '2026-01-23', '14:00:00', '15:00:00', 'dokumentation', 'niedrig', 'geplant', 'D403', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(73, 'Performance Testing', '10k concurrent users', '2026-01-24', '11:00:00', '12:30:00', 'testing', 'hoch', 'geplant', 'A104', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(74, 'Deployment Staging', 'v3.1 RC', '2026-01-24', '16:00:00', '17:00:00', 'deployment', 'hoch', 'geplant', 'B204', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(75, 'Code Review: Database', 'Query optimization', '2026-02-03', '10:00:00', '11:30:00', 'code-review', 'niedrig', 'geplant', 'C304', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(76, 'Security Audit', 'Q1 security review', '2026-02-10', '09:00:00', '11:00:00', 'testing', 'dringend', 'geplant', 'D404', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(77, 'Sprint Planning Q1', 'Q1 retrospective & Q2 planning', '2026-03-05', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'geplant', 'A105', NULL, 'admin-1', FALSE, NULL, NULL, 'admin-1'),
(78, 'Code Quality Review', 'Metrics analysis', '2026-03-20', '10:00:00', '12:00:00', 'code-review', 'mittel', 'geplant', 'B205', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(79, 'Architecture Planning', 'Microservices design', '2026-04-01', '09:00:00', '12:00:00', 'planning', 'hoch', 'geplant', 'C305', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(80, 'Testing: Load Balancing', 'Cluster testing', '2026-04-15', '10:00:00', '12:00:00', 'testing', 'mittel', 'geplant', 'D405', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(81, 'Deployment v4.0', 'Major feature release', '2026-05-10', '17:00:00', '19:00:00', 'deployment', 'hoch', 'geplant', 'A101', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(82, 'Documentation: v4.0 Guide', 'New features docs', '2026-06-01', '14:00:00', '15:00:00', 'dokumentation', 'mittel', 'geplant', 'B201', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(83, 'Code Review Sprint', 'Major refactoring', '2026-07-15', '10:00:00', '12:00:00', 'code-review', 'niedrig', 'geplant', 'C301', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(84, 'Planning: Performance', 'Optimization roadmap', '2026-09-20', '09:00:00', '12:00:00', 'planning', 'mittel', 'geplant', 'D401', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(85, 'Testing: Load 100k RPS', 'Stress testing', '2026-11-25', '10:00:00', '12:00:00', 'testing', 'mittel', 'geplant', 'A102', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
-- 2027
(86, 'Sprint Planning 2027', '2027 kickoff', '2027-01-04', '09:00:00', '10:00:00', 'sprint-planung', 'mittel', 'geplant', 'B202', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(87, 'Architecture Redesign', 'System redesign', '2027-03-15', '09:00:00', '12:00:00', 'planning', 'mittel', 'geplant', 'C302', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1'),
(88, 'Code Review: AI Integration', 'ML features', '2027-04-05', '10:00:00', '11:30:00', 'code-review', 'hoch', 'geplant', 'D402', NULL, 'staff-2', FALSE, NULL, NULL, 'admin-1'),
(89, 'Testing: AI Models', 'ML testing', '2027-06-20', '10:00:00', '12:00:00', 'testing', 'mittel', 'geplant', 'A103', NULL, 'staff-1', FALSE, NULL, NULL, 'admin-1'),
(90, 'Deployment v5.0', 'AI-powered release', '2027-09-15', '16:00:00', '18:00:00', 'deployment', 'hoch', 'geplant', 'B203', NULL, 'staff-3', FALSE, NULL, NULL, 'admin-1');
