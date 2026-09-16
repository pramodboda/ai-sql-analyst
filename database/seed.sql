INSERT INTO regions (name) VALUES
('North'), ('South'), ('East'), ('West')
ON CONFLICT (name) DO NOTHING;

INSERT INTO customers (name, email, region_id)
SELECT x.name, x.email, r.id
FROM (VALUES
 ('Acme Retail','acme@example.com','South'),
 ('BlueSky Foods','bluesky@example.com','West'),
 ('Cedar Health','cedar@example.com','North'),
 ('Delta Motors','delta@example.com','East'),
 ('Evergreen Stores','evergreen@example.com','South'),
 ('Future Labs','future@example.com','West'),
 ('Global Traders','global@example.com','North'),
 ('Harbor Hotels','harbor@example.com','East'),
 ('Indigo Media','indigo@example.com','South'),
 ('Jupiter Systems','jupiter@example.com','West'),
 ('Kite Logistics','kite@example.com','North'),
 ('Lumen Energy','lumen@example.com','East')
) AS x(name,email,region)
JOIN regions r ON r.name = x.region
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, category, unit_price) VALUES
('Analytics Suite','Software',1200),
('Cloud Gateway','Infrastructure',850),
('Support Plan','Services',500),
('Data Connector','Software',700),
('Security Module','Security',1500),
('Training Package','Services',400)
ON CONFLICT DO NOTHING;

INSERT INTO orders (customer_id, order_date, status, total_amount)
SELECT c.id, v.order_date::date, 'completed', v.amount
FROM (VALUES
 ('Acme Retail','2026-01-12',12000), ('Acme Retail','2026-04-19',18500),
 ('BlueSky Foods','2026-02-07',9800), ('BlueSky Foods','2026-05-21',14700),
 ('Cedar Health','2026-01-30',21000), ('Cedar Health','2026-06-05',12500),
 ('Delta Motors','2026-03-11',17600), ('Delta Motors','2026-07-02',22100),
 ('Evergreen Stores','2026-02-18',8300), ('Evergreen Stores','2026-08-10',9900),
 ('Future Labs','2026-03-22',15400), ('Future Labs','2026-08-14',18100),
 ('Global Traders','2026-01-16',13200), ('Global Traders','2026-09-01',19400),
 ('Harbor Hotels','2026-04-02',7600), ('Harbor Hotels','2026-07-17',11300),
 ('Indigo Media','2026-02-25',8900), ('Indigo Media','2026-06-29',10100),
 ('Jupiter Systems','2026-03-04',16200), ('Jupiter Systems','2026-08-25',20400),
 ('Kite Logistics','2026-05-09',11700), ('Kite Logistics','2026-09-03',14900),
 ('Lumen Energy','2026-04-15',13800), ('Lumen Energy','2026-08-30',17200)
) AS v(customer_name,order_date,amount)
JOIN customers c ON c.name = v.customer_name;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, o.total_amount
FROM orders o
CROSS JOIN LATERAL (
    SELECT id FROM products ORDER BY id LIMIT 1
) p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
);

-- Optional: create a dedicated read-only role.
-- Run this separately with an administrative account and replace the password.
-- CREATE USER ai_analyst_readonly WITH PASSWORD 'CHANGE_ME';
-- GRANT CONNECT ON DATABASE your_database TO ai_analyst_readonly;
-- GRANT USAGE ON SCHEMA public TO ai_analyst_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_analyst_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public
--   GRANT SELECT ON TABLES TO ai_analyst_readonly;
