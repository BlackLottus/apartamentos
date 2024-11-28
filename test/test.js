import { guardarImagen, getImagenById, listImagenes, deleteImage,
    addApartamento, updateApartamento, listApartamentos, getApartamentoById } from '../dist/index.js';
import { connectDB } from '../dist/database/db.js'; 
import { readFileSync, writeFileSync } from 'fs';

/*(async () => {

    
    console.log("Pruebas de Apartamentos:");
    await addApartamento({ 
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
        propietario_id: '1' 
    });  
    console.table(await listApartamentos());

    console.log("\n\n\n");
    console.log("Pruebas de Update:");
    
    // UPDATE
    const updatedData = {
        descripcion: 'Cambio', 
      };
      const apartamento = await getApartamentoById(1);
      console.log("ANTES: ");
      console.table(await listApartamentos());

      await updateApartamento(apartamento, updatedData);
      console.log("DESPUÉS: ");
      console.table(await listApartamentos());
    
    
      let db;
      db = await connectDB();
      await db.exec(`DROP TABLE apartamentos`);
      db.close();


      console.log("Pruebas de ADD:");
    await addImagen({ 
        apartamento_id: 1,
        imagen: 'asdasd',
        descripcion: 'desc' 
    });  
    await addImagen({ 
        apartamento_id: 2,
        imagen: 'asdasd',
        descripcion: 'desc' 
    }); 
    await addImagen({ 
        apartamento_id: 2,
        imagen: 'asdasd',
        descripcion: 'desc' 
    }); 
    await addImagen({ 
        apartamento_id: 1,
        imagen: 'asdasd',
        descripcion: 'desc' 
    }); 
    console.table(await listImagenes());

    console.log("\n\n\n");
    console.log("Pruebas de LIST:");

    ;
    console.table(await listImagenes({apartamento_id: "1"}));

    console.log("\n\n\n");
    console.log("Pruebas de Delete:");

    await deleteImagen(1);
    console.table(await listImagenes());
    
    let db;
    db = await connectDB();
    await db.exec(`DROP TABLE imagenes`);
    db.close();
    
    */


    // Uso de las funciones
// Uso de las funciones

      const main = async () => {
        try {
          const db = await connectDB(); // Conexión a la base de datos
      
          // Leer la imagen y convertirla a Base64
          const rutaImagen = './imagenes/imagenPrueba.jpg';  // Ruta de la imagen en tu sistema
          const bufferImagen = readFileSync(rutaImagen);
          const base64Imagen = bufferImagen.toString('base64');  // Convertir el Buffer a Base64
          //console.log(base64Imagen);  // Verifica que es un string Base64
      
          const nuevaImagen = {
            apartamento_id: 1,  // ID de apartamento (ajusta según tu caso)
            imagen: base64Imagen,
            descripcion: 'Descripción de la imagen'
          };
      
          // Guardar la imagen en la base de datos
          await guardarImagen(nuevaImagen);
      
          // Cerrar la base de datos
          db.close((err) => {
            if (err) {
              console.error('Error al cerrar la base de datos:', err.message);
            } else {
              console.log('Base de datos cerrada.');
            }
          });
        } catch (err) {
          console.error('Error:', err);
        }
      };

        const imagenes = await listImagenes(1);
        console.log(imagenes.length);

      /*

      try {
        const id = 1;  // El ID 
    
        // Recuperar la imagen de la base de datos
        const imagenRecuperada = await getImagenById(id);
    
        if (imagenRecuperada) {
          console.log('Imagen Base64:', imagenRecuperada.imagen);
          console.log('Descripción:', imagenRecuperada.descripcion);
    
          // Aquí puedes utilizar la imagen Base64 para mostrarla en algún lugar
          // Por ejemplo, en una etiqueta <img> en una página web:
          // <img src={`data:image/jpeg;base64,${imagenRecuperada.imagen}`} alt="Imagen" />
        }
    
      } catch (err) {
        console.error('Error:', err);
      }*/
      
      // Ejecutar la función principal
      main();