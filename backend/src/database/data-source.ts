import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Repo root is two levels above backend/dist/database (or one above backend/src/database)
const backendRoot = join(__dirname, '..', '..');

export const databasePath = join(backendRoot, '..', 'database', 'data', 'rol-ems.sqlite');

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: databasePath,
  entities: [join(__dirname, '..', 'src', '**', '*.entity.js')],
  synchronize: true,
  logging: false,
});
