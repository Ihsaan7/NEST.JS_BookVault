import { Injectable, OnModuleInit } from '@nestjs/common';
import sqlite3 from 'sqlite3';
import  fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


@Injectable()
export class DatabaseService implements OnModuleInit {
    private db: sqlite3.Database;

    onModuleInit() {
        const isVercel = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
        const dbDir = isVercel ? '/tmp' : process.cwd();
        const dbPath = path.resolve(dbDir, 'bookvault.db');

        if (isVercel && !fs.existsSync(dbPath)) {
            const seedDbPath = path.resolve(process.cwd(), 'bookvault.db');
            if (fs.existsSync(seedDbPath)) {
                try {
                    fs.copyFileSync(seedDbPath, dbPath);
                    console.log('✅ Copied seeded database to /tmp/bookvault.db');
                } catch (copyErr: any) {
                    console.warn('⚠️ Could not copy pre-seeded db:', copyErr?.message);
                }
            }
        }

        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                return;
            }
            console.log('✅ Connected to SQLite database at:', dbPath);
            this.db.run('PRAGMA foreign_keys = ON;');
            this.db.run('PRAGMA journal_mode = WAL;');
            this.db.run('PRAGMA busy_timeout = 5000;');

            let schema = '';
            const possibleSchemaPaths = [
                path.join(__dirname, 'schema.sql'),
                path.join(process.cwd(), 'src', 'db', 'schema.sql'),
                path.join(process.cwd(), 'dist', 'db', 'schema.sql'),
                path.join(process.cwd(), 'schema.sql'),
            ];

            for (const p of possibleSchemaPaths) {
                if (fs.existsSync(p)) {
                    schema = fs.readFileSync(p, 'utf-8');
                    break;
                }
            }

            if (!schema) {
                schema = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT CHECK(role IN ('USER', 'ADMIN')) DEFAULT 'USER',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    category TEXT CHECK(category IN ('FICTION', 'NON_FICTION', 'SCI_FI', 'BIOGRAPHY', 'MYSTERY', 'FANTASY')) NOT NULL,
                    description TEXT,
                    isbn TEXT UNIQUE NOT NULL,
                    is_available BOOLEAN DEFAULT 1,
                    added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS borrows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                    borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    returned_at DATETIME,
                    status TEXT CHECK(status IN ('BORROWED', 'RETURNED')) DEFAULT 'BORROWED'
                );
                CREATE TABLE IF NOT EXISTS reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                    rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
                    comment TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, book_id)
                );
                `;
            }

            this.db.exec(schema, (execErr) => {
                if (execErr) {
                    console.error('❌ Schema initialization failed:', execErr.message);
                    return;
                }
                console.log('✅ Database schema initialized');
                void this.seedInitialData();
            });
        });
    }

    private async seedInitialData() {
        try {
            const countRow: any = await this.get('SELECT COUNT(*) as count FROM books');
            if (countRow && countRow.count === 0) {
                // Bcrypt hash for 'vault123'
                const passwordHash = '$2b$10$aXedDxQ4ryKpexHI4sl5UewIkQVD2D8O90DuXHSTNGCTxlwbMae1G';
                
                await this.run(
                    `INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                    ['Curator Eleanor Vance', 'curator@bookvault.org', passwordHash, 'ADMIN'],
                );
                await this.run(
                    `INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                    ['Fellow Julian Blackwood', 'reader@bookvault.org', passwordHash, 'USER'],
                );

                const adminUser = await this.get(`SELECT id FROM users WHERE email = ?`, ['curator@bookvault.org']);
                const adminId = adminUser ? adminUser.id : 1;

                const initialBooks = [
                    {
                        title: 'Codex Leicester & Treatises on Water',
                        author: 'Leonardo da Vinci',
                        category: 'NON_FICTION',
                        description: 'A 72-page compilation of scientific observations, astronomical hypotheses, and hydrodynamics treatises penned in mirror script.',
                        isbn: '978-0192806284',
                    },
                    {
                        title: 'The Name of the Rose',
                        author: 'Umberto Eco',
                        category: 'MYSTERY',
                        description: 'A medieval historical investigation into baffling murders inside an isolated Benedictine abbey library labyrinth.',
                        isbn: '978-0156001311',
                    },
                    {
                        title: 'Ficciones: The Library of Babel',
                        author: 'Jorge Luis Borges',
                        category: 'FICTION',
                        description: 'Foundational metaphysical labyrinth examining an infinite library containing all possible 410-page books.',
                        isbn: '978-0802130303',
                    },
                    {
                        title: 'Solaris',
                        author: 'Stanisław Lem',
                        category: 'SCI_FI',
                        description: 'Philosophical inquiry into humankind’s encounter with a sentient ocean planet exceeding terrestrial comprehension.',
                        isbn: '978-0156027601',
                    },
                    {
                        title: 'The Shadow of the Torturer',
                        author: 'Gene Wolfe',
                        category: 'FANTASY',
                        description: 'First folio of the Book of the New Sun, recounting the exile and ascension of the journeyman Severian across an ancient Urth.',
                        isbn: '978-0312873141',
                    },
                    {
                        title: 'The Man Who Knew Infinity',
                        author: 'Robert Kanigel',
                        category: 'BIOGRAPHY',
                        description: 'The biographical account of the self-taught Indian mathematical visionary Srinivasa Ramanujan and his Cambridge collaboration.',
                        isbn: '978-0671750619',
                    },
                ];

                for (const b of initialBooks) {
                    await this.run(
                        `INSERT OR IGNORE INTO books (title, author, category, description, isbn, is_available, added_by)
                         VALUES (?, ?, ?, ?, ?, 1, ?)`,
                        [b.title, b.author, b.category, b.description, b.isbn, adminId],
                    );
                }
                console.log('🏛️ Initial Book-Vault archival catalog seeded');
            }
        } catch (err: any) {
            console.error('Seeding notice:', err.message);
        }
    }

    getDB(): sqlite3.Database {
        return this.db;
    }

    run(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    all(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
}