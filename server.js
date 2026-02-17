import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

console.log('Database connected:', DATABASE_URL);

// Tambahkan kode aplikasi Anda di sini