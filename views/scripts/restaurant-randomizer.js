document.getElementById("randomizer_button").addEventListener("click", async function () {
    const res = await fetch("/random-restaurant");
    const data = await res.json();
    if (data && data.random) {
        console.log(data);
        document.querySelector(".randomizer_card .restaurant_card .restaurantName").textContent = data.random.name;
        document.querySelector(
            ".randomizer_card .restaurant_card .cuisineList"
        ).innerHTML = `<strong>Cuisine:</strong> ${data.random.food_types.join(", ")}`;
        document.querySelector(
            ".randomizer_card .restaurant_card .priceLabel"
        ).innerHTML = `<strong>Price:</strong> ${data.random.price}`;
        document.querySelector(
            ".randomizer_card .restaurant_card .servesDrinksLabel"
        ).innerHTML = `<strong>Serves Drinks:</strong> ${data.random.serves_drinks}`;
        document.querySelector(
            ".randomizer_card .restaurant_card .fastFoodLabel"
        ).innerHTML = `<strong>Fast Food:</strong> ${data.random.fast_food}
                `;
    } else {
        alert("Error fetching random restaurant.");
    }
});
