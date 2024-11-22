import sqlite3 from 'sqlite3';  // Importa todo el módulo sqlite3
import { open } from 'sqlite';

// Extrae la propiedad Database del módulo sqlite3
const { Database } = sqlite3;

export const connectDB = async () => {
  const db = await open({
    filename: './database.sqlite',
    driver: Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS apartamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direccion TEXT NOT NULL,
      ciudad TEXT NOT NULL,
      pais TEXT NOT NULL,
      codigo_postal TEXT NOT NULL,
      superficie INTEGER NOT NULL CHECK(superficie > 0),
      habitaciones INTEGER NOT NULL,
      baños INTEGER NOT NULL,
      precio DECIMAL(10, 2) NOT NULL CHECK(precio >= 0),
      estado TEXT CHECK(estado IN ('disponible', 'alquilado', 'reservado')) DEFAULT 'disponible',
      propietario_id INTEGER NOT NULL,
      FOREIGN KEY (propietario_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartamento_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      estado TEXT CHECK(estado IN ('pendiente', 'confirmado', 'cancelado')) DEFAULT 'pendiente',
      FOREIGN KEY (apartamento_id) REFERENCES apartamentos(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  return db;
};
