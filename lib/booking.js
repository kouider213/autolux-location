import { supabase } from './supabase';

// ============================================================
// CALCUL DES PRIX selon le rôle
// ============================================================
export function calculateBookingPrice(car, userRole) {
  if (userRole === 'kouider') {
    return {
      final_price: car.resale_price,
      profit: car.resale_price - car.base_price,
    };
  }
  // Houari (propriétaire)
  return {
    final_price: car.base_price,
    profit: 0,
  };
}

// ============================================================
// VÉRIFIER DISPONIBILITÉ
// ============================================================
export async function checkAvailability(carId, startDate, endDate, excludeId = null) {
  const { data, error } = await supabase.rpc('check_car_availability', {
    p_car_id: carId,
    p_start: startDate,
    p_end: endDate,
    p_exclude_id: excludeId,
  });

  if (error) {
    console.error('Erreur vérification disponibilité:', error);
    return false;
  }
  return data; // true = disponible
}

// ============================================================
// CRÉER UNE RÉSERVATION
// ============================================================
export async function createBooking(bookingData) {
  const { carId, userId, userRole, clientInfo, startDate, endDate } = bookingData;

  // 1. Vérifier l'âge
  if (clientInfo.age < 35) {
    return {
      success: false,
      error: "Nous sommes désolés, nos assurances exigent un âge minimum de 35 ans.",
    };
  }

  // 2. Récupérer la voiture
  const { data: car, error: carError } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .single();

  if (carError || !car) {
    return { success: false, error: "Véhicule introuvable." };
  }

  // 3. Vérifier disponibilité
  const available = await checkAvailability(carId, startDate, endDate);
  if (!available) {
    return {
      success: false,
      error: "Ce véhicule est déjà réservé sur ces dates.",
    };
  }

  // 4. Calculer les prix
  const pricing = calculateBookingPrice(car, userRole || 'public');

  // 5. Créer la réservation
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert([{
      car_id: carId,
      user_id: userId || null,
      client_name: clientInfo.name,
      client_email: clientInfo.email,
      client_phone: clientInfo.phone,
      client_age: clientInfo.age,
      client_passport: clientInfo.passport || null,
      start_date: startDate,
      end_date: endDate,
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
    return {
      totalRevenue,
      totalProfit,
      totalBookings: bookings.length,
      pendingBookings: pending.length,
      acceptedBookings: accepted.length,
      bookings,
    };
  }

  // Houari
  const totalRevenue = accepted.reduce((sum, b) => sum + Number(b.base_price_snapshot) * b.nb_days, 0);
  return {
    totalRevenue,
    totalProfit: 0,
    totalBookings: bookings.length,
    pendingBookings: pending.length,
    acceptedBookings: accepted.length,
    bookings,
  };
}

// ============================================================
// GÉNÉRER MESSAGE WHATSAPP
// ============================================================
export function generateWhatsAppMessage(booking, car) {
  const msg = `🚗 *Nouvelle Réservation*\n\n*Véhicule:* ${car?.name}\n*Client:* ${booking.client_name}\n*Tél:* ${booking.client_phone}\n*Dates:* ${booking.start_date} → ${booking.end_date}\n*Jours:* ${booking.nb_days}\n*Prix total:* ${(booking.final_price * booking.nb_days).toFixed(0)} DA\n\n_Réservation en attente de confirmation._`;
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '213XXXXXXXXX';
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// ============================================================
// NOMBRE DE JOURS entre deux dates
// ============================================================
export function calcDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}
