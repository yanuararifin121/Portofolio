import pkgPrisma from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pkgPg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkgPrisma;
const { Pool } = pkgPg;

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'yanuararifin121@gmail.com';
    const password = 'LIONSTARMLBB';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            email,
            password: hashedPassword,
        },
    });

    console.log('Seeded admin user:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
