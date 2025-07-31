const db = require("../db/queries");

async function get_random_restaurants() {
    const restaurants = await db.get_restaurants();
    return restaurants[Math.floor(Math.random() * restaurants.length)];
}

async function home_get(req, res) {
    res.render("home", {
        featured_restaurant: await get_random_restaurants(),
        random_restaurant: await get_random_restaurants(),
    });
}

async function restaurants_get(req, res) {
    res.render("restaurants", {
        restaurants: await db.get_restaurants(),
    });
}

async function add_get(req, res) {
    const { name, food_type_id, price_level_id, serves_drinks, is_fast_food } = req.query;
    const add_performed =
        name !== undefined ||
        food_type_id !== undefined ||
        price_level_id !== undefined ||
        serves_drinks !== undefined ||
        is_fast_food !== undefined;

    let add_receipt = null;
    if (add_performed) {
        add_receipt = await db.add_restaurant(
            name,
            food_type_id ? food_type_id.split(",").filter(Boolean).map(Number) : [],
            price_level_id ? price_level_id : null,
            serves_drinks ? serves_drinks : null,
            is_fast_food ? is_fast_food : null
        );
    }

    res.render("add", {
        food_types: await db.get_food_types(),
        price_levels: await db.get_price_levels(),
        add_performed,
        add_receipt: add_receipt,
    });
}

async function search_get(req, res) {
    const { food_type_id, price_level_id, serves_drinks, is_fast_food } = req.query;
    const search_performed =
        food_type_id !== undefined ||
        price_level_id !== undefined ||
        serves_drinks !== undefined ||
        is_fast_food !== undefined;

    res.render("search", {
        food_types: await db.get_food_types(),
        price_levels: await db.get_price_levels(),
        search_results: await db.get_filtered_restaurants(
            food_type_id ? food_type_id.split(",").filter(Boolean).map(Number) : null,
            price_level_id ? price_level_id.split(",").filter(Boolean).map(Number) : null,
            serves_drinks
                ? serves_drinks
                      .split(",")
                      .filter(Boolean)
                      .map((v) => v === "true")
                : null,
            is_fast_food
                ? is_fast_food
                      .split(",")
                      .filter(Boolean)
                      .map((v) => v === "true")
                : null
        ),
        search_performed,
    });
}

module.exports = {
    home_get,
    restaurants_get,
    add_get,
    search_get,
    get_random_restaurants,
};
