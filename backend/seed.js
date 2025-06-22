require('dotenv').config();
const mongoose = require('mongoose');

// --- Configuration ---
// Make sure your .env file has the correct MONGODB_URI
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guru_academy';

// --- Mongoose Models (must match your server.js schemas) ---
const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: String,
    experience: String,
    skills: [String],
    photo: String
});
const Teacher = mongoose.model('Teacher', teacherSchema);

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    features: [String],
    price: Number,
    icon: String
});
const Material = mongoose.model('Material', materialSchema);

const topperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: String,
    marks: Number,
    subject: String,
    photo: String
});
const Topper = mongoose.model('Topper', topperSchema);

// --- Data to Seed ---
const teachersData = [
    { 
        name: 'Lokesh Saini', 
        subject: 'Science', 
        experience: '3+ years experience in Science.', 
        skills: ['M.Sc.', 'B.Ed'], 
        photo: 'assets/images/L.K._Sir.jpg' 
    },
    { 
        name: 'Hemraj', 
        subject: 'Mathematics', 
        experience: '5+ years specializing in advance Mathematics.', 
        skills: ['M.Sc.', 'B.Ed'], 
        photo: 'assets/images/Hemraj_Sir.jpg' 
    }
];

const materialsData = [
    {
        title: 'Previous Year Questions',
        description: 'Get solved previous year questions for Class 10 Science board exams with detailed solutions.',
        features: ['Board exam questions', 'Detailed solutions', 'Exam pattern based', 'Chapter-wise organization'],
        price: 51,
        icon: 'fas fa-question-circle'
    },
    {
        title: 'Class-10 Science PDF Notes',
        description: 'Comprehensive and easy-to-understand PDF notes for Class 10 Science subjects.',
        features: ['Chapter-wise notes', 'Important points highlighted', 'Downloadable PDF', 'Diagrams and illustrations'],
        price: 91,
        icon: 'fas fa-file-alt'
    }
];

const toppersData = [
    // Science Toppers
    { name: 'Sumit Kumar Bairwa', rollNo: '2006425', marks: 100, subject: 'science', photo: 'assets/images/Toppers/Sumit_Bairwa.jpg' },
    { name: 'Neetu Gurjar', rollNo: '2006398', marks: 99, subject: 'science', photo: 'assets/images/Toppers/Neetu_Gurjar.jpg' },
    { name: 'Manish Jangid', rollNo: '2006383', marks: 99, subject: 'science', photo: 'assets/images/Toppers/Manish_Jangid.jpg' },
    { name: 'Sachin Saini', rollNo: '2006415', marks: 98, subject: 'science', photo: 'assets/images/Toppers/Sachin_Saini.jpg' },
    { name: 'Sagar Pancholi', rollNo: '2006416', marks: 98, subject: 'science', photo: '' }, // No photo available
    { name: 'Divya Kumari Sharma', rollNo: '2006359', marks: 97, subject: 'science', photo: 'assets/images/Toppers/Divya_Saini.jpg' },
    { name: 'Shikha Prajapat', rollNo: '2006418', marks: 96, subject: 'science', photo: 'assets/images/Toppers/Shikha_Prajapat.jpg' },
    { name: 'Manish Prajapat', rollNo: '2006385', marks: 96, subject: 'science', photo: 'assets/images/Toppers/Manish_Prajapat.jpg' },
    { name: 'Anjali Vaishnav', rollNo: '2006346', marks: 95, subject: 'science', photo: 'assets/images/Toppers/Anjali_Vaishnav.jpg' },
    { name: 'Gajanand Chhipa', rollNo: '2006362', marks: 95, subject: 'science', photo: 'assets/images/Toppers/Gajanand_Chhipa.jpg' },
    { name: 'Girija Sharma', rollNo: '2006365', marks: 95, subject: 'science', photo: 'assets/images/Toppers/Girija_Sharma.jpg' },
    { name: 'Devendra Saini', rollNo: '2006353', marks: 94, subject: 'science', photo: 'assets/images/Toppers/Devendra_Saini.jpg' },
    { name: 'Neha Saini', rollNo: '2006400', marks: 93, subject: 'science', photo: 'assets/images/Toppers/Neha_Saini.jpg' },
    { name: 'Krishana Sharma', rollNo: '2006376', marks: 92, subject: 'science', photo: 'assets/images/Toppers/Krishna_Sharma.jpg' },
    { name: 'Himanshu Meena', rollNo: '2006371', marks: 92, subject: 'science', photo: '' }, // No photo available
    { name: 'Gajendra Pal Singh Kasana', rollNo: '2006363', marks: 92, subject: 'science', photo: 'assets/images/Toppers/Gajendra_Pal_Singh_Kasana.jpg' },
    { name: 'Karishma Saini', rollNo: '2006375', marks: 91, subject: 'science', photo: '' }, // No photo available
    { name: 'Pankaj Kumar Prajapati', rollNo: '2006403', marks: 90, subject: 'science', photo: '' }, // No photo available
    { name: 'Neeraj Kumar Saini', rollNo: '2006397', marks: 90, subject: 'science', photo: '' }, // No photo available
    { name: 'Anjali Saini', rollNo: '2006345', marks: 90, subject: 'science', photo: 'assets/images/Toppers/Anjali_Saini.jpg' },
    // Maths Toppers
    { name: 'Mahesh Bairwa', rollNo: 'N/A', marks: 96, subject: 'maths', photo: '' }, // No photo available
    { name: 'Raseena Meena', rollNo: 'N/A', marks: 92, subject: 'maths', photo: '' }, // No photo available
    { name: 'Nirmal Sharma', rollNo: 'N/A', marks: 91, subject: 'maths', photo: '' } // No photo available
];

// --- Seed Function ---
async function seedDatabase() {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await Teacher.deleteMany({});
        await Material.deleteMany({});
        await Topper.deleteMany({});
        console.log('Cleared existing data.');

        // Insert new data
        await Teacher.insertMany(teachersData);
        await Material.insertMany(materialsData);
        await Topper.insertMany(toppersData);
        console.log('Database seeded successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
}

// Run the seed function
seedDatabase(); 