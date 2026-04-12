import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
        }

          const { bookingId, status } = req.body;

            if (!bookingId || !status) {
                return res.status(400).json({ error: 'bookingId and status are required' });
                  }

                    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
                      if (!validStatuses.includes(status)) {
                          return res.status(400).json({ error: 'Invalid status value' });
                            }

                              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                                const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                                  const supabase = createClient(supabaseUrl, supabaseServiceKey);

                                    const { error } = await supabase
                                        .from('bookings')
                                            .update({ status })
                                                .eq('id', bookingId);

                                                  if (error) {
                                                      console.error('Supabase update error:', error);
                                                          return res.status(500).json({ error: error.message });
                                                            }

                                                              return res.status(200).json({ success: true });
                                                              }