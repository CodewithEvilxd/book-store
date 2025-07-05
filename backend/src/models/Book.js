import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
  title: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  user : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true, // Ensure that a user is associated with the book
  },
  
},
  { timestamps: true }, // Automatically adds createdAt and updatedAt fields
);

const Book = mongoose.model("Book", bookSchema);

export default Book;