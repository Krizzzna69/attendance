const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // For parsing application/json

// MongoDB connection (Replace with your MongoDB URI)
const mongoURI = 'mongodb+srv://bitsmid167:jppj@cluster0.gyxzx.mongodb.net/test';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Schema and Model
const absenteeSchema = new mongoose.Schema({
    rollNumber: String,
    totalAbsences: Number,
    fineAmount: Number,
});

const Absentee = mongoose.model('Absentee', absenteeSchema);

// Route to handle form submission
app.post('/submit-absentees', async (req, res) => {
    const { absentees, date } = req.body;

    if (!absentees) {
        return res.status(400).json({ message: 'Absentees field is required' });
    }

    try {
        // Convert comma-separated string to array
        const rollNumberArray = absentees.split(',').map(number => number.trim());

        for (const rollNumber of rollNumberArray) {
            // Find the record and increment the totalAbsences
            const updatedRecord = await Absentee.findOneAndUpdate(
                { rollNumber: rollNumber },
                { $inc: { totalAbsences: 1 } },
                { new: true, upsert: true } // Create a new record if it doesn't exist
            );

            // Check if totalAbsences exceeds 2, and update fineAmount if necessary
            if (updatedRecord.totalAbsences > 2) {
                await Absentee.findOneAndUpdate(
                    { rollNumber: rollNumber },
                    { $inc: { fineAmount: 50 } }
                );
            }
        }

        res.status(200).json({ message: 'Absentees recorded and updated successfully!' });
    } catch (error) {
        console.error('Error saving absentee data:', error);
        res.status(500).json({ message: 'An error occurred while recording absentees.' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable PORT if available, else default to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
