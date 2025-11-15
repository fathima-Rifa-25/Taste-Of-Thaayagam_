import { jsPDF } from 'jspdf';
import Chart from 'chart.js/auto';
import autoTable from 'jspdf-autotable';

// autoTable is used now for neat tables; legacy addTable removed.

function buildSummary(users) {
  const total = users.length;
  const emails = users.filter(u => u.email).length;
  const phones = users.filter(u => u.phone).length;
  const withFirstLast = users.filter(u => u.firstName || u.lastName).length;
  const uniqueDomains = new Set(users.map(u => (u.email || '').split('@')[1]).filter(Boolean)).size;

  return [
    `Total users: ${total}`,
    `Users with email: ${emails}`,
    `Users with phone: ${phones}`,
    `Users with first/last name: ${withFirstLast}`,
    `Unique email domains: ${uniqueDomains}`,
  ];
}

function createChartImage(type, labels, data, options = {}) {
  // create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');

  return new Promise((resolve) => {
  const chart = new Chart(ctx, {
      type,
      data: { labels, datasets: [{ data, backgroundColor: ['#4aa3ff', '#1fa653', '#ff8a65', '#ffd54f', '#9c27b0'] }] },
      options: Object.assign({ responsive: false, animation: false, plugins: { legend: { display: true } } }, options),
    });

    // allow chart to render
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      // destroy chart to free memory
      chart.destroy();
      resolve(dataUrl);
    }, 50);
  });
}

export async function generateUsersPDF(users) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const rows = users.map(u => ({
    firstName: u.firstName || (u.name ? u.name.split(' ')[0] : ''),
    lastName: u.lastName || (u.name ? u.name.split(' ').slice(1).join(' ') : ''),
    email: u.email || '',
    phone: u.phone || '',
  }));
  // Page 1 - Table using autoTable for a neat layout
  doc.setFontSize(14);
  doc.text('Users Report', 40, 40);

  const tableBody = rows.map(r => [r.firstName, r.lastName, r.email, r.phone]);
  autoTable(doc, {
    startY: 70,
    head: [[ 'First Name', 'Last Name', 'Email', 'Phone' ]],
    body: tableBody,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: '#f2f2f2', textColor: '#000', halign: 'center' },
    alternateRowStyles: { fillColor: '#fbfbfb' },
    margin: { left: 40, right: 40 },
  });

  // Summary (5 lines) after the table
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200;
  const summary = buildSummary(users);
  doc.setFontSize(11);
  doc.text('Summary:', 40, finalY);
  doc.setFontSize(10);
  summary.forEach((line, i) => doc.text(line, 60, finalY + 18 + i * 14));

  // Page 2 - Charts
  doc.addPage();
  doc.setFontSize(12);
  doc.text('Charts', 40, 40);

  // Prepare chart data: simple breakdowns
  // Example pie: users by presence of email/phone
  const hasEmail = users.filter(u => u.email).length;
  const hasPhone = users.filter(u => u.phone).length;

  const pieLabels = ['Has Email', 'Has Phone', 'Both/None'];
  // Show counts: hasEmail, hasPhone, others
  const both = users.filter(u => u.email && u.phone).length;
  const pieData = [hasEmail - both, hasPhone - both, both];

  // Example bar: users per top 5 email domains
  const domains = users.map(u => (u.email || '').split('@')[1]).filter(Boolean);
  const domainCounts = domains.reduce((acc, d) => { acc[d] = (acc[d] || 0) + 1; return acc; }, {});
  const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const barLabels = topDomains.map(d => d[0] || 'unknown');
  const barData = topDomains.map(d => d[1]);

  const pieImg = await createChartImage('pie', pieLabels, pieData);
  const barImg = await createChartImage('bar', barLabels.length ? barLabels : ['No data'], barLabels.length ? barData : [0]);

  // place images on page 2: pie above bar (stacked)
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const imgMaxW = pageWidth - margin * 2;
  const pieH = 200;
  const barH = 200;

  doc.addImage(pieImg, 'PNG', margin, 70, imgMaxW, pieH);
  doc.addImage(barImg, 'PNG', margin, 70 + pieH + 20, imgMaxW, barH);

  doc.save('users_report.pdf');
}

// Keep other exporters simple (table + placeholder)
export async function generateItemsPDF(items) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const rows = items.map(i => ({ name: i.name || '', category: i.category || '', price: i.price || '' }));

  doc.text('Items Report', 40, 40);
  const tableBody = rows.map(r => [r.name, r.category, String(r.price)]);
  autoTable(doc, {
    startY: 70,
    head: [['Name', 'Category', 'Price']],
    body: tableBody,
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: 40, right: 40 },
  });

  // simple summary
  const total = items.length;
  const byCategory = rows.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {});
  const summary = [`Total items: ${total}`, `Categories: ${Object.keys(byCategory).length}`];
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200;
  doc.setFontSize(11);
  doc.text('Summary:', 40, finalY);
  doc.setFontSize(10);
  summary.forEach((s, i) => doc.text(s, 60, finalY + 18 + i * 14));

  // charts page
  doc.addPage();
  doc.text('Charts', 40, 40);
  const categories = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const catLabels = categories.map(c=>c[0]);
  const catData = categories.map(c=>c[1]);
  const pieImg = await createChartImage('pie', catLabels.length?catLabels:['No data'], catData.length?catData:[0]);
  const barImg = await createChartImage('bar', catLabels.length?catLabels:['No data'], catData.length?catData:[0]);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const imgMaxW = pageWidth - margin*2;
  doc.addImage(pieImg, 'PNG', margin, 70, imgMaxW, 200);
  doc.addImage(barImg, 'PNG', margin, 70+220, imgMaxW, 200);
  doc.save('items_report.pdf');
}

export async function generateOrdersPDF(orders) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const rows = orders.map(o => ({ id: o._id, amount: o.amount, items: (o.items || []).map(i => i.name || i.foodName || '').join(', ') }));

  doc.text('Orders Report', 40, 40);
  const tableBody = rows.map(r => [r.id, String(r.amount), r.items]);
  autoTable(doc, { startY: 70, head: [['ID','Amount','Items']], body: tableBody, styles:{fontSize:10}, margin:{left:40,right:40} });

  const total = orders.length;
  const totalAmount = orders.reduce((s,o)=>s + (Number(o.amount)||0),0);
  const summary = [`Total orders: ${total}`, `Total amount: ${totalAmount}`];
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200;
  doc.setFontSize(11); doc.text('Summary:', 40, finalY); doc.setFontSize(10);
  summary.forEach((s,i)=>doc.text(s,60, finalY + 18 + i*14));

  // charts (e.g., orders per status)
  doc.addPage(); doc.text('Charts', 40, 40);
  const statusCounts = orders.reduce((acc,o)=>{ acc[o.status] = (acc[o.status]||0)+1; return acc; },{});
  const labels = Object.keys(statusCounts); const data = Object.values(statusCounts);
  const pieImg = await createChartImage('pie', labels.length?labels:['No data'], data.length?data:[0]);
  const barImg = await createChartImage('bar', labels.length?labels:['No data'], data.length?data:[0]);
  const pageWidth = doc.internal.pageSize.getWidth(); const margin = 40; const imgMaxW = pageWidth - margin*2;
  doc.addImage(pieImg,'PNG',margin,70,imgMaxW,200); doc.addImage(barImg,'PNG',margin,70+220,imgMaxW,200);
  doc.save('orders_report.pdf');
}

export async function generateReservationsPDF(reservations) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const rows = reservations.map(r=>({ name: r.name || r.firstName || '', phone: r.phone||'', date: r.date||'' }));
  doc.text('Reservations Report',40,40);
  const tableBody = rows.map(r=>[r.name,r.phone,r.date]);
  autoTable(doc,{ startY:70, head:[['Name','Phone','Date']], body:tableBody, styles:{fontSize:10}, margin:{left:40,right:40}});
  const total = reservations.length; const summary = [`Total reservations: ${total}`];
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200; doc.setFontSize(11); doc.text('Summary:',40,finalY); doc.setFontSize(10); summary.forEach((s,i)=>doc.text(s,60,finalY+18+i*14));
  doc.addPage(); doc.text('Charts',40,40);
  // simple pie - guests distribution (example)
  const guestBuckets = {}; reservations.forEach(r=>{ const g = String(r.guests||'0'); guestBuckets[g] = (guestBuckets[g]||0)+1; });
  const labels = Object.keys(guestBuckets); const data = Object.values(guestBuckets);
  const pieImg = await createChartImage('pie', labels.length?labels:['No data'], data.length?data:[0]);
  const barImg = await createChartImage('bar', labels.length?labels:['No data'], data.length?data:[0]);
  const pageWidth = doc.internal.pageSize.getWidth(); const margin = 40; const imgMaxW = pageWidth - margin*2;
  doc.addImage(pieImg,'PNG',margin,70,imgMaxW,200); doc.addImage(barImg,'PNG',margin,70+220,imgMaxW,200);
  doc.save('reservations_report.pdf');
}

export async function generateSuppliersPDF(suppliers) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  // Expect suppliers to have: name, itemName (or item), qty, contact (or phone/email)
  const rows = suppliers.map(s => ({
    name: s.name || '',
    item: s.itemName || s.item || '',
    qty: s.qty || s.quantity || s.qty || '',
    contact: s.contact || s.phone || s.email || '',
  }));

  doc.text('Suppliers Report', 40, 40);
  const tableBody = rows.map(r => [r.name, r.item, String(r.qty), r.contact]);
  autoTable(doc, { startY: 70, head: [['Name', 'Item', 'Qty', 'Contact']], body: tableBody, styles: { fontSize: 10 }, margin: { left: 40, right: 40 } });

  // summary: total suppliers, total quantity, unique items
  const total = suppliers.length;
  const totalQty = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  const uniqueItems = new Set(rows.map(r => r.item).filter(Boolean)).size;
  const summary = [`Total suppliers: ${total}`, `Total quantity (sum): ${totalQty}`, `Unique items: ${uniqueItems}`];
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200;
  doc.setFontSize(11);
  doc.text('Summary:', 40, finalY);
  doc.setFontSize(10);
  summary.forEach((s, i) => doc.text(s, 60, finalY + 18 + i * 14));

  // charts: pie by top items, bar by quantity per top items
  doc.addPage();
  doc.text('Charts', 40, 40);
  const itemCounts = rows.reduce((acc, r) => { acc[r.item] = (acc[r.item] || 0) + (Number(r.qty) || 1); return acc; }, {});
  const top = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = top.map(t => t[0] || 'Unknown');
  const data = top.map(t => t[1]);
  const pieImg = await createChartImage('pie', labels.length ? labels : ['No data'], data.length ? data : [0]);
  const barImg = await createChartImage('bar', labels.length ? labels : ['No data'], data.length ? data : [0]);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const imgMaxW = pageWidth - margin * 2;
  doc.addImage(pieImg, 'PNG', margin, 70, imgMaxW, 200);
  doc.addImage(barImg, 'PNG', margin, 70 + 220, imgMaxW, 200);
  doc.save('suppliers_report.pdf');
}
