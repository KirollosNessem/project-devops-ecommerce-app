const express = require('express');
const cors = require('cors');
const app = express();


require('dotenv').config();
require('./config/db_conn');
const port = process.env.PORT || 9001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/users", require("./routes/userRouter"))



app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "user-service"
    });
});



app.listen(port, () => {
    console.log(`Serves running on port ${port}`);
});
