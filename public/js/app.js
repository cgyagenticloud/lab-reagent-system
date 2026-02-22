// Lab Reagent Management System — Frontend JS
const API = '/api';

// ── Helpers ─────────────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json();
}

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg, type = 'success') {
  let c = $('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${type} border-0 show`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(msg)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function today() { return new Date().toISOString().slice(0, 10); }

// ── Page: Dashboard ────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const data = await api('/dashboard');
    $('#stat-total').textContent = data.total;
    $('#stat-low').textContent = data.low_stock_count;
    $('#stat-expiring').textContent = data.expiring_count;
    $('#stat-expired').textContent = data.expired_count;

    // Category breakdown
    const catList = $('#cat-list');
    catList.innerHTML = data.categories.map(c =>
      `<li class="list-group-item d-flex justify-content-between align-items-center">
        <span><span class="badge rounded-pill" style="background:${esc(c.color)}">${c.count}</span> ${esc(c.name)}</span>
        <a href="reagents.html?category=${encodeURIComponent(c.name)}" class="btn btn-sm btn-outline-secondary">View</a>
      </li>`
    ).join('');

    // Recent usage
    const usageList = $('#usage-list');
    if (data.recent_usage.length === 0) {
      usageList.innerHTML = '<li class="list-group-item text-muted">No usage recorded yet.</li>';
    } else {
      usageList.innerHTML = data.recent_usage.map(u =>
        `<li class="list-group-item small">
          <strong>${esc(u.user_name || 'Unknown')}</strong> used <strong>${u.quantity_used}</strong> of
          <a href="reagent.html?id=${u.reagent_id}">${esc(u.reagent_name)}</a>
          <span class="text-muted float-end">${esc((u.date || '').slice(0, 10))}</span>
        </li>`
      ).join('');
    }

    // Low stock table
    const lowTable = $('#low-stock-table');
    if (data.low_stock.length > 0) {
      $('#low-stock-section').style.display = '';
      lowTable.innerHTML = data.low_stock.map(r =>
        `<tr>
          <td>${esc(r.name)}</td>
          <td><span class="text-danger fw-bold">${r.current_stock}</span> ${esc(r.unit)}</td>
          <td>${r.minimum_threshold} ${esc(r.unit)}</td>
          <td><a href="reagent.html?id=${r.id}" class="btn btn-sm btn-outline-primary">View</a></td>
        </tr>`
      ).join('');
    }

    // Expiring table
    const expTable = $('#expiring-table');
    if (data.expiring.length > 0) {
      $('#expiring-section').style.display = '';
      expTable.innerHTML = data.expiring.map(r =>
        `<tr>
          <td>${esc(r.name)}</td>
          <td class="text-danger fw-bold">${esc(r.expiration_date)}</td>
          <td><a href="reagent.html?id=${r.id}" class="btn btn-sm btn-outline-primary">View</a></td>
        </tr>`
      ).join('');
    }
  } catch (e) {
    toast('Failed to load dashboard: ' + e.message, 'danger');
  }
}

// ── Page: Reagents ─────────────────────────────────────────────────────
async function loadReagents() {
  const params = new URLSearchParams(window.location.search);
  try {
    const data = await api('/reagents?' + params.toString());
    const cats = await api('/categories');
    const nowStr = today();

    // Populate filter dropdowns
    const catSel = $('#filter-category');
    if (catSel) {
      cats.forEach(c => {
        const o = document.createElement('option');
        o.value = c.name; o.textContent = c.name;
        if (params.get('category') === c.name) o.selected = true;
        catSel.appendChild(o);
      });
    }

    // Populate vendor dropdown
    const vendors = [...new Set(data.map(r => r.vendor).filter(Boolean))].sort();
    const vSel = $('#filter-vendor');
    if (vSel) {
      vendors.forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v;
        if (params.get('vendor') === v) o.selected = true;
        vSel.appendChild(o);
      });
    }

    // Set current filter values
    const qInput = $('#filter-q');
    if (qInput && params.get('q')) qInput.value = params.get('q');
    const storageSel = $('#filter-storage');
    if (storageSel && params.get('storage')) storageSel.value = params.get('storage');
    const stockSel = $('#filter-stock');
    if (stockSel && params.get('stock_status')) stockSel.value = params.get('stock_status');

    $('#reagent-count').textContent = data.length;
    const tbody = $('#reagent-tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No reagents found.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(r => {
      const isLow = r.current_stock <= r.minimum_threshold;
      const isExpired = r.expiration_date && r.expiration_date < nowStr;
      return `<tr class="${isLow ? 'table-warning' : ''}">
        <td><input type="checkbox" class="reagent-check" data-id="${r.id}" data-name="${esc(r.name)}" data-catalog="${esc(r.catalog_number||'')}" data-storage="${esc(r.storage_temp||'')} ${esc(r.storage_location||'')}" data-expiration="${esc(r.expiration_date||'')}"></td>
        <td><a href="reagent.html?id=${r.id}" class="fw-semibold text-decoration-none">${esc(r.name)}</a></td>
        <td>${r.category_name ? `<span class="badge" style="background:${esc(r.category_color)}">${esc(r.category_name)}</span>` : ''}</td>
        <td class="small">${esc(r.vendor || '')}</td>
        <td class="small text-muted">${esc(r.catalog_number || '')}</td>
        <td><small>${esc(r.storage_temp || '')}</small></td>
        <td class="text-end">${isLow ? '<i class="bi bi-exclamation-triangle-fill text-warning"></i> ' : ''}<strong>${r.current_stock}</strong> <small class="text-muted">${esc(r.unit)}</small></td>
        <td class="small ${isExpired ? 'text-danger fw-bold' : ''}">${esc(r.expiration_date || '—')}</td>
        <td><a href="reagent.html?id=${r.id}" class="btn btn-sm btn-outline-secondary"><i class="bi bi-eye"></i></a></td>
      </tr>`;
    }).join('');

    // Select all / bulk print
    const selectAll = $('#select-all');
    const bulkBtn = $('#btn-bulk-print');
    if (selectAll) {
      selectAll.onchange = () => {
        $$('.reagent-check').forEach(cb => cb.checked = selectAll.checked);
        updateBulkBtn();
      };
      document.addEventListener('change', e => { if (e.target.classList.contains('reagent-check')) updateBulkBtn(); });
    }
    function updateBulkBtn() {
      const checked = $$('.reagent-check:checked');
      if (bulkBtn) bulkBtn.classList.toggle('d-none', checked.length === 0);
    }
    if (bulkBtn) {
      bulkBtn.onclick = () => {
        const selected = $$('.reagent-check:checked').map(cb => ({
          id: cb.dataset.id, name: cb.dataset.name,
          catalog: cb.dataset.catalog, storage: cb.dataset.storage,
          expiration: cb.dataset.expiration
        }));
        printLabels(selected);
      };
    }
  } catch (e) {
    toast('Failed to load reagents: ' + e.message, 'danger');
  }
}

// ── Page: Reagent Detail ───────────────────────────────────────────────
async function loadReagentDetail() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = 'reagents.html'; return; }
  try {
    const r = await api(`/reagents/${id}`);
    const nowStr = today();
    const isLow = r.current_stock <= r.minimum_threshold;
    const isExpired = r.expiration_date && r.expiration_date < nowStr;

    document.title = r.name + ' — ReagentTracker';
    $('#reagent-name').innerHTML = esc(r.name) + (isLow ? ' <span class="badge bg-warning text-dark">Low Stock</span>' : '');
    $('#reagent-category').innerHTML = r.category_name ? `<span class="badge" style="background:${esc(r.category_color)}">${esc(r.category_name)}</span>` : '';
    $('#detail-cas').textContent = r.cas_number || '—';
    $('#detail-catalog').textContent = r.catalog_number || '—';
    $('#detail-lot').textContent = r.lot_number || '—';
    $('#detail-vendor').textContent = r.vendor || '—';
    $('#detail-storage').textContent = (r.storage_temp || '') + ' — ' + (r.storage_location || '—');
    $('#detail-price').textContent = r.price_per_unit ? `$${Number(r.price_per_unit).toFixed(2)}` : '—';
    const expEl = $('#detail-expiration');
    expEl.textContent = r.expiration_date || '—';
    if (isExpired) { expEl.classList.add('text-danger', 'fw-bold'); }
    $('#detail-added').textContent = r.date_added ? r.date_added.slice(0, 10) : '—';
    $('#detail-notes').textContent = r.notes || '—';

    const stockEl = $('#detail-stock');
    stockEl.textContent = r.current_stock;
    stockEl.className = `display-4 fw-bold ${isLow ? 'text-danger' : 'text-success'}`;
    $('#detail-unit').textContent = `${r.unit} (min: ${r.minimum_threshold})`;

    // Edit link
    $('#btn-edit').href = `reagent-form.html?id=${r.id}`;

    // Delete handler
    $('#btn-delete').onclick = async () => {
      if (!confirm('Delete this reagent?')) return;
      await api(`/reagents/${id}`, { method: 'DELETE' });
      toast('Reagent deleted.', 'warning');
      setTimeout(() => window.location.href = 'reagents.html', 500);
    };

    // Load users for usage form
    const users = await api('/users');
    const userSel = $('#use-user');
    users.forEach(u => {
      const o = document.createElement('option');
      o.value = u.id; o.textContent = u.name;
      userSel.appendChild(o);
    });

    // Usage form
    $('#usage-form').onsubmit = async (e) => {
      e.preventDefault();
      const qty = parseFloat($('#use-qty').value);
      const user_id = $('#use-user').value || null;
      const notes = $('#use-notes').value;
      if (qty <= 0) { toast('Quantity must be positive.', 'danger'); return; }
      await api('/usage', { method: 'POST', body: JSON.stringify({ reagent_id: parseInt(id), user_id: user_id ? parseInt(user_id) : null, quantity_used: qty, notes }) });
      toast(`Logged usage of ${qty} units.`);
      loadReagentDetail();
    };

    // Usage history
    const usageTbody = $('#usage-tbody');
    if (r.usage && r.usage.length > 0) {
      $('#usage-section').style.display = '';
      usageTbody.innerHTML = r.usage.map(u =>
        `<tr><td class="small">${esc((u.date || '').slice(0, 16))}</td><td>${esc(u.user_name || '—')}</td><td>${u.quantity_used}</td><td class="small text-muted">${esc(u.notes || '')}</td></tr>`
      ).join('');
    }

    // Orders
    if (r.orders && r.orders.length > 0) {
      $('#orders-section').style.display = '';
      $('#orders-tbody').innerHTML = r.orders.map(o =>
        `<tr><td class="small">${esc(o.date_ordered || '—')}</td><td>${o.quantity}</td><td>${o.price ? '$' + Number(o.price).toFixed(2) : '—'}</td><td>${o.status === 'received' ? '<span class="badge bg-success">Received</span>' : '<span class="badge bg-warning text-dark">Pending</span>'}</td></tr>`
      ).join('');
    }

    // Preparations
    const prepUserSel = $('#prep-user');
    if (prepUserSel) {
      users.forEach(u => { const o = document.createElement('option'); o.value = u.id; o.textContent = u.name; prepUserSel.appendChild(o); });
    }
    if (r.preparations && r.preparations.length > 0) {
      $('#prep-tbody').innerHTML = r.preparations.map(p =>
        `<tr>
          <td class="fw-semibold">${esc(p.name)}</td>
          <td>${esc(p.concentration || '—')}</td>
          <td>${p.volume ? p.volume + ' ' + esc(p.unit||'') : '—'}</td>
          <td>${esc(p.preparer_name || '—')}</td>
          <td class="small">${esc((p.date_prepared||'').slice(0,10))}</td>
          <td class="small">${esc(p.expiration_date || '—')}</td>
          <td><button class="btn btn-sm btn-outline-danger btn-del-prep" data-id="${p.id}"><i class="bi bi-trash"></i></button></td>
        </tr>`
      ).join('');
      $$('.btn-del-prep').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Delete this preparation?')) return;
          await api(`/preparations/${btn.dataset.id}`, { method: 'DELETE' });
          toast('Preparation deleted.', 'warning');
          loadReagentDetail();
        };
      });
    }

    // Preparation form
    const prepForm = $('#prep-form');
    if (prepForm) {
      $('#prep-date').value = today();
      prepForm.onsubmit = async (e) => {
        e.preventDefault();
        await api('/preparations', { method: 'POST', body: JSON.stringify({
          reagent_id: parseInt(id),
          name: $('#prep-name').value,
          concentration: $('#prep-concentration').value || null,
          volume: parseFloat($('#prep-volume').value) || null,
          unit: $('#prep-unit').value || 'mL',
          prepared_by: $('#prep-user').value ? parseInt($('#prep-user').value) : null,
          date_prepared: $('#prep-date').value || today(),
          expiration_date: $('#prep-expiration').value || null,
          protocol: $('#prep-protocol').value || null,
          notes: $('#prep-notes').value || null,
        })});
        toast('Preparation added.');
        loadReagentDetail();
      };
    }

    // QR Code
    const qrEl = $('#qrcode');
    if (qrEl && typeof QRCode !== 'undefined') {
      qrEl.innerHTML = '';
      new QRCode(qrEl, { text: `https://lab-reagent-system.pages.dev/reagent.html?id=${id}`, width: 150, height: 150 });
    }

    // Print single label
    const printBtn = $('#btn-print-label');
    if (printBtn) {
      printBtn.onclick = () => {
        printLabels([{
          id: id, name: r.name,
          catalog: r.catalog_number || '',
          storage: (r.storage_temp || '') + ' ' + (r.storage_location || ''),
          expiration: r.expiration_date || ''
        }]);
      };
    }
  } catch (e) {
    toast('Failed to load reagent: ' + e.message, 'danger');
  }
}

// ── Page: Reagent Form (Add/Edit) ──────────────────────────────────────
async function loadReagentForm() {
  const id = new URLSearchParams(window.location.search).get('id');
  const cats = await api('/categories');
  const catSel = $('#form-category');
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c.id; o.textContent = c.name;
    catSel.appendChild(o);
  });

  if (id) {
    const r = await api(`/reagents/${id}`);
    document.title = 'Edit ' + r.name;
    $('#form-title').textContent = 'Edit Reagent';
    $('#form-submit-btn').textContent = 'Update Reagent';
    $('#form-name').value = r.name || '';
    catSel.value = r.category_id || '';
    $('#form-cas').value = r.cas_number || '';
    $('#form-catalog').value = r.catalog_number || '';
    $('#form-lot').value = r.lot_number || '';
    $('#form-vendor').value = r.vendor || '';
    $('#form-storage-temp').value = r.storage_temp || '-80°C';
    $('#form-storage-location').value = r.storage_location || '';
    $('#form-stock').value = r.current_stock ?? 0;
    $('#form-unit').value = r.unit || 'units';
    $('#form-threshold').value = r.minimum_threshold ?? 1;
    $('#form-price').value = r.price_per_unit || '';
    $('#form-expiration').value = r.expiration_date || '';
    $('#form-notes').value = r.notes || '';
  }

  $('#reagent-form').onsubmit = async (e) => {
    e.preventDefault();
    const body = {
      name: $('#form-name').value,
      category_id: $('#form-category').value ? parseInt($('#form-category').value) : null,
      cas_number: $('#form-cas').value || null,
      catalog_number: $('#form-catalog').value || null,
      lot_number: $('#form-lot').value || null,
      vendor: $('#form-vendor').value || null,
      storage_temp: $('#form-storage-temp').value || null,
      storage_location: $('#form-storage-location').value || null,
      current_stock: parseFloat($('#form-stock').value) || 0,
      unit: $('#form-unit').value || 'units',
      minimum_threshold: parseFloat($('#form-threshold').value) || 1,
      price_per_unit: parseFloat($('#form-price').value) || null,
      expiration_date: $('#form-expiration').value || null,
      notes: $('#form-notes').value || null,
    };
    if (id) {
      await api(`/reagents/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Reagent updated!');
      setTimeout(() => window.location.href = `reagent.html?id=${id}`, 500);
    } else {
      const result = await api('/reagents', { method: 'POST', body: JSON.stringify(body) });
      toast('Reagent added!');
      setTimeout(() => window.location.href = 'reagents.html', 500);
    }
  };
}

// ── Page: Orders ───────────────────────────────────────────────────────
async function loadOrders() {
  try {
    const [orders, reagents, users] = await Promise.all([
      api('/orders'), api('/reagents'), api('/users')
    ]);

    const tbody = $('#order-tbody');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">No orders yet.</td></tr>';
    } else {
      tbody.innerHTML = orders.map(o =>
        `<tr>
          <td class="small">${esc(o.date_ordered || '—')}</td>
          <td>${esc(o.reagent_name || '—')}</td>
          <td class="small">${esc(o.vendor || '')}</td>
          <td>${o.quantity}</td>
          <td>${o.price ? '$' + Number(o.price).toFixed(2) : '—'}</td>
          <td class="small">${esc(o.po_number || '')}</td>
          <td>${o.status === 'received' ? '<span class="badge bg-success">Received</span>' : '<span class="badge bg-warning text-dark">Pending</span>'}</td>
          <td>${o.status !== 'received' ? `<button class="btn btn-sm btn-outline-success btn-receive" data-id="${o.id}" title="Mark received"><i class="bi bi-check-lg"></i></button>` : ''}</td>
        </tr>`
      ).join('');

      // Receive handlers
      $$('.btn-receive').forEach(btn => {
        btn.onclick = async () => {
          await api(`/orders/${btn.dataset.id}/receive`, { method: 'POST' });
          toast('Order marked as received. Stock updated.');
          loadOrders();
        };
      });
    }

    // Populate form dropdowns
    const rSel = $('#order-reagent');
    reagents.forEach(r => { const o = document.createElement('option'); o.value = r.id; o.textContent = r.name; rSel.appendChild(o); });
    const uSel = $('#order-user');
    users.forEach(u => { const o = document.createElement('option'); o.value = u.id; o.textContent = u.name; uSel.appendChild(o); });

    // Order form
    $('#order-form').onsubmit = async (e) => {
      e.preventDefault();
      const body = {
        reagent_id: $('#order-reagent').value ? parseInt($('#order-reagent').value) : null,
        vendor: $('#order-vendor').value || null,
        catalog_number: $('#order-catalog').value || null,
        quantity: parseFloat($('#order-qty').value) || 0,
        price: parseFloat($('#order-price').value) || null,
        po_number: $('#order-po').value || null,
        date_ordered: $('#order-date').value || today(),
        ordered_by: $('#order-user').value ? parseInt($('#order-user').value) : null,
        notes: $('#order-notes').value || null,
      };
      await api('/orders', { method: 'POST', body: JSON.stringify(body) });
      toast('Order recorded.');
      $('#order-form').reset();
      // Clear dynamically added options (prevent duplicates)
      rSel.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
      uSel.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
      loadOrders();
    };
  } catch (e) {
    toast('Failed to load orders: ' + e.message, 'danger');
  }
}

// ── Page: Categories ───────────────────────────────────────────────────
async function loadCategories() {
  try {
    const cats = await api('/categories');
    const grid = $('#cat-grid');
    grid.innerHTML = cats.map(c =>
      `<div class="col-sm-6">
        <div class="card h-100" style="border-left:4px solid ${esc(c.color)}">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-0">${esc(c.name)}</h6>
              <small class="text-muted">${c.reagent_count} reagent${c.reagent_count !== 1 ? 's' : ''}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger btn-del-cat" data-id="${c.id}" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>`
    ).join('');

    $$('.btn-del-cat').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Delete category?')) return;
        await api(`/categories/${btn.dataset.id}`, { method: 'DELETE' });
        toast('Category removed.', 'warning');
        loadCategories();
      };
    });

    $('#cat-form').onsubmit = async (e) => {
      e.preventDefault();
      await api('/categories', { method: 'POST', body: JSON.stringify({
        name: $('#cat-name').value,
        description: $('#cat-desc').value || null,
        color: $('#cat-color').value || '#6c757d',
      })});
      toast('Category added.');
      $('#cat-form').reset();
      loadCategories();
    };
  } catch (e) {
    toast('Failed to load categories: ' + e.message, 'danger');
  }
}

// ── Page: Users ────────────────────────────────────────────────────────
async function loadUsers() {
  try {
    const users = await api('/users');
    const tbody = $('#user-tbody');
    tbody.innerHTML = users.map(u =>
      `<tr>
        <td class="fw-semibold">${esc(u.name)}</td>
        <td class="text-muted">${esc(u.email || '—')}</td>
        <td><span class="badge bg-${u.role === 'admin' ? 'primary' : 'secondary'}">${esc(u.role)}</span></td>
        <td><button class="btn btn-sm btn-outline-danger btn-del-user" data-id="${u.id}"><i class="bi bi-trash"></i></button></td>
      </tr>`
    ).join('');

    $$('.btn-del-user').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Remove this user?')) return;
        await api(`/users/${btn.dataset.id}`, { method: 'DELETE' });
        toast('User removed.', 'warning');
        loadUsers();
      };
    });

    $('#user-form').onsubmit = async (e) => {
      e.preventDefault();
      await api('/users', { method: 'POST', body: JSON.stringify({
        name: $('#user-name').value,
        email: $('#user-email').value || null,
        role: $('#user-role').value || 'member',
      })});
      toast('User added.');
      $('#user-form').reset();
      loadUsers();
    };
  } catch (e) {
    toast('Failed to load users: ' + e.message, 'danger');
  }
}

// ── Page: Preparations ─────────────────────────────────────────────────
async function loadPreparations() {
  try {
    const params = new URLSearchParams();
    const q = $('#prep-filter-q')?.value || '';
    if (q) params.set('q', q);
    const data = await api('/preparations?' + params.toString());
    $('#prep-count').textContent = data.length;
    const tbody = $('#prep-tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No preparations found.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(p =>
      `<tr>
        <td class="fw-semibold">${esc(p.name)}</td>
        <td>${p.reagent_name ? `<a href="reagent.html?id=${p.reagent_id}">${esc(p.reagent_name)}</a>` : '—'}</td>
        <td>${esc(p.concentration || '—')}</td>
        <td>${p.volume ? p.volume + ' ' + esc(p.unit||'') : '—'}</td>
        <td>${esc(p.preparer_name || '—')}</td>
        <td class="small">${esc((p.date_prepared||'').slice(0,10))}</td>
        <td class="small">${esc(p.expiration_date || '—')}</td>
        <td><button class="btn btn-sm btn-outline-danger btn-del-prep" data-id="${p.id}"><i class="bi bi-trash"></i></button></td>
      </tr>`
    ).join('');
    $$('.btn-del-prep').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Delete this preparation?')) return;
        await api(`/preparations/${btn.dataset.id}`, { method: 'DELETE' });
        toast('Preparation deleted.', 'warning');
        loadPreparations();
      };
    });

    // Filter form
    const filterForm = $('#prep-filter-form');
    if (filterForm) filterForm.onsubmit = (e) => { e.preventDefault(); loadPreparations(); };
  } catch (e) {
    toast('Failed to load preparations: ' + e.message, 'danger');
  }
}

// ── Print Labels ───────────────────────────────────────────────────────
function printLabels(items) {
  const win = window.open('', '_blank');
  const labelsHtml = items.map(item => `
    <div class="label-item">
      <div class="label-qr" id="qr-${item.id}"></div>
      <div class="label-info">
        <div class="label-name">${item.name}</div>
        <div class="label-detail">Cat#: ${item.catalog || '—'}</div>
        <div class="label-detail">${item.storage || ''}</div>
        <div class="label-detail">Exp: ${item.expiration || '—'}</div>
      </div>
    </div>
  `).join('');

  win.document.write(`<!DOCTYPE html><html><head><title>Print Labels</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 10mm; }
      .label-sheet { display: flex; flex-wrap: wrap; gap: 5mm; }
      .label-item { display: flex; align-items: center; gap: 3mm; border: 1px solid #ccc; border-radius: 4px; padding: 3mm; width: 63.5mm; height: 25.4mm; overflow: hidden; page-break-inside: avoid; }
      .label-qr { flex-shrink: 0; }
      .label-qr canvas, .label-qr img { width: 18mm !important; height: 18mm !important; }
      .label-info { flex: 1; min-width: 0; }
      .label-name { font-weight: 700; font-size: 9pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .label-detail { font-size: 7pt; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .no-print { text-align: center; padding: 10px; }
      @media print { .no-print { display: none; } .label-item { border-color: #999; } }
    </style>
  </head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <div class="label-sheet">${labelsHtml}</div>
    <script>
      ${JSON.stringify(items)}.forEach(function(item) {
        new QRCode(document.getElementById('qr-' + item.id), {
          text: 'https://lab-reagent-system.pages.dev/reagent.html?id=' + item.id,
          width: 68, height: 68
        });
      });
    <\/script>
  </body></html>`);
  win.document.close();
}
