require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const app = express();

// Debug: Check if environment variables are loaded
console.log('Environment variables check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'NOT LOADED');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'NOT LOADED');
console.log('PORT:', process.env.PORT || 5000);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with fallback
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guru_academy';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully');
    createDefaultAdmin(); // Create default admin user
}).catch(err => console.error('MongoDB connection error:', err));

// --- Models ---
const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: String,
    experience: String,
    skills: [String],
    photo: String // image URL or filename
});
const Teacher = mongoose.model('Teacher', teacherSchema);

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    features: [String],
    price: Number,
    originalPrice: Number
});
const Course = mongoose.model('Course', courseSchema);

const topperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: String,
    marks: Number,
    subject: String, // 'science' or 'maths'
    photo: String // URL or filename for the topper's photo
});
const Topper = mongoose.model('Topper', topperSchema);

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    features: [String],
    price: Number,
    icon: String
});
const Material = mongoose.model('Material', materialSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Contact Form Schema
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- Auth Middleware ---
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// --- Register Admin (one-time setup) ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.json({ message: 'Admin registered' });
});

// --- Login ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
});

// Function to create a default admin user
async function createDefaultAdmin() {
    try {
        const adminUsername = 'admin';
        const existingAdmin = await User.findOne({ username: adminUsername });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin', 10); // Default password is 'admin'
            const adminUser = new User({
                username: adminUsername,
                password: hashedPassword
            });
            await adminUser.save();
            console.log('Default admin user created successfully.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error creating default admin user:', error);
    }
}

// --- Contact Form Endpoint ---
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        // Save contact form data to database
        const contact = new Contact({
            name,
            email,
            phone,
            message
        });
        await contact.save();

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'guruacademy1998@gmail.com',
            subject: `New Contact Form Guru Academy ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <hr>
                <p><small>This message was sent from the Guru Academy website contact form.</small></p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Thank you for your message! We will get back to you soon.' 
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again later.' 
        });
    }
});

// Get all contact submissions (admin only)
app.get('/api/contacts', authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Error fetching contact submissions' });
    }
});

// --- Teachers CRUD ---
app.get('/api/teachers', async (req, res) => {
    const teachers = await Teacher.find();
    console.log(`API: Found ${teachers.length} teachers.`);
    res.json(teachers);
});
app.post('/api/teachers', authMiddleware, async (req, res) => {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.json(teacher);
});
app.put('/api/teachers/:id', authMiddleware, async (req, res) => {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(teacher);
});
app.delete('/api/teachers/:id', authMiddleware, async (req, res) => {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- Courses CRUD ---
app.get('/api/courses', async (req, res) => {
    res.json(await Course.find());
});
app.post('/api/courses', authMiddleware, async (req, res) => {
    const course = new Course(req.body);
    await course.save();
    res.json(course);
});
app.put('/api/courses/:id', authMiddleware, async (req, res) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
});
app.delete('/api/courses/:id', authMiddleware, async (req, res) => {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- Toppers CRUD ---
app.get('/api/toppers', async (req, res) => {
    const toppers = await Topper.find();
    console.log(`API: Found ${toppers.length} toppers.`);
    res.json(toppers);
});
app.post('/api/toppers', authMiddleware, async (req, res) => {
    const topper = new Topper(req.body);
    await topper.save();
    res.json(topper);
});
app.put('/api/toppers/:id', authMiddleware, async (req, res) => {
    const topper = await Topper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(topper);
});
app.delete('/api/toppers/:id', authMiddleware, async (req, res) => {
    await Topper.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- Study Materials CRUD ---
app.get('/api/materials', async (req, res) => {
    const materials = await Material.find();
    console.log(`API: Found ${materials.length} materials.`);
    res.json(await Material.find());
});
app.post('/api/materials', authMiddleware, async (req, res) => {
    const material = new Material(req.body);
    await material.save();
    res.json(material);
});
app.put('/api/materials/:id', authMiddleware, async (req, res) => {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(material);
});
app.delete('/api/materials/:id', authMiddleware, async (req, res) => {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- One-Time Database Seeding ---
app.get('/api/seed-database', async (req, res) => {
    try {
        // --- Data to Seed ---
        const teachersData = [
            { name: 'Lokesh Saini', subject: 'Science', experience: '3+ years experience in Science.', skills: ['M.Sc.', 'B.Ed'], photo: 'assets/images/L.K._Sir.jpg' },
            { name: 'Hemraj', subject: 'Mathematics', experience: '5+ years specializing in advance Mathematics.', skills: ['M.Sc.', 'B.Ed'], photo: 'assets/images/Hemraj_Sir.jpg' }
        ];

        const materialsData = [
            { title: 'Previous Year Questions', description: 'Get solved previous year questions for Class 10 Science board exams with detailed solutions.', features: ['Board exam questions', 'Detailed solutions', 'Exam pattern based', 'Chapter-wise organization'], price: 51, icon: 'fas fa-question-circle' },
            { title: 'Class-10 Science PDF Notes', description: 'Comprehensive and easy-to-understand PDF notes for Class 10 Science subjects.', features: ['Chapter-wise notes', 'Important points highlighted', 'Downloadable PDF', 'Diagrams and illustrations'], price: 91, icon: 'fas fa-file-alt' }
        ];

        const toppersData = [
            { name: 'Sumit Kumar Bairwa', rollNo: '2006425', marks: 100, subject: 'science', photo: 'assets/images/Toppers/Sumit_Bairwa.jpg' },
            { name: 'Neetu Gurjar', rollNo: '2006398', marks: 99, subject: 'science', photo: 'assets/images/Toppers/Neetu_Gurjar.jpg' },
            { name: 'Manish Jangid', rollNo: '2006383', marks: 99, subject: 'science', photo: 'assets/images/Toppers/Manish_Jangid.jpg' },
            { name: 'Sachin Saini', rollNo: '2006415', marks: 98, subject: 'science', photo: 'assets/images/Toppers/Sachin_Saini.jpg' },
            { name: 'Divya Kumari Sharma', rollNo: '2006359', marks: 97, subject: 'science', photo: 'assets/images/Toppers/Divya_Saini.jpg' },
            { name: 'Shikha Prajapat', rollNo: '2006418', marks: 96, subject: 'science', photo: 'assets/images/Toppers/Shikha_Prajapat.jpg' },
            { name: 'Manish Prajapat', rollNo: '2006385', marks: 96, subject: 'science', photo: 'assets/images/Toppers/Manish_Prajapat.jpg' },
            { name: 'Anjali Vaishnav', rollNo: '2006346', marks: 95, subject: 'science', photo: 'assets/images/Toppers/Anjali_Vaishnav.jpg' },
            { name: 'Gajanand Chhipa', rollNo: '2006362', marks: 95, subject: 'science', photo: 'assets/images/Toppers/Gajanand_Chhipa.jpg' },
            { name: 'Girija Sharma', rollNo: '2006365', marks: 95, subject: 'science', photo: 'assets/images/Toppers/Girija_Sharma.jpg' },
            { name: 'Devendra Saini', rollNo: '2006353', marks: 94, subject: 'science', photo: 'assets/images/Toppers/Devendra_Saini.jpg' },
            { name: 'Neha Saini', rollNo: '2006400', marks: 93, subject: 'science', photo: 'assets/images/Toppers/Neha_Saini.jpg' },
            { name: 'Krishana Sharma', rollNo: '2006376', marks: 92, subject: 'science', photo: 'assets/images/Toppers/Krishna_Sharma.jpg' },
            { name: 'Gajendra Pal Singh Kasana', rollNo: '2006363', marks: 92, subject: 'science', photo: 'assets/images/Toppers/Gajendra_Pal_Singh_Kasana.jpg' },
            { name: 'Anjali Saini', rollNo: '2006345', marks: 90, subject: 'science', photo: 'assets/images/Toppers/Anjali_Saini.jpg' },
            { name: 'Mahesh Bairwa', rollNo: 'N/A', marks: 96, subject: 'maths', photo: '' },
            { name: 'Raseena Meena', rollNo: 'N/A', marks: 92, subject: 'maths', photo: '' },
            { name: 'Nirmal Sharma', rollNo: 'N/A', marks: 91, subject: 'maths', photo: '' }
        ];

        // Clear existing data
        await Teacher.deleteMany({});
        await Material.deleteMany({});
        await Topper.deleteMany({});

        // Insert new data
        await Teacher.insertMany(teachersData);
        await Material.insertMany(materialsData);
        await Topper.insertMany(toppersData);
        
        res.status(200).send('<h1>Database seeded successfully!</h1><p>All website data has been loaded into the database. You can now close this tab.</p>');

    } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).send('<h1>Error seeding database</h1><pre>' + error + '</pre>');
    }
});

app.get('/', (req, res) => {
    res.send('Guru Academy Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 