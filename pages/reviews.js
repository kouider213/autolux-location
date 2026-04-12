export default function Reviews({ reviews = [] }) {
  return (
    <div style={{background:'#111',minHeight:'100vh',color:'white',padding:'40px'}}>
      <h1>Avis clients ({reviews.length})</h1>
      {reviews.map((r,i) => (
        <div key={i} style={{margin:'20px 0',padding:'20px',background:'#222',borderRadius:'12px'}}>
          <strong>{r.client_name}</strong> — {'★'.repeat(r.rating||5)}
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data } = await sb.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false });
    return { props: { reviews: data || [] } };
  } catch(e) {
    return { props: { reviews: [], error: e.message } };
  }
}
