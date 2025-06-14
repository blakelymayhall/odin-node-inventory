const { Pool } = require("pg");

// Again, this should be read from an environment variable
module.exports = new Pool({
    connectionString: `postgresql://blakelymayhall@localhost:5432/restaurant_inventory`,
});
