CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO collections (name, price, image) VALUES ('Silk Slip Dress', '$240', 'https://images.unsplash.com/photo-1515347619362-710898867a65?auto=format&fit=crop&q=80&w=800');
INSERT INTO collections (name, price, image) VALUES ('Linen Summer Gown', '$180', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800');
INSERT INTO collections (name, price, image) VALUES ('Noire Evening Dress', '$320', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800');
INSERT INTO collections (name, price, image) VALUES ('Ivory Draped Maxi', '$290', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=800');
INSERT INTO collections (name, price, image) VALUES ('Satin Ruffle Gown', '$380', 'https://images.unsplash.com/photo-1595777457583-95e059f581ce?auto=format&fit=crop&q=80&w=800');
INSERT INTO collections (name, price, image) VALUES ('Classic A-Line', '$210', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800');
