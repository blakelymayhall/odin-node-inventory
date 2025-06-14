const express = require("express");
const app = express();
const restaurant_router = require("./routers/restaurant_router");
app.use(express.static("styles"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use("/", restaurant_router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
