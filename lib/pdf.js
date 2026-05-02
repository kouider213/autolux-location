// Générateur PDF côté client avec jsPDF
// Usage: generateContract(booking, car) → télécharge le PDF

export async function generateContract(booking, car) {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(226, 182, 20);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FIK CONCIERGERIE', pageWidth / 2, 18, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CONTRAT DE LOCATION DE VÉHICULE', pageWidth / 2, 28, { align: 'center' });
  doc.text(`N° ${booking.id?.substring(0, 8).toUpperCase()}`, pageWidth / 2, 36, { align: 'center' });

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS CLIENT', 14, 54);
  
  doc.setDrawColor(226, 182, 20);
  doc.setLineWidth(0.5);
  doc.line(14, 56, pageWidth - 14, 56);

  autoTable(doc, {
    startY: 60,
    head: [],
    body: [
      ['Nom complet', booking.client_name || '—'],
      ['Téléphone', booking.client_phone || '—'],
      ['Email', booking.client_email || '—'],
      ['Âge', `${booking.client_age} ans`],
      ['N° Passeport', booking.client_passport || '—'],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 50 },
    },
    theme: 'plain',
  });

  const y1 = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DU VÉHICULE', 14, y1);
  doc.line(14, y1 + 2, pageWidth - 14, y1 + 2);

  autoTable(doc, {
    startY: y1 + 6,
    head: [],
    body: (() => {
      // Calcul jours
      let nbDays = Number(booking.nb_days) || 1;
      if (!nbDays && booking.start_date && booking.end_date) {
        const diff = new Date(booking.end_date) - new Date(booking.start_date);
        nbDays = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
      }
      // Prix client/jour (resale_price en priorité)
      const prixJour = Number(
        booking.resale_price_snapshot ||
        car?.resale_price ||
        booking.final_price ||
        0
      );
      // Total = prix_client_jour × jours
      // Si final_price est déjà le total (>= prixJour × jours × 0.9), on l'utilise
      const totalCalc = Number(booking.final_price || 0);
      const totalFinal = totalCalc >= prixJour * nbDays * 0.9
        ? totalCalc.toFixed(0)
        : (prixJour * nbDays).toFixed(0);

      return [
        ['Véhicule',       car?.name || '—'],
        ['Date de début',  booking.start_date || '—'],
        ['Date de fin',    booking.end_date   || '—'],
        ['Durée',         `${nbDays} jour(s)`],
        ['Prix client / jour', `${prixJour} €`],
        ['TOTAL CLIENT',   `${totalFinal} €`],
      ];
    })(),
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 50 },
    },
    bodyStyles: {},
    didParseCell: (data) => {
      if (data.row.index === 5) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 182, 20];
        data.cell.styles.textColor = [20, 20, 20];
      }
    },
    theme: 'plain',
  });

  const y2 = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE LOCATION', 14, y2);
  doc.line(14, y2 + 2, pageWidth - 14, y2 + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const conditions = [
    '• Âge minimum : 35 ans et plus',
    '• Pas de caution demandée',
    '• Passeport conservé pendant la location et restitué à la fin',
    '• Un acompte est demandé pour bloquer le véhicule',
    '• Le véhicule doit être restitué dans le même état',
    '• Tout dommage sera à la charge du locataire',
  ];
  
  conditions.forEach((line, i) => {
    doc.text(line, 14, y2 + 10 + (i * 7));
  });

  const y3 = y2 + 10 + (conditions.length * 7) + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Signature du locataire :', 14, y3);
  doc.text('Signature du loueur :', pageWidth / 2 + 5, y3);
  doc.rect(14, y3 + 4, 70, 25);
  doc.rect(pageWidth / 2 + 5, y3 + 4, 70, 25);

  doc.setFillColor(20, 20, 20);
  doc.rect(0, doc.internal.pageSize.getHeight() - 15, pageWidth, 15, 'F');
  doc.setTextColor(226, 182, 20);
  doc.setFontSize(8);
  doc.text(
    'Fik Conciergerie — Document généré automatiquement',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 5,
    { align: 'center' }
  );

  doc.save(`Contrat_${booking.client_name}_${booking.start_date}.pdf`);
}
