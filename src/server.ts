import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {
  addApartamento,listApartamentos, updateApartamento, deleteApartamento, getApartamentoById,
  addReserva, listReservas, deleteReserva, getReservaId, updateReserva,
  addImagen, listImagenes, getImagenById, deleteImage
} from './controllers/controller.js'; 
import { Imagen } from './models/imagen.js'; // Ajusta el path

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Rutas de usuarios

/* *********************************************** */
/*         EndPoints para Agregar con POST         */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */
// Agregar nuevo apartamento
app.post('/apartamentos/add', async (req, res) => {
  try {
    const apa = await addApartamento(req.body);
    res.status(201).json({ apa });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el apartamento' });
  }
});

// Agregar una reserva
app.post('/reservas/add', async (req, res) => {
  try {
      const reserva = await addReserva(req.body);

      if (!reserva) {
          res.status(400).json({ error: 'No se pudo crear la reserva. Verifica los datos enviados.' });
          return 
      }

      res.status(201).json({ reserva });
  } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ error: 'Error al crear la reserva.' });
  }
});

// Añadir una imagen
app.post('/apartamentos/:id_apartamento/imagenes', async (req: Request, res: Response) => {
  try {
    const datosImagen: Omit<Imagen, 'id'> = { 
      ...req.body, 
      apartamento_id: parseInt(req.params.id_apartamento, 10) 
    };
    await addImagen(datosImagen);
    res.status(201).json({ message: 'Imagen añadida exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al añadir la imagen' });
  }
});

/* *********************************************** */
/*         EndPoints para Recoger con GET          */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */
// Listar los apartamentos
app.get('/apartamentos', async (req: Request, res: Response) => {
    try {
        // Construir el objeto query con los parámetros de la consulta
        const estado = req.query.estado as "disponible" | "alquilado" | "reservado" | "inactivo" | undefined;
        const query = {
            ciudad: req.query.ciudad as string | undefined,
            estado: estado, // Se asegura de que estado tenga solo los valores válidos
            precio: req.query.precio ? parseInt(req.query.precio as string, 10) : undefined,
            habitaciones: req.query.habitaciones ? parseInt(req.query.habitaciones as string, 10) : undefined,
            baños: req.query.baños ? parseInt(req.query.baños as string, 10) : undefined,
        };

        // Llamar a la función para obtener los apartamentos con la consulta
        const apartamentos = await listApartamentos(query);

        // Enviar la respuesta con los apartamentos encontrados
        res.json(apartamentos);
    } catch (error) {
        // Manejo de errores
        console.error('Error al obtener apartamentos:', error);
        res.status(500).json({ message: 'Error al obtener apartamentos' });
    }
});
  
// Listar reservas
app.get('/reservas', async (req: Request, res: Response) => {
  try {
    // Construir el objeto query con los parámetros de la consulta
    const estado = req.query.estado as "pendiente" | "confirmado" | "cancelado" | undefined;
    const query = { 
      fecha_inicio: req.query.fecha_inicio as string | undefined,
      fecha_fin: req.query.fecha_fin as string | undefined,
      estado: estado, // Se asegura de que estado tenga solo los valores válidos
      usuario_id: req.query.usuario_id ? parseInt(req.query.usuario_id as string, 10) : undefined,
      propietario_id: req.query.propietario_id ? parseInt(req.query.propietario_id as string, 10) : undefined,
    };
  
    // Llamar a la función para obtener las reservas con la consulta
    const reservas = await listReservas(query);
  
    // Enviar la respuesta con las reservas encontrados
    res.json(reservas);
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener las reservas:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
});

// Listar imagenes
app.get('/apartamentos/:apartamento_id/imagenes', async (req: Request, res: Response) => {
  try {
    const apartamento_id = parseInt(req.params.apartamento_id, 10);  // Usamos el id del apartamento de la URL
    const imagenes = await listImagenes(apartamento_id);
    res.status(200).json(imagenes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar las imágenes' });
  }
});

/* *********************************************** */
/*        EndPoints para Actualizar con PUT        */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */
// Actualizar apartamentos
app.put('/apartamentos/:id', async (req: Request, res: Response) => {
    const apartmentId = parseInt(req.params.id); // Obtener el ID del apartamento desde la URL
    const newApartamento = req.body; // Obtener los nuevos datos del apartamento desde el cuerpo de la petición
    
    try {
    // Comprobar si el apartamento existe antes de actualizarlo
    const existingApartamento = await getApartamentoById(apartmentId);
        
    if (!existingApartamento) {
        res.status(404).json({ error: 'Apartamento no encontrado' });
        return 
    }
    
    // Llamar a la función updateApartamento para realizar la actualización
    await updateApartamento(apartmentId, newApartamento);
    
    const newApa = await getApartamentoById(apartmentId);
    // Responder con un mensaje de éxito
    res.status(200).json({ newApa });
    } catch (error) {
    console.error('Error al actualizar el apartamento:', error);
    res.status(500).json({ error: 'Error al actualizar el apartamento' });
    }
});

// Actualizar reservas
app.put('/reservas/:id', async (req: Request, res: Response) => {
  const reservaId = parseInt(req.params.id); // Obtener el ID de la reserva desde la URL
  const newReserva = req.body; // Obtener los nuevos datos de la reserva desde el cuerpo de la petición
  
  try {
  // Comprobar si la reserva existe antes de actualizarla
  const existingReserva = await getReservaId(reservaId);
      
  if (!existingReserva) {
      res.status(404).json({ error: 'Reserva no encontrado' });
      return 
  }
  
  // Llamar a la función updateReserva para realizar la actualización
  await updateReserva(reservaId, newReserva);
  
  const newRes = await getReservaId(reservaId);
  // Responder con un mensaje de éxito
  res.status(200).json({ newRes });
  } catch (error) {
  console.error('Error al actualizar la reserva:', error);
  res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
});

/* *********************************************** */
/*       EndPoints para Eliminar con DELETE        */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */

// Eliminar apartamentos
app.delete('/apartamentos/:id', async (req: Request, res: Response) => {
    const apartmentId = parseInt(req.params.id); // Obtener el ID del apartamento desde la URL
  
    try {
      // Comprobar si el apartamento existe antes de eliminarlo
      const existingApartamento = await getApartamentoById(apartmentId);
  
      if (!existingApartamento) {
        res.status(404).json({ error: 'Apartamento no encontrado' });
        return 
      }
  
      // Llamar a la función deleteApartamento para eliminar el apartamento
      const apartamentoRemoved = await deleteApartamento(apartmentId);
  
      // Responder con un mensaje de éxito
      res.status(200).json({ apartamentoRemoved });
    } catch (error) {
      console.error('Error al eliminar el apartamento:', error);
      res.status(500).json({ error: 'Error al eliminar el apartamento' });
    }
});

// Eliminar reservas
app.delete('/reservas/:id', async (req: Request, res: Response) => {
  const reservaId = parseInt(req.params.id); // Obtener el ID de la reserva desde la URL

  try {
    // Comprobar si la reserva existe antes de eliminarla
    const existingReserva = await getReservaId(reservaId);

    if (!existingReserva) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return 
    }

    // Llamar a la función deleteReserva para eliminar la reserva
    const reservaRemoved = await deleteReserva(reservaId);

    // Responder con un mensaje de éxito
    res.status(200).json({ reservaRemoved });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

// Eliminar una imagen
app.delete('/apartamentos/:apartamento_id/imagenes/:imagen_id', async (req: Request, res: Response) => {
  try {
    const imagen_id = parseInt(req.params.imagen_id, 10);
    await deleteImage(imagen_id);
    res.status(200).json({ message: `Imagen con id ${imagen_id} eliminada correctamente` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la imagen' });
  }
});

/* *********************************************** */
/*              EndPoints ADICIONALES              */
/* *********************************************** */
// Endpoint para obtener una imagen por su ID
app.get('/apartamentos/:id_apartamento/imagenes/:imagen_id', async (req: Request, res: Response) => {
  try {
    const imagen_id = parseInt(req.params.imagen_id, 10);
    const imagen = await getImagenById(imagen_id);
    if (imagen) {
      res.status(200).json(imagen);
    } else {
      res.status(404).json({ message: 'Imagen no encontrada' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener la imagen' });
  }
});


/****************/
/*** SERVIDOR ***/
/****************/
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});