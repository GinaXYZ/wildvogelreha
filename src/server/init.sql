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
