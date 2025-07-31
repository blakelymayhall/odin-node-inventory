const { Router } = require("express");
const restaurant_controller = require("../controllers/restaurant_controller");
const restaurant_router = Router();

restaurant_router.get("/", restaurant_controller.home_get);
restaurant_router.get("/random-restaurant", async (req, res) => {
    const random = await restaurant_controller.get_random_restaurants();
    res.json({ random });
});
restaurant_router.get("/restaurants", restaurant_controller.restaurants_get);
restaurant_router.get("/search", restaurant_controller.search_get);
restaurant_router.get("/add", restaurant_controller.add_get);

module.exports = restaurant_router;
