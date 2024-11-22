export interface Apartamento {
    id?: number;
    direccion: string;
    ciudad: string;
    pais: string;
    codigo_postal: string;
    superficie: number;
    habitaciones: number;
    baños: number;
    precio: number;
    estado: 'disponible' | 'alquilado' | 'reservado';
    propietario_id: number;
  }
    
