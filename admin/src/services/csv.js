// CSV exporter with type-aware formatting for Excel

function quoteText(v) {
  if (v == null) return '""';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

function formatDate(value) {
  if (!value) return '';
  const d = (value instanceof Date) ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  // ISO date (YYYY-MM-DD)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(value) {
  if (!value) return '';
  if (value instanceof Date) {
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  const m = String(value).match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2,'0')}:${m[2]}`;
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  return String(value);
}

function formatNumber(value, decimals = 2) {
  if (value == null || value === '') return '';
  const n = Number(String(value).replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(n)) return String(value);
  return n.toFixed(decimals);
}

function toCsvCell(value, type = 'text') {
  if (type === 'number') return formatNumber(value);
  if (type === 'date') return formatDate(value);
  if (type === 'time') return formatTime(value);
  if (type === 'force_text') return quoteText(`'${value == null ? '' : String(value)}`);
  return quoteText(value);
}

export function downloadCsv(filename, rows, fieldTypes = {}) {
  if (!rows || rows.length === 0) {
    const blob = new Blob([""], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(h => quoteText(h)).join(',');
  const lines = [headerLine];

  rows.forEach(r => {
    const line = headers.map(h => toCsvCell(r[h], fieldTypes[h] || 'text')).join(',');
    lines.push(line);
  });

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadUsersCSV(users) {
  const rows = users.map(u => ({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', phone: u.phone || '' }));
  const types = { firstName: 'text', lastName: 'text', email: 'text', phone: 'force_text' };
  downloadCsv('users.csv', rows, types);
}

export function downloadItemsCSV(items) {
  const rows = items.map(i => ({ name: i.name || '', category: i.category || '', price: i.price || '' }));
  const types = { name: 'text', category: 'text', price: 'number' };
  downloadCsv('items.csv', rows, types);
}

export function downloadOrdersCSV(orders) {
  const rows = orders.map(o => ({ id: o._id || '', amount: o.amount || '', items: (o.items || []).map(it => it.name || it.foodName || '').join('; ') }));
  const types = { id: 'text', amount: 'number', items: 'text' };
  downloadCsv('orders.csv', rows, types);
}

export function downloadReservationsCSV(reservations) {
  // Reservation CSV: format date as DD/MM/YYYY (user requested) and export date/time as text
  function formatDateDDMMYYYY(value) {
    if (!value) return '';
    const d = (value instanceof Date) ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const rows = reservations.map(r => ({
    name: r.name || r.firstName || '',
    phone: r.phone || '',
    // use custom formatted date and time strings so Excel sees them as readable text
    date: formatDateDDMMYYYY(r.date || ''),
    time: formatTime(r.time || '')
  }));

  // mark date/time as text so the generic 'date' handler isn't applied (we've already formatted)
  const types = { name: 'text', phone: 'force_text', date: 'text', time: 'text' };
  downloadCsv('reservations.csv', rows, types);
}

export function downloadSuppliersCSV(suppliers) {
  const rows = suppliers.map(s => ({ name: s.name || '', item: s.itemName || s.item || '', qty: s.qty || s.quantity || '', contact: s.phone || s.email || '' }));
  const types = { name: 'text', item: 'text', qty: 'number', contact: 'force_text' };
  downloadCsv('suppliers.csv', rows, types);
}
