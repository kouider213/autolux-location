import { supabase } from './supabase';
import { toYMD, daysBetween } from './date';

// ============================================================
// CALCUL DES PRIX selon le rôle
// ============================================================
export function calculateBookingPrice(car, userRole) {
  if (userRole === 'kouider') {
    return {
      final_price: Number(car.resale_price),
      profit: Number(car.resale_price) - Number(car.base_price),
    };
  }
  return {
    final_price: Number(car.base_price),
    profit: 0,
  };
}

// ============================================================
// NORMALISE une date en 'YYYY-MM-DD'
// ============================================================
function normalizeDate(d) {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  return toYMD(d);
}

// ============================================================
// VÉRIFIER DISPONIBILITÉ (RPC Supabase)
// ============================================================
export async function checkAvailability(carId, startDate, endDate, excludeId = null) {
  const { data, error } = await supabase.rpc('check_car_availability', {
    p_car_id: carId,
    p_start: normalizeDate(startDate),
    p_end: normalizeDate(endDate),
    p_exclude_id: excludeId,
  });
  if (error) {
    console.error('Erreur vérification disponibilité:', error);
    return false;
  }
  return data;
}

// ============================================================
// CRÉER UNE RÉSERVATION — passage OBLIGATOIRE par cette fonction
// ============================================================
export async function createBooking(bookingData) {
  const { carId, userId, userRole, clientInfo, startDate, endDate } = bookingData;

  if (!clientInfo || Number(clientInfo.age) < 35) {
    return { success: false, error: "Nos assurances exigent un âge minimum de 35 ans." };
  }

  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  if (!start || !end || daysBetween(start, end) < 1) {
    return { success: false, error: "Dates invalides." };
  }

  const { data: car, error: carError } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .single();
  if (carError || !car) {
    return { success: false, error: "Véhicule introuvable." };
  }

  const available = await checkAvailability(carId, start, end);
  if (!available) {
    return { success: false, error: "Ce véhicule est déjà réservé sur ces dates." };
  }

  const pricing = calculateBookingPrice(car, userRole || 'public');

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert([{
      car_id: carId,
      user_id: userId || null,
      client_name: clientInfo.name,
      client_email: clientInfo.email || null,
      client_phone: clientInfo.phone,
      client_age: Number(clientInfo.age),
      client_passport: clientInfo.passport || null,
      start_date: start,
      end_date: end,
      base_price_snapshot: car.base_price,
      resale_price_snapshot: car.resale_price,
      final_price: pricing.final_price,
      profit: pricing.profit,
      status: 'PENDING',
      notes: clientInfo.notes || null,
    }])
    .select()
    .single();

  if (bookingError) {
    console.error('Booking insert error:', bookingError);
    return { success: false, error: bookingError.message };
  }

  return { success: true, booking };
}

// ============================================================
// STATISTIQUES DASHBOARD
// ============================================================
export async function getDashboardStats(userRole) {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, cars(name)')
    .order('created_at', { ascending: false });

  if (error) return null;

  const accepted = bookings.filter(b => b.status === 'ACCEPTED');
  const pending = bookings.filter(b => b.status === 'PENDING');

  if (userRole === 'kouider') {
    const totalRevenue = accepted.reduce((sum, b) => sum + Number(b.final_price) * b.nb_days, 0);
    const totalProfit = accepted.reduce((sum, b) => sum + Number(b.profit) * b.nb_days, 0);
    return { totalRevenue, totalProfit, totalBookings: bookings.length, pendingBookings: pending.length, acceptedBookings: accepted.length, bookings };
  }

  const totalRevenue = accepted.reduce((sum, b) => sum + Number(b.base_price_snapshot) * b.nb_days, 0);
  return { totalRevenue, totalProfit: 0, totalBookings: bookings.length, pendingBookings: pending.length, acceptedBookings: accepted.length, bookings };
}

// ============================================================
// MESSAGE WHATSAPP
// ============================================================
export function generateWhatsAppMessage(booking, car) {
  const msg = `🚗 *Nouvelle Réservation*\n\n*Véhicule:* ${car?.name}\n*Client:* ${booking.client_name}\n*Tél:* ${booking.client_phone}\n*Dates:* ${booking.start_date} → ${booking.end_date}\n*Jours:* ${booking.nb_days}\n*Prix total:* ${(booking.final_price * booking.nb_days).toFixed(0)} DA\n\n_Réservation en attente de confirmation._`;
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '213XXXXXXXXX';
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// ============================================================
// NOMBRE DE JOURS
// ============================================================
export function calcDays(startDate, endDate) {
  return daysBetween(startDate, endDate);
}
