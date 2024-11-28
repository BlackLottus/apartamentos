import { connectDB } from '../database/db.js'; 
import { Apartamento } from '../models/apartamento.js'; 
import { Reserva } from '../models/reserva.js';
import { Imagen } from '../models/imagen.js';

var CONSULTAS = {
    INSERT_APARTMENT : `INSERT INTO apartamentos (direccion, ciudad, pais, codigo_postal, superficie, habitaciones, baños, precio, estado, descripcion, propietario_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    SELECT_APARTMENT_BY_ID : `SELECT * FROM apartamentos WHERE id = ?`,
    DELETE_APARTMENT : `DELETE FROM apartamentos WHERE id = ?`,
    INSERT_RESERVA : `INSERT INTO reservas (apartamento_id, usuario_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)`,
    SELECT_RESERVA_BY_ID : `SELECT * FROM reservas WHERE id = ?`,
    DELETE_RESERVA : `DELETE FROM reservas WHERE id = ?`,
    INSERT_IMAGEN : `INSERT INTO imagenes (apartamento_id, imagen, descripcion) VALUES (?, ?, ?)`,
    SELECT_IMAGEN_BY_ID : "SELECT * FROM imagenes WHERE id = ?",
    DELETE_IMAGEN : `DELETE FROM imagenes WHERE id = ?`,
}

/* *********************************************** */
/*              Métodos para Agregar               */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */
export const addApartamento = async (apartamento: Omit<Apartamento, 'id'>): Promise<void | Apartamento> => {
    const db = await connectDB();

    // Validar el estado del apartamento
    const estadosPermitidos: Apartamento['estado'][] = ['disponible', 'alquilado', 'reservado', 'inactivo'];
    if (!estadosPermitidos.includes(apartamento.estado)) {
        console.log(`Estado inválido: ${apartamento.estado}. Debe ser uno de los siguientes: ${estadosPermitidos.join(', ')}`);
        return;
    }

    // Validar otros campos si es necesario (por ejemplo, precio positivo o superficie válida)
    if (apartamento.precio <= 0) {
        console.log(`El precio del apartamento debe ser mayor que 0.`);
        return;
    }

    // Validar la dirección si ya existe en la base de datos.
    const dire = await db.get<Apartamento>(`SELECT * FROM apartamentos WHERE direccion = ?`, [apartamento.direccion]);
    if (dire != null) {
        console.log(`La dirección insertada de ese Apartamento ya está registrada.`);
        return;
    }

    if (apartamento.superficie <= 0) {
        console.log(`La superficie debe ser mayor que 0.`);
        return;
    }

    try {
        const newApatarmento = await db.run(CONSULTAS.INSERT_APARTMENT, [apartamento.direccion, apartamento.ciudad, apartamento.pais, apartamento.codigo_postal, apartamento.superficie,
            apartamento.habitaciones, apartamento.baños, apartamento.precio, apartamento.estado, apartamento.descripcion, apartamento.propietario_id,
        ]);
        const nuevoApartamento = { id: newApatarmento.lastID, ...apartamento};
        console.log("Se ha creado un nuevo apartamento con la ID: "+newApatarmento.lastID);
        return nuevoApartamento;
    } catch (error) {
        console.error(`No se pudo crear el apartamento.`, error);
    }
};

export const addReserva = async (reserva: Omit<Reserva, 'id'>): Promise<void | Reserva> => {
    const db = await connectDB();

    // Validar el estado de la Reserva
    const estadosPermitidos: Reserva['estado'][] = ['pendiente', 'confirmado', 'cancelado', 'expirado'];
    if (!estadosPermitidos.includes(reserva.estado)) {
        console.log(`Estado inválido: ${reserva.estado}. Debe ser uno de los siguientes: ${estadosPermitidos.join(', ')}`);
        return;
    }

    // Validar si existe el apartamento al cual se está haciendo la reserva.
    if (!reserva.apartamento_id) {
        console.log(`Se debe especificar la ID del apartamento que se desea reservar.`);
        return;
    }

    const apartamento_id = reserva.apartamento_id;

    // Verificar si ya existen reservas para ese apartamento Y NO ESTÁN EXPIRADAS O CANCELADAS
    const existReserva = await db.get<Reserva>(`SELECT * FROM reservas WHERE apartamento_id = ? AND estado IN ('pendiente', 'confirmado')`, 
        [apartamento_id]);

    if (existReserva != null) {
        console.log(`Ya existe una reserva para el apartamento insertado. Espera a que expire.`);
        return;
    }

    try {
        // Insertar nueva reserva
        const newReserva = await db.run(
            CONSULTAS.INSERT_RESERVA,
            [reserva.apartamento_id, reserva.usuario_id, reserva.fecha_inicio, reserva.fecha_fin, reserva.estado]
        );
        const nuevaReserva = { id: newReserva.lastID, ...reserva };
        console.log(`Se ha creado una nueva reserva con la ID: ${newReserva.lastID}`);
        return nuevaReserva;
    } catch (error) {
        console.error(`No se pudo crear la reserva.`, error);
    }
};

export const addImagen = async (imagen: Omit<Imagen, 'id'>): Promise<void> => {
    const db = await connectDB();
  
    // Verificar que los datos estén completos
    if (!imagen.apartamento_id || !imagen.imagen || !imagen.descripcion) {
      console.error('Faltan datos para la inserción');
      return;
    }
  
    // Verificar que la imagen esté en formato Base64 válido
    if (typeof imagen.imagen !== 'string' || imagen.imagen.length === 0) {
      console.error('La imagen no está en formato Base64 válido');
      return;
    }
  
    // Verificar si ya existe una imagen con el mismo apartamento_id, descripcion y imagen en Base64
    const imagenExistente = await db.get(`SELECT id FROM imagenes WHERE apartamento_id = ? AND imagen = ?`, 
        [imagen.apartamento_id, imagen.imagen]);
  
    if (imagenExistente) {
      console.log('Ya existe una esa imagen para ese apartamento_id en la base de datos.');
      return; // Evitamos insertar la imagen si ya existe
    }
  
    // Insertar la imagen en la base de datos
    await db.run(CONSULTAS.INSERT_IMAGEN, [imagen.apartamento_id, imagen.imagen, imagen.descripcion]);
    console.log('Imagen guardada exitosamente');
};

/* *********************************************** */
/*             Métodos para Modificar              */
/*             Apartamentos | Reservas             */
/* *********************************************** */
export const updateApartamento = async (id: Number, values: Partial<Apartamento>): Promise<void> => {
    const db = await connectDB();

    try {
        // Validar que el apartamento existe
        const existent = await db.get<Apartamento>(CONSULTAS.SELECT_APARTMENT_BY_ID, [id]);
        
        if (!existent) {
            console.log(`El apartamento con id ${id} no existe.`);
            return;
        }

        const campos: string[] = [];
        const valores: any[] = [];

        if (values.direccion) { campos.push("direccion = ?"); valores.push(values.direccion); }
        if (values.ciudad) { campos.push("ciudad = ?"); valores.push(values.ciudad); }
        if (values.pais) { campos.push("pais = ?"); valores.push(values.pais); }
        if (values.codigo_postal) { campos.push("codigo_postal = ?"); valores.push(values.codigo_postal); }
        if (values.superficie !== undefined) { campos.push("superficie = ?"); valores.push(values.superficie); }
        if (values.habitaciones !== undefined) { campos.push("habitaciones = ?"); valores.push(values.habitaciones); }
        if (values.baños !== undefined) { campos.push("baños = ?"); valores.push(values.baños); }
        if (values.precio !== undefined) { campos.push("precio = ?"); valores.push(values.precio); }
        if (values.descripcion !== undefined) { campos.push("descripcion = ?"); valores.push(values.descripcion); }
        if (values.propietario_id !== undefined) { campos.push("propietario_id = ?"); valores.push(values.propietario_id); }
        if (values.estado) {
            if (!['disponible', 'alquilado', 'reservado', 'inactivo'].includes(values.estado)) {
                console.log(`Estado inválido: ${values.estado}.`);
                return;
            }
            campos.push("estado = ?");
            valores.push(values.estado);
        }

        // Si no se proporcionó ningún campo, no se actualiza nada
        if (campos.length === 0) {
            console.log(`No hay cambios para actualizar.`);
            return;
        }

        // Agregar el ID del apartamento como último valor
        valores.push(id);

        // Generar y ejecutar la consulta de actualización
        const consultaSQL = `UPDATE apartamentos SET ${campos.join(", ")} WHERE id = ?`;

        await db.run(consultaSQL, valores);
        console.log(`Apartamento con id ${id} actualizado exitosamente.`);
    } catch (err) {
        console.error("Error al actualizar el apartamento:", err);
    }
};

export const updateReserva = async (id: number, values: Partial<Reserva>): Promise<void> => {
    const db = await connectDB();
    const campos: string[] = [];
    const valores: any[] = [];

    if (values.fecha_inicio) { campos.push('fecha_inicio = ?'); valores.push(values.fecha_inicio); }
    if (values.fecha_fin) { campos.push('fecha_fin = ?'); valores.push(values.fecha_fin); }
    if (values.estado) {
        if (!['pendiente', 'confirmado', 'cancelado', 'expirado'].includes(values.estado)) {
            console.error('Estado inválido. Debe ser "pendiente", "confirmado" o "cancelado" o "expirado".');
            return;
        }
        campos.push('estado = ?'); valores.push(values.estado);
    }

    valores.push(id);
    const consultaSQL = `UPDATE reservas SET ${campos.join(', ')} WHERE id = ?`;

    try {
        const result = await db.run(consultaSQL, valores);
        
        if (result.changes === 0) console.log(`Reserva con ID ${id} no encontrada o sin cambios.`);
        else console.log(`Reserva con ID ${id} actualizada correctamente.`);
        
    } catch (err) { console.error('Error al actualizar reserva:', err); }
};

/* *********************************************** */
/*               Métodos para Listar               */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */
export const listApartamentos = async (query?: Partial<Apartamento>): Promise<Apartamento[]> => {
    const db = await connectDB();
    const condiciones: string[] = [];
    const valores: any[] = [];

    if (query?.ciudad) { condiciones.push("ciudad = ?"); valores.push(query.ciudad); }
    if (query?.estado) { condiciones.push("estado = ?"); valores.push(query.estado); }
    if (query?.precio) { condiciones.push("precio = ?"); valores.push(query.precio); }
    if (query?.habitaciones) { condiciones.push("habitaciones = ?"); valores.push(query.habitaciones); }
    if (query?.baños) { condiciones.push("baños = ?"); valores.push(query.baños); }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    const consultaSQL = `SELECT * FROM apartamentos ${whereClause}`;

    try {
        const apartamentos = await db.all<Apartamento[]>(consultaSQL, valores);
        return apartamentos;
    } catch (err) { console.error('Error al listar apartamentos:', err); return []; }
};

export const listReservas = async (query?: Partial<Reserva>): Promise<Reserva[]> => {
    const db = await connectDB();
    const condiciones: string[] = [];
    const valores: any[] = [];

    if (query?.estado) { condiciones.push('estado = ?'); valores.push(query.estado); }
    if (query?.usuario_id) { condiciones.push('usuario_id = ?'); valores.push(query.usuario_id); }
    if (query?.apartamento_id) { condiciones.push('apartamento_id = ?'); valores.push(query.apartamento_id); }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    const consultaSQL = `SELECT * FROM reservas ${whereClause}`;

    try {
        const reservas = await db.all<Reserva[]>(consultaSQL, valores);
        return reservas;

    } catch (err) { console.error('Error al listar reservas:', err);  return []; }
};

export const listImagenes = async (apartamento_id?: number): Promise<Imagen[]> => {
    const db = await connectDB();

    let params: (number | undefined)[] = [];
    let query = `SELECT id, apartamento_id, imagen, descripcion FROM imagenes`;

    if (apartamento_id) {
      query += ` WHERE apartamento_id = ?`;
      params.push(apartamento_id);
    }
  
    // Recuperar las imágenes (con o sin filtro de apartamento_id)
    const results = await db.all(query, params);
  
    if (results.length === 0) console.log('No se encontraron imágenes');
    else console.log(`Se encontraron ${results.length} imágenes`);
    
    return results as Imagen[];
};


/* *********************************************** */
/*              Métodos para Eliminar              */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */
export const deleteApartamento = async (id: number): Promise<void | Apartamento> => {
    const db = await connectDB();
    try {
        // Validar que exista antes de eliminar
        const existent = await db.get<Apartamento>(CONSULTAS.SELECT_APARTMENT_BY_ID, [id]);

        if (!existent) return;
        
        await db.run(CONSULTAS.DELETE_APARTMENT, [id]); 
        console.log(`Apartamento con id ${id} eliminado exitosamente.`);
        
        return existent;
    } catch (err) { console.error("Error al eliminar el apartamento:", err); }
};

export const deleteReserva = async (id: number): Promise<void | Reserva> => {
    const db = await connectDB();

    try {
        // Validar que exista antes de eliminar
        const existent = await db.get<Reserva>(CONSULTAS.SELECT_RESERVA_BY_ID, [id]);

        if (!existent) {
            console.log("No existe ninguna reserva con esa ID: "+id);
            return;
        }

        await db.run(CONSULTAS.DELETE_RESERVA, [id]); 
        console.log(`Reserva con id ${id} eliminadoa exitosamente.`);
        
        return existent;
    } catch (err) { console.error("Error al eliminar la reserva:", err); }
};

export const deleteImage = async (id: number): Promise<void> => {
    const db = await connectDB();

    const result = await db.run(CONSULTAS.DELETE_IMAGEN, [id]);
  
    if (result.changes === 0) {
      console.error(`No se encontró ninguna imagen con id ${id}`);
    } else {
      console.log(`Imagen con id ${id} eliminada correctamente`);
    }
};


/* *********************************************** */
/*             Métodos para Recoger ID             */
/*       Apartamentos | Reservas | Imagenes        */
/* *********************************************** */
export const getApartamentoById = async (id: number): Promise<Apartamento | null> => {
    const db = await connectDB();

    if (!id || id <= 0) { console.log('ID de apartamento inválido'); return null; }

    try {
        const apartamento = await db.get<Apartamento>(CONSULTAS.SELECT_APARTMENT_BY_ID, [id]);
        if (!apartamento) { console.log(`Apartamento con ID ${id} no encontrado.`); return null; }

        return apartamento;
    } catch (err) {
        console.error('Error al obtener el apartamento:', err);
        return null;
    }
};

export const getReservaId = async (id: number): Promise<Reserva | null> => {
    const db = await connectDB();

    if (!id || id <= 0) { console.log('ID de la reserva inválida'); return null; }

    try {
        const reserva = await db.get<Reserva>(CONSULTAS.SELECT_RESERVA_BY_ID, [id]);
        if (!reserva) { console.log(`Reserva con ID ${id} no encontrada.`); return null; }

        return reserva;
    } catch (err) {
        console.error('Error al obtener la reserva:', err);
        return null;
    }
};

export const getImagenById = async (id: number): Promise<Imagen | null> => {
    const db = await connectDB();

    // Recuperar la imagen desde la base de datos por id
    const result = await db.get(CONSULTAS.SELECT_IMAGEN_BY_ID, [id]);
  
    if (!result) {
      console.error('Imagen no encontrada');
      return null;
    }
  
    console.log('Imagen recuperada:', result);
    return result as Imagen;
};