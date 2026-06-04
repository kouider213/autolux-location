// Helper d'upload photo partagé (admin voitures / immo / véhicules à vendre).
// - Convertit en JPEG via canvas → gère les HEIC iPhone (qui causaient
//   "The string did not match the expected pattern") + compresse.
// - Permet la sélection multiple (boucle sur tous les fichiers).

// Convertit un fichier image (y compris HEIC iPhone) en base64 JPEG, redimensionné.
export function fileToJpegBase64(file, maxDim = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (!width || !height) { reject(new Error('Image vide')); return; }
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl.split(',')[1]);
      } catch (e) {
        reject(new Error('Conversion impossible'));
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible (format non supporté)')); };
    img.src = url;
  });
}

// Upload un fichier vers /api/upload-car-image. Retourne l'URL publique.
export async function uploadImageFile(file) {
  const base64 = await fileToJpegBase64(file);
  const r = await fetch('/api/upload-car-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, fileName: 'photo.jpg', mimeType: 'image/jpeg' }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Erreur serveur');
  return data.url;
}
