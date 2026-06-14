-- Machine à avis : marque l'envoi automatique de la demande d'avis Google
-- (cron /api/cron/review-request, le lendemain de la fin de location, une seule fois).
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMPTZ;
