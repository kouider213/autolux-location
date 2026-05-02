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

/**
 * Retourne le nombre de jours entre deux dates.
 * Fallback : nb_days stocké en base.
 */
function calcNbDays(b) {
  if (b.nb_days && Number(b.nb_days) > 0) return Number(b.nb_days);
  if (b.start_date && b.end_date) {
    const diff = new Date(b.end_date) - new Date(b.start_date);
    const d = Math.round(diff / (1000 * 60 * 60 * 24));
    return d > 0 ? d : 1;
  }
  return 1;
}

/**
 * Prix que le client paie par jour.
 * Priorité : resale_price_snapshot → cars.resale_price → final_price
 */
function getPrixClientJour(b) {
  return Number(b.resale_price_snapshot || b.cars?.resale_price || b.final_price || 0);
}

/**
 * Prix que Kouider paye à Houari par jour.
 * Priorité : base_price_snapshot → cars.base_price
 */
function getPrixHouariJour(b) {
  return Number(b.base_price_snapshot || b.cars?.base_price || 0);
}

export async function getDashboardStats(userRole) {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, cars(name, base_price, resale_price)')
    .order('created_at', { ascending: false });

  if (error) return null;

  const accepted = bookings.filter(b => ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'ACCEPTED'].includes(b.status));
  const pending  = bookings.filter(b => b.status === 'PENDING');

  // ── Règle absolue : CA total = Part Houari + Bénéfice Kouider ──────────
  // Pour chaque réservation :
  //   total_client  = final_price (stocké comme total, pas prix/jour)
  //   total_houari  = prix_houari_jour × nb_jours
  //   benefice_kouider = total_client - total_houari
  // ────────────────────────────────────────────────────────────────────────

  // CA total = somme des final_price (déjà des totaux en base)
  const totalRevenue = accepted.reduce((sum, b) => {
    return sum + Number(b.final_price || 0);
  }, 0);

  // Part Houari = prix_houari_jour × nb_jours
  const houariRevenue = accepted.reduce((sum, b) => {
    return sum + getPrixHouariJour(b) * calcNbDays(b);
  }, 0);

  // Bénéfice Kouider = CA total - Part Houari (toujours égaux ensemble)
  const kouiderProfit = totalRevenue - houariRevenue;

  // Contrôle automatique
  const checkSum = houariRevenue + kouiderProfit;
  if (Math.abs(checkSum - totalRevenue) > 0.01) {
    console.error(`Erreur calcul financier : les parts ne correspondent pas au CA total. CA=${totalRevenue} | Houari=${houariRevenue} | Kouider=${kouiderProfit} | Somme=${checkSum}`);
  }

  return {
    totalRevenue,
    houariRevenue,
    kouiderProfit,
    totalProfit: kouiderProfit, // alias legacy
    totalBookings:    bookings.length,
    pendingBookings:  pending.length,
    acceptedBookings: accepted.length,
    bookings,
  };
}

// ============================================================
// VALIDATION PRIX — sécurité prix_client >= prix_houari
// ============================================================
export function validatePricing(prixClientJour, prixHouariJour) {
  if (Number(prixClientJour) < Number(prixHouariJour)) {
    return {
      valid: false,
      error: 'Le prix client ne peut pas être inférieur au prix propriétaire.',
    };
  }
  return { valid: true };
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
