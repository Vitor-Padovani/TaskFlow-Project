/**
 * Shared UI utilities
 */

// ── Toast Notifications ────────────────────────────────
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icon = type === 'success'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Loading Bar ────────────────────────────────────────
function setLoading(on) {
    const bar = document.getElementById('loadingBar');
    if (!bar) return;
    bar.style.width = on ? '75%' : '100%';
    if (!on) {
        setTimeout(() => { bar.style.width = '0'; }, 300);
    }
}

// ── Modal helpers ──────────────────────────────────────
function openOverlay(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeOverlay(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}

// Close on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(el => {
            el.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
});

// ── Priority / Status helpers ──────────────────────────
function priorityTag(priority) {
    const labels = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };
    return `<span class="tag tag-priority-${priority}">
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3v18M4 3l16 9-16 9"/></svg>
    ${labels[priority] || priority}
  </span>`;
}

function statusTag(status) {
    const labels = { OPEN: 'Open', COMPLETE: 'Complete' };
    return `<span class="tag tag-status-${status}">${labels[status] || status}</span>`;
}

function dateTag(dateStr) {
    if (!dateStr) return '';

    const [date] = dateStr.split('T');
    const [y, m, d] = date.split('-');

    return `<span class="tag-date">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      ${d}/${m}/${y}
    </span>`;
}

