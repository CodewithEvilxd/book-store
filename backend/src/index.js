import express from 'express';
import "dotenv/config";
import cors from 'cors'; // ✅ Import CORS middleware
import bookRoutes from './routes/bookRoutes.js'; // ✅ Import book routes


import {connectDB} from './lib/db.js'; // ✅ Import the database connection
import authRoutes from './routes/authRoutes.js'; // ✅ Add this

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(express.json()); // ✅ To parse JSON request bodies

app.use(express.json()); // ✅ To parse JSON request bodies
app.use(cors()); // ✅ Use CORS middleware to allow cross-origin requests



app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes); // ✅ Add this line to use book routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // ✅ Connect to MongoDB
});
