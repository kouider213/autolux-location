import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const {
    carId, userId, userRole,
    clientName, clientPhone, clientEmail,
    clientAge, clientPassport, notes,
    startDate, endDate,
  } = req.body;

  // ── Validation âge ──
  if (!clientAge || Number(clientAge) < 35) {
    return res.status(400).json({
      error: "Nous sommes désolés, nos assurances exigent un âge minimum de 35 ans.",
    });
  }

  const admin = supabaseAdmin();

  // ── Récupérer la voiture ──
  const { data: car, error: carErr } = await admin
    .from('cars').select('*').eq('id', carId).single();
  if (carErr || !car) return res.status(404).json({ error: 'Véhicule introuvable' });

  // ── Vérifier disponibilité ──
  const { data: available } = await admin.rpc('check_car_availability', {
    p_car_id: carId,
    p_start: startDate,
    p_end: endDate,
  });

  if (!available) {
    return res.status(409).json({
      error: "Ce véhicule est déjà réservé sur ces dates.",
    });
  }

  // ── Calculer prix selon rôle ──
  let finalPrice, profit;
  if (userRole === 'kouider') {
    finalPrice = car.resale_price;
    profit = car.resale_price - car.base_price;
  } else {
    finalPrice = car.base_price;
    profit = 0;
  }

  // ── Créer la réservation ──
  const { data: booking, error: bookErr } = await admin
    .from('bookings')
    .insert([{
      car_id: carId,
      user_id: userId || null,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail || null,
      client_age: Number(clientAge),
      client_passport: clientPassport || null,
      start_date: startDate,
      end_date: endDate,
      base_price_snapshot: car.base_price,
      resale_price_snapshot: car.resale_price,
      final_price: finalPrice,
      profit: profit,
      notes: notes || null,
      status: 'PENDING',
    }])
    .select()
    .single();

  if (bookErr) {
    console.error('Booking error:', bookErr);
    return res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
  }

  // ── Notification SMS (Twilio) ──
  try {
    await sendSMSNotification(booking, car);
  } catch (e) {
    console.error('SMS error (non-bloquant):', e.message);
  }

  return res.status(200).json({ success: true, booking });
}

// ── Helper SMS ──
async function sendSMSNotification(booking, car) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, PHONE_KOUIDER, PHONE_HOUARI } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return;

  const msg = `🚗 Nouvelle résa AutoLux\nClient: ${booking.client_name}\nTél: ${booking.client_phone}\nVéhicule: ${car.name}\nDu ${booking.start_date} au ${booking.end_date}`;

  const phones = [PHONE_KOUIDER, PHONE_HOUARI].filter(Boolean);
  const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  await Promise.all(phones.map(phone =>
    client.messages.create({ body: msg, from: TWILIO_PHONE_NUMBER, to: phone })
  ));
}
