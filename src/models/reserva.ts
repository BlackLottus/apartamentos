export interface Reserva {
  id?: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'expirado';
  usuario_id: number;
  apartamento_id: number;
}
