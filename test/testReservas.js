import { connectDB } from '../dist/database/db.js'; 
import { addReserva, listReservas, removeReserva, updateReserva } from '../dist/index.js';
import { expect } from 'chai';
import sinon from 'sinon';

let db;

before(async () => {
    db = await connectDB(':memory:'); // Base de datos en memoria para pruebas
    await db.run(`
        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_apartamento INTEGER NOT NULL,
            id_usuario INTEGER NOT NULL,
            fecha_inicio TEXT NOT NULL,
            fecha_fin TEXT NOT NULL,
            estado TEXT CHECK(estado IN ('pendiente', 'confirmado', 'cancelado')) DEFAULT 'pendiente'
        )
    `);
});

after(async () => {
    await db.close(); // Cerramos la conexión después de las pruebas
});

describe('Test de Funciones Principales de Reservas', () => {
    let reservaId;
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

    it('addReserva debe agregar una nueva reserva', async () => {
        const nuevaReserva = {
            apartamento_id: 1,
            usuario_id: 2,
            fecha_inicio: '2024-11-25',
            fecha_fin: '2024-11-30',
            estado: 'pendiente',
        };

        await addReserva(nuevaReserva);

        const reservas = await listReservas();
        expect(reservas).to.have.lengthOf(1);
        expect(reservas[0]).to.include({
            id_apartamento: 1,
            id_usuario: 2,
            fecha_inicio: '2024-11-25',
            fecha_fin: '2024-11-30',
            estado: 'pendiente',
        });

        reservaId = reservas[0].id;
    });

    it('listReservas debe devolver las reservas existentes', async () => {
        const reservas = await listReservas();
        expect(reservas).to.have.lengthOf(1);
    });

    it('updateReserva debe actualizar una reserva existente', async () => {
        await updateReserva(reservaId, { estado: 'confirmado' });

        const reservas = await listReservas({ id: reservaId });
        expect(reservas).to.have.lengthOf(1);
        expect(reservas[0].estado).to.equal('confirmado');
    });

    it('removeReserva debe eliminar una reserva por su ID', async () => {
        await removeReserva(reservaId);

        const reservas = await listReservas();
        expect(reservas).to.be.empty;
    });

    
});

describe('Test de Funciones Especifícadas de Reservas', () => {
    let reservaId1;
    let reservaId2;
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

    it('addReserva debe agregar una nueva reserva válida', async () => {
        const nuevaReserva = {
            apartamento_id: 1,
            usuario_id: 2,
            fecha_inicio: '2024-11-25',
            fecha_fin: '2024-11-30',
            estado: 'pendiente',
        };

        await addReserva(nuevaReserva);

        const reservas = await listReservas();
        expect(reservas).to.have.lengthOf(1);
        expect(reservas[0]).to.include({
            id_apartamento: 1,
            id_usuario: 2,
            fecha_inicio: '2024-11-25',
            fecha_fin: '2024-11-30',
            estado: 'pendiente',
        });

        reservaId1 = reservas[0].id;
    });

    it('addReserva debe fallar si falta un campo obligatorio', async () => {
        const reservaInvalida = {
            apartamento_id: 1,
            fecha_inicio: '2024-12-01',
            fecha_fin: '2024-12-05',
        };

        try {
            await addReserva(reservaInvalida);
        } catch (error) {
            expect(error.message).to.include('SQLITE_CONSTRAINT');
        }
    });

    it('listReservas debe devolver reservas filtradas por estado', async () => {
        const otraReserva = {
            apartamento_id: 2,
            usuario_id: 3,
            fecha_inicio: '2024-12-01',
            fecha_fin: '2024-12-05',
            estado: 'confirmado',
        };
        await addReserva(otraReserva);

        const reservasConfirmadas = await listReservas({ estado: 'confirmado' });
        expect(reservasConfirmadas).to.have.lengthOf(1);
        expect(reservasConfirmadas[0].estado).to.equal('confirmado');

        reservaId2 = reservasConfirmadas[0].id;
        await removeReserva(reservaId2);
    });

    it('updateReserva debe actualizar solo los campos proporcionados', async () => {
        await updateReserva(reservaId1, { estado: 'cancelado' });

        const reservaActualizada = await listReservas({ id: reservaId1 });

        expect(reservaActualizada).to.have.lengthOf(1);
        expect(reservaActualizada[0].estado).to.equal('cancelado');
        expect(reservaActualizada[0].fecha_inicio).to.equal('2024-11-25'); // Sin cambios
    });

    it('updateReserva debe fallar si se intenta actualizar un ID inexistente', async () => {
        try {
            await updateReserva(9999, { estado: 'confirmado' });
        } catch (error) {
            expect(error.message).to.include('No rows updated');
        }
    });

    it('removeReserva debe eliminar una reserva existente', async () => {
        await removeReserva(reservaId2);

        const reservas = await listReservas();
        expect(reservas).to.have.lengthOf(1);
        expect(reservas[0].id).to.equal(reservaId1);
    });

    it('removeReserva debe fallar si el ID no existe', async () => {
        try {
            await removeReserva(9999);
        } catch (error) {
            expect(error.message).to.include('No rows deleted');
        }
    });

    it('listReservas debe devolver una lista vacía si no hay reservas', async () => {
        await removeReserva(reservaId1);

        const reservas = await listReservas();
        expect(reservas).to.be.empty;
    });
});