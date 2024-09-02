const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 5000; // Port can be set via environment variable

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB URI (replace with your actual MongoDB connection string)
const mongoURI = 'mongodb+srv://bitsmid167:jppj@cluster0.gyxzx.mongodb.net/' // Replace this with your MongoDB connection string

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define a schema and model
const absenteeSchema = new mongoose.Schema({
    absentees: { type: [String], required: true },
    date: { type: Date, required: true },
});

const Absentee = mongoose.model('Absentee', absenteeSchema);

// Route to handle form submissions
app.post('/submit-absentees', async (req, res) => {
    const { rollNumbers, date } = req.body;

    try {
        // Convert comma-separated roll numbers to array
        const rollNumberArray = rollNumbers.split(',').map(number => number.trim());

        // Iterate over each roll number and update the totalAbsences and fineAmount
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
        console.error('Error updating absentee data:', error);
        res.status(500).json({ message: 'An error occurred while recording absentees.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
