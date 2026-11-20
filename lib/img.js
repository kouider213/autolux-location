// Photos Supabase servies en taille d'écran (webp auto si le navigateur l'accepte) au lieu de l'original :
// accueil 3,2 Mo → ~0,7 Mo, et beaucoup moins de quota Supabase consommé. Toute autre adresse est rendue telle quelle.
export function thumb(url, width = 800, quality = 70) {
  if (!url || typeof url !== 'string') return url;
  const m = url.match(/^(https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1)\/object\/public\/([^?#]+)$/);
  return m ? `${m[1]}/render/image/public/${m[2]}?width=${width}&quality=${quality}` : url;
}
