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
        const dbPath = path.resolve(process.cwd(), 'bookvault.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                return;
            }
            console.log('✅ Connected to SQLite database');

            const schema = fs.readFileSync(
                path.join(__dirname, 'schema.sql'),
                'utf-8',
            );
            this.db.exec(schema, (execErr) => {
                if (execErr) {
                    console.error('❌ Schema initialization failed:', execErr.message);
                    return;
                }
                console.log('✅ Database schema initialized');
            });
        });
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