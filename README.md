# Gestión de Apartamentos y Reservas

Este proyecto consiste en una API que permite gestionar apartamentos y reservas para una plataforma de alquiler de apartamentos vacacionales. Se utiliza SQLite como base de datos para almacenar la información sobre los apartamentos y las reservas.

## Endpoints

### Apartamentos

1. **Crear Apartamento**  
   `POST /apartamentos/add`  
   Registra un nuevo apartamento en la base de datos.

   **Cuerpo (Body)**:
   ```json
   {
     "direccion": "Avenida Libertad 45",
     "ciudad": "Barcelona",
     "pais": "España",
     "codigo_postal": "08012",
     "superficie": 95,
     "habitaciones": 4,
     "baños": 3,
     "precio": 1500,
     "estado": "disponible",
     "descripcion": "Gran Apartamento en el centro",
     "propietario_id": 2
   }

2. **Listar Apartamentos**  
   `GET /apartamentos`  
   Obtiene todos los apartamentos disponibles, con filtros opcionales.
   La lógica que hemos implementado para nuestros métodos únicamente permite utilizar el operador '='

   **Parámetros de consulta (Query Parameters)**:
   - `ciudad` : Filtra los apartamentos por ciudad. Ejemplo: `ciudad=Barcelona`.
   - `estado` : Filtra los apartamentos por estado. Ejemplo: `estado=disponible`.
   - `precio` : Filtra los apartamentos cuyo precio sea menor o igual al valor especificado. Ejemplo: `precio=2000`.
   - `habitaciones` : Filtra los apartamentos con al menos el número de habitaciones especificado. Ejemplo: `habitaciones=3`.
   - `baños` : Filtra los apartamentos con al menos el número de baños especificado. Ejemplo: `baños=2`.

   **Ejemplo de solicitud**:
   ```text
   GET /apartamentos?ciudad=Barcelona&estado=disponible&precio=2000
   ```

3. **Actualizar Apartamento**  
   `PUT /apartamentos/:id`  
   Actualiza los datos de un apartamento específico.

   **Parámetros de ruta (Path Parameters)**:
   - `id` (obligatorio): El ID del apartamento que deseas actualizar.

   **Cuerpo (Body)**:
   Los campos que puedes actualizar incluyen cualquiera de los siguientes:

   - `direccion` : Nueva dirección del apartamento.
   - `ciudad` : Nueva ciudad del apartamento.
   - `pais` : Nuevo país del apartamento.
   - `codigo_postal` : Nuevo código postal del apartamento.
   - `superficie` : Nueva superficie del apartamento en metros cuadrados.
   - `habitaciones` : Nuevas habitaciones del apartamento.
   - `baños` : Nuevos baños del apartamento.
   - `precio` : Nuevo precio del apartamento.
   - `estado` : Nuevo estado del apartamento. Puede ser `disponible`, `alquilado`, `reservado`, o `inactivo`.
   - `descripcion` : Nueva descripción para el apartamento.
   - `propietario_id` : Nuevo ID del propietario del apartamento.

   **Ejemplo de solicitud**:

   ```text
   PUT /apartamentos/1
   ```

   ```json
   {
     "direccion": "Carrer de Pau Claris 99",
     "precio": 1700,
     "estado": "alquilado"
   }
4. **Eliminar Apartamento**  
   `DELETE /apartamentos/:id`  
   Elimina un apartamento de la base de datos mediante su ID.

   **Parámetros de ruta**:
   - `id` : El ID del apartamento que deseas eliminar.
  
   **Recomendaciones**:
   - Evitar eliminar información referente a los apartamentos. Siempre será mejor colocarlo como `inactivo` con un `update`.
   - Solamente eliminar algún apartamento cuando ya no sea necesario o no haya más opciones.

### Reservas
1. **Añadir Reserva**  
   `POST /reservas/add`  
   Crea una nueva reserva para un apartamento.

   **Cuerpo (Body)**:
   - `apartamento_id` : El ID del apartamento que se va a reservar.
   - `usuario_id` : El ID del usuario que realiza la reserva.
   - `fecha_inicio` : La fecha de inicio de la reserva (formato: `YYYY-MM-DD`).
   - `fecha_fin` : La fecha de fin de la reserva (formato: `YYYY-MM-DD`).
   - `estado` : El estado de la reserva. Puede ser `pendiente`, `confirmado`, `cancelado` o `expirado`.

   **Ejemplo de solicitud**:

   ```text
   POST /reservas
   ```

   ```json
   {
     "apartamento_id": 1,
     "usuario_id": 2,
     "fecha_inicio": "2024-12-01",
     "fecha_fin": "2024-12-10",
     "estado": "pendiente"
   }
2. **Listar Reservas**  
   `GET /reservas`  
   Obtiene todas las reservas existentes, con filtros opcionales.

   **Parámetros de consulta**:
   - `estado` : Filtra las reservas por estado. Ejemplo: `estado=confirmado`.
   - `usuario_id` : Filtra las reservas por ID de usuario. Ejemplo: `usuario_id=2`.
   - `apartamento_id` : Filtra las reservas por ID de apartamento. Ejemplo: `apartamento_id=1`.
  
    **Ejemplo de solicitud**:
    ```text
    GET /reservas?estado=pendiente&usuario_id=2
    ```
3. **Eliminar Reserva**  
   `DELETE /reservas/:id`  
   Elimina una reserva específica mediante su ID.

   **Parámetros de ruta**:
   - `id` : El ID de la reserva que deseas eliminar.

   **Ejemplo de solicitud**:
   ```text
   DELETE /reservas/1
   ```
   **Recomendaciones**:
   - Evitar eliminar información referente a las reservas. Siempre será mejor colocarla como `expirado` con un `update`.
   - Solamente eliminar alguna reserva cuando ya no sea necesaria o no haya más opciones.

4. **Actualizar Reserva**  
   `PUT /reservas/:id`  
   Actualiza los datos de una reserva específica mediante su ID.

   **Parámetros de ruta (Path Parameters)**:
   - `id` : El ID de la reserva que deseas actualizar.

   **Cuerpo (Body)**:
   Los campos que puedes actualizar incluyen cualquiera de los siguientes:

   - `fecha_inicio` : Nueva fecha de inicio de la reserva.
   - `fecha_fin` : Nueva fecha de fin de la reserva.
   - `estado` : Nuevo estado de la reserva. Puede ser `pendiente`, `confirmado`, `cancelado` o `expirado`.

   **Ejemplo de solicitud**:

   ```text
   PUT /reservas/1
   ```

   ```json
   {
     "fecha_inicio": "2024-12-05",
     "fecha_fin": "2024-12-12",
     "estado": "confirmado"
   }
   ```
### Imagenes
1. **Añadir Imagen**  
   `POST /apartamentos/:apartamento_id/imagenes`  
   Crea una nueva reserva para un apartamento.

   **Parámetros de ruta**:
   - `apartamento_id` : El ID del apartamento donde queremos agregar la nueva imagen.
  
   **Cuerpo (Body)**:
   - `imagen` : La imagen que queremos subir en String, formato base64.
   - `descripcion` : La descripción de la imagen.

   **Ejemplo de solicitud**:

   ```text
   POST /apartamentos/1/imagenes
   ```

   ```json
   {
     "imagen": "321asd4AAQSkZJRgABAQAAAQABAA",
     "descripcion": "Imagen de prueba para apartamento 1"
   }
2. **Listar Imágenes**  
   `GET /apartamentos/:apartamento_id/imagenes`  
   Obtiene todas las imagenes de un apartamento existentes, con filtros opcionales.

   **Parámetros de ruta**:
   - `apartamento_id` : El ID del apartamento del cual queremos listar las imágenes.
  
    **Ejemplo de solicitud**:
    ```text
    GET /apartamentos/2/imagenes
    ```
3. **Eliminar Imagen**  
   `DELETE /apartamentos/:apartamento_id/imagenes/:imagen_id`  
   Elimina una reserva específica mediante su ID.

   **Parámetros de ruta**:
   - `apartamento_id` : El ID del apartamento que contiene la imagen que quieres eliminar.
   - `imagen_id` : El ID de la imagen que quieres eliminar.

   **Ejemplo de solicitud**:
   ```text
   DELETE /apartamentos/1/imagenes/1
   ```
   