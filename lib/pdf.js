// GÃ©nÃ©rateur PDF cÃ´tÃ© client avec jsPDF
// Usage: generateContract(booking, car) â tÃ©lÃ©charge le PDF

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
  doc.text('CONTRAT DE LOCATION DE VÃHICULE', pageWidth / 2, 28, { align: 'center' });
  doc.text(`NÂ° ${booking.id?.substring(0, 8).toUpperCase()}`, pageWidth / 2, 36, { align: 'center' });

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
      ['Nom complet', booking.client_name || 'â'],
      ['TÃ©lÃ©phone', booking.client_phone || 'â'],
      ['Email', booking.client_email || 'â'],
      ['Ãge', `${booking.client_age} ans`],
      ['NÂ° Passeport', booking.client_passport || 'â'],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 50 },
    },
    theme: 'plain',
  });

  const y1 = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('DÃTAILS DU VÃHICULE', 14, y1);
  doc.line(14, y1 + 2, pageWidth - 14, y1 + 2);

  autoTable(doc, {
    startY: y1 + 6,
    head: [],
    body: [
      ['VÃ©hicule', car?.name || 'â'],
      ['Date de dÃ©but', booking.start_date],
      ['Date de fin', booking.end_date],
      ['DurÃ©e', `${booking.nb_days} jour(s)`],
      ['Prix / jour', `${booking.final_price} â¬`],
      ['TOTAL', `${(booking.final_price * booking.nb_days).toFixed(0)} â¬`],
    ],
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
    'â¢ Ãge minimum : 35 ans et plus',
    'â¢ Pas de caution demandÃ©e',
    'â¢ Passeport conservÃ© pendant la location et restituÃ© Ã  la fin',
    'â¢ Un acompte est demandÃ© pour bloquer le vÃ©hicule',
    'â¢ Le vÃ©hicule doit Ãªtre restituÃ© dans le mÃªme Ã©tat',
    'â¢ Tout dommage sera Ã  la charge du locataire',
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
    'Fik Conciergerie â Document gÃ©nÃ©rÃ© automatiquement',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 5,
    { align: 'center' }
  );

  doc.save(`Contrat_${booking.client_name}_${booking.start_date}.pdf`);
}
