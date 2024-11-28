import { connectDB } from '../dist/database/db.js'; 
import { addApartamento, listApartamentos, updateApartamento, deleteApartamento } from '../dist/index.js';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Funciones Básicas de Apartamentos', () => {
    let db;
    let logStub;
    let errorStub;

    beforeEach(() => {
        // Silenciar console.log y console.error
        logStub = sinon.stub(console, 'log');
        errorStub = sinon.stub(console, 'error');
    });

    afterEach(() => {
        logStub.restore();
        errorStub.restore();
    });

    // Antes de todas las pruebas, se configura la base de datos
    before(async () => {
        db = await connectDB();
        // Crear tabla temporal para pruebas
        await db.exec(`
            CREATE TABLE IF NOT EXISTS apartamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                direccion TEXT NOT NULL,
                ciudad TEXT NOT NULL,
                pais TEXT NOT NULL,
                cp TEXT NOT NULL,
                superficie REAL NOT NULL,
                habitaciones INTEGER NOT NULL,
                baños INTEGER NOT NULL,
                precio REAL NOT NULL,
                estado TEXT CHECK(estado IN ('disponible', 'alquilado', 'reservado')) DEFAULT 'disponible',
                propietario_id INTEGER NOT NULL
            );
        `);
    });

    // Después de todas las pruebas, se limpia la base de datos
    after(async () => {
        await db.exec(`DROP TABLE apartamentos`);
        db.close();
    });

    it('Debe crear un nuevo apartamento', async () => {
        const nuevoApartamento = {
            direccion: 'Calle Falsa 123',
            ciudad: 'Madrid',
            pais: 'España',
            codigo_postal: '28001',
            superficie: 85.5,
            habitaciones: 2,
            baños: 1,
            precio: 1200,
            estado: 'disponible',
            descripcion: 'Nuevo Apartamento', 
            propietario_id: 1,
        };

        await addApartamento(nuevoApartamento);
        const apartamentos = await listApartamentos();
        expect(apartamentos).to.have.lengthOf(1);
        expect(apartamentos[0].direccion).to.equal('Calle Falsa 123');
    });

    it('Debe listar apartamentos con una consulta', async () => {
        const apartamentos = await listApartamentos({ ciudad: 'Madrid' });
        expect(apartamentos).to.have.lengthOf(1);
        expect(apartamentos[0].ciudad).to.equal('Madrid');
    });

    it('Debe actualizar un apartamento existente', async () => {
        // Primero, obtén el apartamento que vas a actualizar
        const apartamentos = await listApartamentos();
        const apartamento = apartamentos[0];
    
        // Asegúrate de que el apartamento existe
        expect(apartamento).to.exist;

        // Crea un nuevo objeto apartamento con los cambios que deseas realizar
        const nuevosDatosApartamento = {
            direccion: apartamento.direccion,  // Mantén la dirección original
            ciudad: apartamento.ciudad,        // Mantén la ciudad original
            pais: apartamento.pais,            // Mantén el país original
            cp: apartamento.cp,                // Mantén el código postal original
            superficie: apartamento.superficie, // Mantén la superficie original
            habitaciones: apartamento.habitaciones, // Mantén las habitaciones originales
            baños: apartamento.baños,          // Mantén los baños originales
            precio: 1300,                      // Cambia el precio
            estado: 'reservado',               // Cambia el estado
            propietario_id: apartamento.propietario_id, // Mantén el propietario original
        };
    
        // Llama a la función `updateApartamento` pasando el apartamento original y el nuevo objeto con los cambios
        await updateApartamento(apartamento, nuevosDatosApartamento);
    
        // Verifica que los datos del apartamento se hayan actualizado correctamente
        const apartamentosActualizados = await listApartamentos();
        expect(apartamentosActualizados[0].precio).to.equal(1300);
        expect(apartamentosActualizados[0].estado).to.equal('reservado');
    });

    it('Debe eliminar un apartamento existente', async () => {
        const apartamentos = await listApartamentos();
        const apartamento = apartamentos[0];

        await deleteApartamento(apartamento.id);
        const apartamentosRestantes = await listApartamentos();
        expect(apartamentosRestantes).to.have.lengthOf(0);
    });
});


describe('Funciones Avanzadas de Apartamentos', () => {
    let db;
    let logStub;
    let errorStub;

    beforeEach(() => {
        // Silenciar console.log y console.error
        logStub = sinon.stub(console, 'log');
        errorStub = sinon.stub(console, 'error');
    });

    afterEach(() => {
        logStub.restore();
        errorStub.restore();
    });

    // Configuración inicial: Crear tabla de apartamentos
    before(async () => {
        db = await connectDB();
        await db.exec(`
            CREATE TABLE IF NOT EXISTS apartamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                direccion TEXT NOT NULL,
                ciudad TEXT NOT NULL,
                pais TEXT NOT NULL,
                codigo_postal TEXT NOT NULL,
                superficie REAL NOT NULL,
                habitaciones INTEGER NOT NULL,
                baños INTEGER NOT NULL,
                precio REAL NOT NULL,
                estado TEXT CHECK(estado IN ('disponible', 'alquilado', 'reservado')) DEFAULT 'disponible',
                descripcion TEXT,
                propietario_id INTEGER NOT NULL
            );
        `);
    });

    // Limpieza después de todas las pruebas
    after(async () => {
        await db.exec(`DROP TABLE apartamentos`);
        db.close();
    });

    it('Debe crear un nuevo apartamento', async () => {
        const nuevoApartamento = {
            direccion: 'Calle Falsa 123',
            ciudad: 'Madrid',
            pais: 'España',
            codigo_postal: '28001',
            superficie: 85.5,
            habitaciones: 2,
            baños: 1,
            precio: 1200,
            estado: 'disponible',
            descripcion: 'Nuevo Apartamento', 
            propietario_id: 1,
        };

        await addApartamento(nuevoApartamento);
        const apartamentos = await listApartamentos();
        expect(apartamentos).to.have.lengthOf(1);
        expect(apartamentos[0].direccion).to.equal('Calle Falsa 123');
        await deleteApartamento(apartamentos[0].id); // Elimina el apartamento.
    });

    it('Debe fallar al crear un apartamento con precio negativo', async () => {
        const nuevoApartamento = {
            direccion: 'Calle Falsa 123',
            ciudad: 'Madrid',
            pais: 'España',
            codigo_postal: '28001',
            superficie: 85.5,
            habitaciones: 2,
            baños: 1,
            precio: -500, // Precio negativo
            estado: 'disponible',
            propietario_id: 1,
        };

        await addApartamento(nuevoApartamento);
        const apartamentos = await listApartamentos();
        expect(apartamentos).to.have.lengthOf(0);  // No debería haberse creado por lo tanto hay 0.
    });

    it('Debe listar apartamentos con un filtro de ciudad', async () => {
        const nuevoApartamento = {
            direccion: 'Calle Falsa 123',
            ciudad: 'Madrid',
            pais: 'España',
            codigo_postal: '28001',
            superficie: 85.5,
            habitaciones: 2,
            baños: 1,
            precio: 100, // Precio negativo
            estado: 'disponible',
            propietario_id: 1,
        };

        await addApartamento(nuevoApartamento);
        const apartamentos = await listApartamentos({ ciudad: 'Madrid' });
        expect(apartamentos).to.have.lengthOf(1);
        expect(apartamentos[0].ciudad).to.equal('Madrid');
        deleteApartamento(apartamentos[0].id);
    });

    it('Debe actualizar un apartamento existente', async () => {
        // Crear un apartamento para probar la actualización
        const apartamentoOriginal = {
            direccion: 'Calle Real 123',
            ciudad: 'Madrid',
            pais: 'España',
            codigo_postal: '28002',
            superficie: 100,
            habitaciones: 3,
            baños: 2,
            precio: 1500,
            estado: 'disponible',
            propietario_id: 2,
        };
        await addApartamento(apartamentoOriginal);

        // Obtener el apartamento creado
        const apartamentos = await listApartamentos();
        const apartamento = apartamentos[0];

        // Datos a actualizar
        const nuevosDatosApartamento = {
            direccion: 'Calle Falsa 123', // Cambia la dirección
            precio: 2000, // Cambia el precio
            estado: 'reservado', // Cambia el estado
        };

        await updateApartamento(apartamento, nuevosDatosApartamento);

        // Verificar que los datos se hayan actualizado
        const apartamentosActualizados = await listApartamentos();
        expect(apartamentosActualizados[0].direccion).to.equal('Calle Falsa 123');
        expect(apartamentosActualizados[0].precio).to.equal(2000);
        expect(apartamentosActualizados[0].estado).to.equal('reservado');
        await deleteApartamento(apartamentosActualizados[0].id);
    });

    it('No debe actualizar un apartamento inexistente', async () => {
        const apartamentoInexistente = { id: 99999 };  // ID no válido

        const nuevosDatosApartamento = {
            direccion: 'Calle Inexistente 123',
            precio: 9999,
        };

        await updateApartamento(apartamentoInexistente, nuevosDatosApartamento);
        
        const apartamentos = await listApartamentos();
        expect(apartamentos).to.have.lengthOf(0);  // No debe haber cambios
    });

    it('Debe eliminar un apartamento existente', async () => {
        const apartamentoOriginal = {
            direccion: 'Calle Eliminar 123',
            ciudad: 'Madrid',
            pais: 'España',
            codigo_postal: '28003',
            superficie: 80,
            habitaciones: 2,
            baños: 1,
            precio: 1300,
            estado: 'disponible',
            propietario_id: 3,
        };
        await addApartamento(apartamentoOriginal);

        // Obtener el apartamento creado
        const apartamentos = await listApartamentos();
        const apartamento = apartamentos[0];

        await deleteApartamento(apartamento.id);

        const apartamentosRestantes = await listApartamentos();
        expect(apartamentosRestantes).to.have.lengthOf(0);  // El apartamento debe haber sido eliminado
    });

    it('No debe eliminar un apartamento inexistente', async () => {
        await deleteApartamento(99999);  // ID no válido
        const apartamentos = await listApartamentos();
        expect(apartamentos).to.have.lengthOf(0);  // No debe eliminar nada
    });
});