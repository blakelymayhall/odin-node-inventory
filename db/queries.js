const pool = require("./pool");

async function get_food_types() {
    const { rows } = await pool.query("SELECT * FROM food_type");
    return rows;
}

async function get_price_levels() {
    const { rows } = await pool.query("SELECT * FROM price_level");
    return rows;
}

async function get_restaurants() {
    const { rows } = await pool.query("SELECT * FROM restaurants");
    const ids = rows.map((r) => r.id);
    const cardPlaceholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    const cardQuery = `SELECT * FROM restaurant_card_view WHERE id IN (${cardPlaceholders})`;

    const { rows: cardRows } = await pool.query(cardQuery, ids);
    return cardRows;
}

async function get_restaurants_by_food_type(food_type_id) {
    const { rows } = await pool.query("SELECT restaurant_id FROM restaurant_food_type WHERE food_type_id = $1", [
        food_type_id,
    ]);
    return rows;
}

async function get_filtered_restaurants(food_type_id, price_level_id, serves_drinks, is_fast_food) {
    let query = "SELECT * FROM restaurants WHERE 1=1";
    const params = [];

    if (price_level_id) {
        query += ` AND price_level_id = $${params.length + 1}`;
        params.push(price_level_id);
    }
    if (serves_drinks !== undefined) {
        query += ` AND serves_drinks = $${params.length + 1}`;
        params.push(serves_drinks);
    }
    if (is_fast_food !== undefined) {
        query += ` AND fast_food = $${params.length + 1}`;
        params.push(is_fast_food);
    }
    if (food_type_id) {
        const restaurant_id_by_food_type = (await get_restaurants_by_food_type(food_type_id)).map(
            (r) => r.restaurant_id
        );
        if (restaurant_id_by_food_type.length > 0) {
            const placeholders = restaurant_id_by_food_type.map((_, i) => `$${params.length + i + 1}`).join(", ");
            query += ` AND id IN (${placeholders})`;
            params.push(...restaurant_id_by_food_type);
        } else {
            // No restaurants match, so force empty result
            query += " AND false";
        }
    }

    const { rows } = await pool.query(query, params);

    if (!rows.length) return [];

    const ids = rows.map((r) => r.id);
    const cardPlaceholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    const cardQuery = `SELECT * FROM restaurant_card_view WHERE id IN (${cardPlaceholders})`;

    const { rows: cardRows } = await pool.query(cardQuery, ids);

    return cardRows;
}

module.exports = {
    get_food_types,
    get_price_levels,
    get_restaurants,
    get_filtered_restaurants,
};
