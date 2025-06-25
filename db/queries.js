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
    if (Array.isArray(food_type_id)) {
        if (food_type_id.length === 0) return [];
        const placeholders = food_type_id.map((_, i) => `$${i + 1}`).join(", ");
        const query = `SELECT restaurant_id FROM restaurant_food_type WHERE food_type_id IN (${placeholders})`;
        const { rows } = await pool.query(query, food_type_id);
        return rows;
    } else {
        const { rows } = await pool.query("SELECT restaurant_id FROM restaurant_food_type WHERE food_type_id = $1", [
            food_type_id,
        ]);
        return rows;
    }
}

async function get_filtered_restaurants(food_type_id, price_level_id, serves_drinks, is_fast_food) {
    let query = "SELECT * FROM restaurants WHERE 1=1";
    const params = [];

    if (price_level_id && price_level_id.length) {
        query += " AND (";
        price_level_id.forEach((id, idx) => {
            query += `price_level_id = $${params.length + 1}`;
            params.push(id);
            if (idx !== price_level_id.length - 1) {
                query += " OR ";
            }
        });
        query += ")";
    }

    if (serves_drinks && serves_drinks.length) {
        query += " AND (";
        serves_drinks.forEach((val, idx) => {
            query += `serves_drinks = $${params.length + 1}`;
            params.push(val);
            if (idx !== serves_drinks.length - 1) {
                query += " OR ";
            }
        });
        query += ")";
    } else if (serves_drinks !== undefined && !Array.isArray(serves_drinks)) {
        query += ` AND serves_drinks = $${params.length + 1}`;
        params.push(serves_drinks);
    }

    if (is_fast_food && is_fast_food.length) {
        query += " AND (";
        is_fast_food.forEach((val, idx) => {
            query += `fast_food = $${params.length + 1}`;
            params.push(val);
            if (idx !== is_fast_food.length - 1) {
                query += " OR ";
            }
        });
        query += ")";
    } else if (is_fast_food !== undefined && !Array.isArray(is_fast_food)) {
        query += ` AND fast_food = $${params.length + 1}`;
        params.push(is_fast_food);
    }

    if (food_type_id && Array.isArray(food_type_id) && food_type_id.length) {
        let all_restaurant_ids = [];
        for (const ftid of food_type_id) {
            const ids = (await get_restaurants_by_food_type(ftid)).map((r) => r.restaurant_id);
            all_restaurant_ids.push(...ids);
        }
        // Remove duplicates
        all_restaurant_ids = [...new Set(all_restaurant_ids)];
        if (all_restaurant_ids.length > 0) {
            const placeholders = all_restaurant_ids.map((_, i) => `$${params.length + i + 1}`).join(", ");
            query += ` AND id IN (${placeholders})`;
            params.push(...all_restaurant_ids);
        } else {
            query += " AND false";
        }
    } else if (food_type_id && !Array.isArray(food_type_id)) {
        const restaurant_id_by_food_type = (await get_restaurants_by_food_type(food_type_id)).map(
            (r) => r.restaurant_id
        );
        if (restaurant_id_by_food_type.length > 0) {
            const placeholders = restaurant_id_by_food_type.map((_, i) => `$${params.length + i + 1}`).join(", ");
            query += ` AND id IN (${placeholders})`;
            params.push(...restaurant_id_by_food_type);
        } else {
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
