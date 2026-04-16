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

  if (!clientAge || Number(clientAge) < 35) {
    return res.status(400).json({
      error: "Nous sommes désolés, nos assurances exigent un âge minimum de 35 ans.",
    });
  }

  const admin = supabaseAdmin();

  const { data: car, error: carErr } = await admin
    .from('cars').select('*').eq('id', carId).single();
  if (carErr || !car) return res.status(404).json({ error: 'Véhicule introuvable' });

  const msPerDay = 1000 * 60 * 60 * 24;
  const nbDays = Math.round((new Date(endDate) - new Date(startDate)) / msPerDay) + 1;

  let finalPrice, profit;
  if (userRole === 'kouider') {
    finalPrice = car.resale_price;
    profit = car.resale_price - car.base_price;
  } else {
    finalPrice = car.base_price;
    profit = 0;
  }

  // INSERT protégé par le trigger prevent_double_booking() au niveau DB
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
      nb_days: nbDays,
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
    if (bookErr.message && bookErr.message.includes('VEHICLE_NOT_AVAILABLE')) {
      return res.status(409).json({
        error: "Ce véhicule est déjà réservé sur ces dates.",
      });
    }
    console.error('Booking error:', bookErr);
    return res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
  }

  try {
    await sendSMSNotification(booking, car);
  } catch (e) {
    console.error('SMS error (non-bloquant):', e.message);
  }

  return res.status(200).json({ success: true, booking });
}

async function sendSMSNotification(booking, car) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, PHONE_KOUIDER, PHONE_HOUARI } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return;

  const msg = `🚗 Nouvelle résa Fik Conciergerie
Client: ${booking.client_name}
Tél: ${booking.client_phone}
Véhicule: ${car.name}
Du ${booking.start_date} au ${booking.end_date}`;
  const phones = [PHONE_KOUIDER, PHONE_HOUARI].filter(Boolean);

  try {
    const twilio = await import('twilio');
    const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await Promise.all(phones.map(phone =>
      client.messages.create({ body: msg, from: TWILIO_PHONE_NUMBER, to: phone })
    ));
  } catch (e) {
    console.error('Twilio non disponible:', e.message);
  }
}
