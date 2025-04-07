const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();



app.get('/', (req, res) => {
    res.send("RideOn-Server is LIVE");
});

app.listen(port, () => {
    console.log(`server is running on port : ${port}`);
}
);