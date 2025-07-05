import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js'; // Assuming you have a Book model defined
import protectRoute from '../middleware/auth.middleware.js'; // Middleware to protect routes


const router = express.Router();

router.post('/', protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image  } = req.body;
    if (!image || !title ||  !caption || !rating) return res.status(400).json({ message: 'Please provive all the files' });

    // upload image to cloudinary
    const UploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = UploadResponse.secure_url;

    // save book to database
    const book = new Book({
      title,
      caption,
        rating,
      image: imageUrl,
      user: req.user._id, // Assuming you have user authentication and req.user is set
        // user: req.user._id, // Assuming you have user authentication and req.user is set
    });

    await book.save();
    res.status(201).json(new book)
   }  catch (error) {
    res.status(500).json({ message: error.message });

    }
})


// const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");

router.get('/', protectRoute, async (req, res) => {
    try {
      const page = req.quwry.page || 1;
      const limit = req.query.limit || 5;
      const skip = (page - 1) * limit;



        const books = await Book.find()
        .sort({ createdAt: -1 });
        skip(skip) 
        .limit(limit)
        .populate("user", "username profileImage") // Populate user details if needed



        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id })
      .sort({ createdAt: -1 });
      res.json(books);
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book is not found' });

    // check if user is the owner of the book
    if (book.user.toString() !== req.user._id.toString()) 
      return res.status(403).json({ message: 'Unauthorized' });

    // delete image from cloudinary
    if (book.image && book.image.includes('cloudinary')) {
      try {
        const publicId = book.image.split('/').pop().split('.')[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log('Error deleting image from Cloudinary:', deleteError);
    }
  }
      

    await book.deleteOne();

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
export default router;