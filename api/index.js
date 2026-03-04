import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import pkgPrisma from '@prisma/client';
import pkgPg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { PrismaClient } = pkgPrisma;
const { Pool } = pkgPg;

dotenv.config();

const app = express();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// API Routes

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(401).json({ error: 'Email atau password salah' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Email atau password salah' });

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, message: 'Login berhasil' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Gagal login ke server' });
    }
});

// GET all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// POST a new project
app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, desc, category } = req.body;
        let imageUrl = null;
        let imagePublicId = null;

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder: 'portfolio_projects' });
            imageUrl = uploadResponse.secure_url;
            imagePublicId = uploadResponse.public_id;
        }

        const project = await prisma.project.create({
            data: { title, desc, category, imageUrl, imagePublicId },
        });
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// DELETE a project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.imagePublicId) await cloudinary.uploader.destroy(project.imagePublicId);
        await prisma.project.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

export default app;
