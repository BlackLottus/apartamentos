import { connectDB } from '../dist/database/db.js'; 
import { addImagen, listImagenes, deleteImage, getImagenById } from '../dist/index.js';
import { expect } from 'chai';
import sinon from 'sinon';

let db;

before(async () => {
    db = await connectDB(':memory:'); // Base de datos en memoria para pruebas
    await db.run(`
        CREATE TABLE IF NOT EXISTS imagenes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            apartamento_id INTEGER NOT NULL,
            imagen TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            FOREIGN KEY (apartamento_id) REFERENCES apartamentos(id) ON DELETE CASCADE
        )
    `);
});

after(async () => {
    await db.close(); // Cerramos la conexión después de las pruebas
});

describe('Test de Funciones Principales de Imágenes', () => {
    let imagenId;
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

    it('addImagen debe agregar una nueva imagen', async () => {
        const nuevaImagen = {
            apartamento_id: 1,
            imagen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
            descripcion: 'Imagen de prueba',
        };

        await addImagen(nuevaImagen);

        const imagenes = await listImagenes();
        expect(imagenes).to.have.lengthOf(1);
        expect(imagenes[0]).to.include({
            apartamento_id: 1,
            descripcion: 'Imagen de prueba',
        });

        imagenId = imagenes[0].id;
    });

    it('listImagenes debe devolver las imágenes existentes', async () => {
        const imagenes = await listImagenes();
        expect(imagenes).to.have.lengthOf(1);
    });

    it('getImagenById debe devolver una imagen específica', async () => {
        const imagen = await getImagenById(imagenId);
        expect(imagen).to.include({
            id: imagenId,
            apartamento_id: 1,
            descripcion: 'Imagen de prueba',
        });
    });

    it('deleteImage debe eliminar una imagen por su ID', async () => {
        await deleteImage(imagenId);

        const imagenes = await listImagenes();
        expect(imagenes).to.be.empty;
    });
});

describe('Test de Funciones Específicas de Imágenes', () => {
    let imagenId1;
    let imagenId2;
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

    it('addImagen debe fallar si falta un campo obligatorio', async () => {
        const imagenInvalida = {
            apartamento_id: 1,
            descripcion: 'Imagen sin Base64',
        };

        try {
            await addImagen(imagenInvalida);
        } catch (error) {
            expect(error.message).to.include('Faltan datos para la inserción');
        }
    });

    it('listImagenes debe devolver imágenes filtradas por apartamento_id', async () => {
        const imagen1 = {
            apartamento_id: 1,
            imagen: 'data:image/png;base64,AAAAA',
            descripcion: 'Primera imagen',
        };
        const imagen2 = {
            apartamento_id: 2,
            imagen: 'data:image/png;base64,BBBBB',
            descripcion: 'Segunda imagen',
        };

        await addImagen(imagen1);
        await addImagen(imagen2);

        const imagenesApartamento1 = await listImagenes(1);
        expect(imagenesApartamento1).to.have.lengthOf(1);
        expect(imagenesApartamento1[0].descripcion).to.equal('Primera imagen');

        imagenId1 = imagenesApartamento1[0].id;
        imagenId2 = (await listImagenes(2))[0].id;

        await deleteImage(imagenId2);
    });

    it('getImagenById debe devolver null si no se encuentra la imagen', async () => {
        const imagen = await getImagenById(9999);
        expect(imagen).to.be.null;
    });

    it('deleteImage debe fallar si el ID no existe', async () => {
        try {
            await deleteImage(9999);
        } catch (error) {
            expect(error.message).to.include('No se encontró ninguna imagen');
        }
    });

    it('listImagenes debe devolver una lista vacía si no hay imágenes', async () => {
        await deleteImage(imagenId1);

        const imagenes = await listImagenes();
        expect(imagenes).to.be.empty;
    });
});
