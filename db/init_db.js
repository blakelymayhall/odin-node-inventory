#! /usr/bin/env node

const { Client } = require("pg");

const SQL = `
DROP VIEW IF EXISTS restaurant_card_view;
DROP TABLE IF EXISTS restaurant_food_type;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS price_level;
DROP TABLE IF EXISTS food_type;


CREATE TABLE IF NOT EXISTS price_level (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  price VARCHAR ( 255 ));
INSERT INTO price_level (price) 
VALUES
  ('$'),
  ('$$'),
  ('$$$'),
  ('$$$$')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS food_type (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  food VARCHAR ( 255 ));
INSERT INTO food_type (food) 
VALUES
  ('Chicken'),
  ('Burger'),
  ('Chinese'),
  ('Sushi'),
  ('Pizza'),
  ('Mexican')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR ( 255 ),
  serves_drinks BOOLEAN,
  fast_food BOOLEAN,
  price_level_id INTEGER,
  FOREIGN KEY (price_level_id) REFERENCES price_level(id)
);
INSERT INTO restaurants (name, serves_drinks, fast_food, price_level_id)
VALUES
  ('McDonalds', FALSE, TRUE, (SELECT id from price_level WHERE price='$')),
  ('Chick-Fil-A', FALSE, TRUE, (SELECT id from price_level WHERE price='$')),
  ('Applebees', TRUE, FALSE, (SELECT id from price_level WHERE price='$$'))
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS restaurant_food_type (
    restaurant_id INT,
    food_type_id INT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (food_type_id) REFERENCES food_type(id),
    PRIMARY KEY (restaurant_id, food_type_id)
);
INSERT INTO restaurant_food_type
VALUES
  ((SELECT id from restaurants WHERE name='McDonalds'),(SELECT id from food_type WHERE food='Chicken')),
  ((SELECT id from restaurants WHERE name='McDonalds'),(SELECT id from food_type WHERE food='Burger')),
  ((SELECT id from restaurants WHERE name='Chick-Fil-A'),(SELECT id from food_type WHERE food='Chicken')),
  ((SELECT id from restaurants WHERE name='Applebees'),(SELECT id from food_type WHERE food='Chicken')),
  ((SELECT id from restaurants WHERE name='Applebees'),(SELECT id from food_type WHERE food='Burger')),
  ((SELECT id from restaurants WHERE name='Applebees'),(SELECT id from food_type WHERE food='Pizza')),
  ((SELECT id from restaurants WHERE name='Applebees'),(SELECT id from food_type WHERE food='Mexican'))
ON CONFLICT DO NOTHING;

CREATE VIEW restaurant_card_view AS
SELECT
  r.id,
  r.name,
  r.serves_drinks,
  r.fast_food,
  pl.price,
  ARRAY_AGG(ft.food ORDER BY ft.food) AS food_types
FROM
  restaurants r
JOIN price_level pl ON r.price_level_id = pl.id
JOIN restaurant_food_type rft ON r.id = rft.restaurant_id
JOIN food_type ft ON rft.food_type_id = ft.id
GROUP BY r.id, r.name, r.serves_drinks, r.fast_food, pl.price;
`;

function splitSQL(sql) {
    return sql
        .split(/;\s*$/m) // split at semicolons at end of lines
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);
}

async function main() {
    console.log("seeding...");
    const client = new Client({
        connectionString: "postgresql://blakelymayhall@localhost:5432/restaurant_inventory",
    });

    await client.connect();

    const statements = splitSQL(SQL);
    for (const stmt of statements) {
        try {
            await client.query(stmt);
        } catch (err) {
            console.error("Error executing statement:\n", stmt, "\n", err.message);
        }
    }

    await client.end();
    console.log("done");
}

main();
