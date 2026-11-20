/**
 * Shared domain types used by the dashboard pages.
 * Field names match what the SalonBook API returns.
 */

export type UserRole = 'customer' | 'admin';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  image?: string | null;
  role?: UserRole | string;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  _id?: string;
  id?: string;
  serviceName: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  image?: string;
  status?: 'active' | 'inactive';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Appointment {
  _id: string;
  customerId: User | string;
  serviceId: Service | string;
  appointmentDate: string;
  timeSlot: string;
  servicePrice: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  message?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalSuccessfulPayments: number;
  totalRevenue: number;
}
