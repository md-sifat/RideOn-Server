const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db(process.env.MONGO_DB_NAME).collection("users");
        const carCollection = client.db(process.env.MONGO_DB_NAME).collection("cars");
        const carBooking = client.db(process.env.MONGO_DB_NAME).collection("booking");

        app.get('/users', async (req, res) => {
            const user = await userCollection.find().toArray();
            res.send(user);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(`delete request has come`);
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/cars', async (req, res) => {
            const cars = await carCollection.find().toArray();
            res.send(cars);
        });

        app.post('/cars', async (req, res) => {
            const car = req.body;
            const result = await carCollection.insertOne(car);
            console.log(result);
            res.send(result);
        });

        app.get('/bookings', async (req, res) => {
            const bookings = await carBooking.find().toArray();
            res.send(bookings);
        });

        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await carBooking.insertOne(bookings);
            console.log(result);
            res.send(result);
        });

        app.patch('/bookings/:bookingId', async (req, res) => {
            try {
                const { bookingId } = req.params;
                const { status } = req.body;

                if (!status) {
                    return res.status(400).send({ error: 'Status is required' });
                }
                const validStatuses = ['pending', 'confirmed', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    return res.status(400).send({ error: 'Invalid status value' });
                }

                const result = await carBooking.updateOne(
                    { _id: new ObjectId(bookingId) },
                    { $set: { status } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).send({ error: 'Booking not found' });
                }

                console.log(`Booking ${bookingId} updated to status: ${status}`, result);

                const updatedBooking = await carBooking.findOne({ _id: new ObjectId(bookingId) });
                res.send(updatedBooking);
            } catch (err) {
                console.error('Error updating booking:', err);
                res.status(500).send({ error: 'Failed to update booking' });
            }
        });

        app.get('/cars/:id', async (req, res) => {
            try {
                const carId = req.params.id;
                console.log(carId);
                const car = await carCollection.findOne({ _id: new ObjectId(carId) });
                console.log(car);
                if (!car) {
                    return res.status(404).json({ message: "car not found" });
                }
                res.json(car);
            } catch (error) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carCollection.deleteOne(query);
            res.send(result);
        });


        app.put("/cars/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const { _id, ...updatedcar } = req.body; // Exclude _id from update

                const filter = { _id: new ObjectId(id) };
                const updateDoc = { $set: updatedcar };

                const result = await carCollection.updateOne(filter, updateDoc);

                if (result.modifiedCount > 0) {
                    res.send({ success: true, message: "car updated successfully" });
                } else {
                    res.send({ success: false, message: "No changes made or car not found" });
                }
            } catch (error) {
                console.error("Error updating car:", error);
                res.status(500).send({ success: false, message: "Internal Server Error" });
            }
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send("RideOn-Server is LIVE");
});

app.listen(port, () => {
    console.log(`server is running on port : ${port}`);
}
);