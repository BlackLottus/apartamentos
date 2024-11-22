import { createApartment, deleteApartamento, updateApartamento, listApartamentos } from '../dist/index.js';

(async () => {

    // Crear Usuarios
    console.log("Pruebas de Apartamentos:");
    await createApartment({ nombre: 'AlexPropietario', apellido: '4', email: 'alejandro.propietario@example.com', 
        dni: '20096777A', nick: 'AlexPropietario', password: '1234', rol: 'propietario' });  

    console.log("Pruebas de Login:");
    // Login User
    const usuario = await login("alejandro.pastor1@example.com","1234");
    const token = usuario.token;
    console.table(usuario);
    
    // UPDATE
    const updatedData = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez Gómez',
        email: 'juan.carlos@example.com',
        dni: '98765432',
        nick: 'juancarlos',
        password: 'newpassword123',
        rol: 'admin',
        fecha_creacion: new Date().toISOString()
      };

      console.log("ANTES: ");
      console.log(usuario)
      await updateUser(usuario, updatedData, token);
      const updatedUser = await login('juan.carlos@example.com', "newpassword123");
      console.log("DESPUÉS: ");
      console.log(updatedUser)

    // List Users
    console.log("Pruebas de List:");
    const users = await listUsers(token);
    console.log("Todos los usuarios:");
    console.table(users);
    
    
    for (const u of users) {
        await deleteUser(u, token); // Elimino todos los usuarios.
        console.log("Eliminado usuario con ID "+u.id+".")
    }
    
})();
