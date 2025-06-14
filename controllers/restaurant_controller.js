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

async function search_get(req, res) {
    const { food_type_id, price_level_id, serves_drinks, is_fast_food } = req.query;

    res.render("search", {
        food_types: await db.get_food_types(),
        price_levels: await db.get_price_levels(),
        search_results: await db.get_filtered_restaurants(
            food_type_id ? parseInt(food_type_id) : null,
            price_level_id ? parseInt(price_level_id) : null,
            serves_drinks === "on",
            is_fast_food === "on"
        ),
    });
}

module.exports = {
    home_get,
    restaurants_get,
    search_get,
    get_random_restaurants,
};
