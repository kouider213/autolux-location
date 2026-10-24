// Adresse lisible d'une voiture (24/10) : /cars/clio-4-essence-location-oran-<id> au lieu de /cars/<id>.
// Google comprend la page (nom + « location Oran » dans l'adresse) et le lien partagé sur WhatsApp se lit.
// Les anciennes adresses /cars/<id> marchent toujours : la page redirige (301) vers la nouvelle.
const UUID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function slugify(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

export function carHref(car) {
  if (!car || !car.id) return '/cars';
  const s = slugify(car.name);
  return s ? `/cars/${s}-location-oran-${car.id}` : `/cars/${car.id}`;
}

/** Paramètre d'URL (/cars/[id]) → id de la voiture (ancien format ou nouveau). */
export function carIdFromParam(param) {
  const m = String(param || '').match(UUID_RE);
  return m ? m[1] : String(param || '');
}
