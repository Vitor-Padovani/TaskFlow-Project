/**
 * index.js — Task Lists page logic
 */

let lists = [];
let editingListId = null;
let deletingListId = null;

// ── Init ───────────────────────────────────────────────
async function init() {
    await loadLists();
}

async function loadLists() {
    setLoading(true);
    try {
        lists = await API.taskLists.list();
        render();
    } catch (e) {
        showToast('Failed to load lists: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ── Render ─────────────────────────────────────────────
function render() {
    const grid = document.getElementById('cardGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('listCount');
    const statsRow = document.getElementById('statsRow');

    count.textContent = lists.length === 0
        ? 'No lists yet'
        : `${lists.length} list${lists.length !== 1 ? 's' : ''}`;

    if (lists.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        statsRow.style.display = 'none';
        return;
    }

    empty.style.display = 'none';
    statsRow.style.display = 'flex';
    statsRow.innerHTML = `
    <div class="stat-chip">
      <div class="stat-dot" style="background:var(--accent)"></div>
      <span class="stat-val">${lists.length}</span>
      <span>total lists</span>
    </div>
  `;

    grid.innerHTML = lists.map(list => cardHTML(list)).join('');
}

function cardHTML(list) {
    const created = list.created ? formatRelative(list.created) : '';
    return `
    <div class="card" onclick="goToList('${list.id}')">
      <div class="card-title">${escHtml(list.title)}</div>
      ${list.description ? `<div class="card-desc">${escHtml(list.description)}</div>` : '<div class="card-desc" style="color:var(--text-dim);font-style:italic">No description</div>'}
      <div class="card-footer">
        <span class="card-meta">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${created}
        </span>
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="btn-icon" title="Edit" onclick="openEditModal('${list.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" title="Delete" onclick="openDeleteModal('${list.id}', '${escAttr(list.title)}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function goToList(id) {
    window.location.href = `/task-lists/${id}`;
}

// ── Create Modal ───────────────────────────────────────
function openCreateModal() {
    editingListId = null;
    document.getElementById('modalTitle').textContent = 'New Task List';
    document.getElementById('modalSaveBtn').textContent = 'Create List';
    document.getElementById('listTitle').value = '';
    document.getElementById('listDesc').value = '';
    document.getElementById('titleError').textContent = '';
    openOverlay('listModal');
    setTimeout(() => document.getElementById('listTitle').focus(), 100);
}

function openEditModal(id) {
    const list = lists.find(l => l.id === id);
    if (!list) return;
    editingListId = id;
    document.getElementById('modalTitle').textContent = 'Edit List';
    document.getElementById('modalSaveBtn').textContent = 'Save Changes';
    document.getElementById('listTitle').value = list.title;
    document.getElementById('listDesc').value = list.description || '';
    document.getElementById('titleError').textContent = '';
    openOverlay('listModal');
    setTimeout(() => document.getElementById('listTitle').focus(), 100);
}

function closeModal() {
    closeOverlay('listModal');
}

async function saveList() {
    const title = document.getElementById('listTitle').value.trim();
    const desc = document.getElementById('listDesc').value.trim();
    const errEl = document.getElementById('titleError');

    if (!title) {
        errEl.textContent = 'Title is required.';
        document.getElementById('listTitle').focus();
        return;
    }
    errEl.textContent = '';

    const btn = document.getElementById('modalSaveBtn');
    btn.disabled = true;
    btn.textContent = editingListId ? 'Saving...' : 'Creating...';

    try {
        if (editingListId) {
            await API.taskLists.update(editingListId, title, desc || undefined);
            showToast('List updated successfully');
        } else {
            await API.taskLists.create(title, desc || undefined);
            showToast('List created!');
        }
        closeModal();
        await loadLists();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = editingListId ? 'Save Changes' : 'Create List';
    }
}

// ── Delete Modal ───────────────────────────────────────
function openDeleteModal(id, name) {
    deletingListId = id;
    document.getElementById('deleteListName').textContent = `"${name}"`;
    openOverlay('deleteModal');
}

function closeDeleteModal() {
    closeOverlay('deleteModal');
}

async function confirmDelete() {
    if (!deletingListId) return;
    const btn = document.querySelector('#deleteModal .btn-danger');
    btn.disabled = true;
    btn.textContent = 'Deleting...';
    try {
        await API.taskLists.delete(deletingListId);
        showToast('List deleted');
        closeDeleteModal();
        await loadLists();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Delete List';
    }
}

// ── Helpers ────────────────────────────────────────────
function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(s) {
    return String(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;');
}

// Enter key in title field
document.getElementById('listTitle')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveList();
});

// ── Boot ───────────────────────────────────────────────
init();