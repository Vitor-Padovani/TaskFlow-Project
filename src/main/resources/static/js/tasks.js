/**
 * tasks.js — Tasks page logic
 */

let taskListId = null;
let currentList = null;
let tasks = [];
let editingTaskId = null;
let deletingTaskId = null;
let currentFilter = 'ALL';

// ── Init ───────────────────────────────────────────────
async function init() {
    const params = new URLSearchParams(window.location.search);
    taskListId = window.location.pathname.split('/').pop()

    if (!taskListId) {
        window.location.href = 'index.html';
        return;
    }

    await Promise.all([loadList(), loadTasks()]);
}

async function loadList() {
    try {
        currentList = await API.taskLists.get(taskListId);
        renderListHeader();
    } catch (e) {
        showToast('Failed to load list info: ' + e.message, 'error');
    }
}

async function loadTasks() {
    setLoading(true);
    try {
        tasks = await API.tasks.list(taskListId);
        renderTasks();
        renderStats();
    } catch (e) {
        showToast('Failed to load tasks: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ── Render Header ──────────────────────────────────────
function renderListHeader() {
    if (!currentList) return;
    document.title = `TaskFlow — ${currentList.title}`;
    document.getElementById('bcListName').textContent = currentList.title;
    document.getElementById('listTitle').textContent = currentList.title;
    document.getElementById('listEyebrow').textContent = 'Task List';
    document.getElementById('listDesc').textContent = currentList.description || '';
}

// ── Render Stats ───────────────────────────────────────
function renderStats() {
    const row = document.getElementById('statsRow');
    const total = tasks.length;
    const open = tasks.filter(t => t.status === 'OPEN').length;
    const done = tasks.filter(t => t.status === 'CLOSED').length;

    row.innerHTML = `
    <div class="stat-chip">
      <div class="stat-dot" style="background:var(--text-muted)"></div>
      <span class="stat-val">${total}</span>
      <span>total</span>
    </div>
    <div class="stat-chip">
      <div class="stat-dot" style="background:var(--open)"></div>
      <span class="stat-val">${open}</span>
      <span>open</span>
    </div>
    <div class="stat-chip">
      <div class="stat-dot" style="background:var(--complete)"></div>
      <span class="stat-val">${done}</span>
      <span>done</span>
    </div>
  `;
}

// ── Filter ─────────────────────────────────────────────
function setFilter(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
}

// ── Render Tasks ───────────────────────────────────────
function renderTasks() {
    const container = document.getElementById('taskListContainer');
    const empty = document.getElementById('emptyState');

    const filtered = tasks.filter(t => {
        if (currentFilter === 'ALL') return true;
        if (currentFilter === 'OPEN') return t.status === 'OPEN';
        if (currentFilter === 'CLOSED') return t.status === 'CLOSED';
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    container.innerHTML = filtered.map(t => taskItemHTML(t)).join('');
}

function taskItemHTML(task) {
    const isComplete = task.status === 'CLOSED';
    return `
    <div class="task-item ${isComplete ? 'completed' : ''}" id="task-${task.id}">
      <div class="task-checkbox ${isComplete ? 'checked' : ''}" 
           onclick="toggleTask('${task.id}')" 
           title="${isComplete ? 'Mark as open' : 'Mark as complete'}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="task-body">
        <div class="task-title">${escHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escHtml(task.description)}</div>` : ''}
        <div class="task-tags">
          ${priorityTag(task.priority)}
          ${statusTag(task.status)}
          ${dateTag(task.dueDate)}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-icon" title="Edit" onclick="openEditTaskModal('${task.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon danger" title="Delete" onclick="openDeleteTaskModal('${task.id}', '${escAttr(task.title)}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  `;
}

// ── Toggle Complete ────────────────────────────────────
async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'OPEN' ? 'CLOSED' : 'OPEN';

    // Optimistic update
    task.status = newStatus;
    renderTasks();
    renderStats();

    try {
        const updated = await API.tasks.update(taskListId, id, {
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            status: newStatus,
        });
        // sync with server response
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) tasks[idx] = updated;
        renderTasks();
        renderStats();
    } catch (e) {
        // revert
        task.status = newStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        renderTasks();
        renderStats();
        showToast('Failed to update task: ' + e.message, 'error');
    }
}

// ── Create Task Modal ──────────────────────────────────
function openCreateTaskModal() {
    editingTaskId = null;
    document.getElementById('taskModalTitle').textContent = 'New Task';
    document.getElementById('taskSaveBtn').textContent = 'Create Task';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskTitleError').textContent = '';

    // Show create fields (no status)
    document.getElementById('taskFormRowEdit').style.display = 'grid';
    document.getElementById('taskFormRowEditStatus').style.display = 'none';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskPriority').value = 'MEDIUM';

    openOverlay('taskModal');
    setTimeout(() => document.getElementById('taskTitle').focus(), 100);
}

function openEditTaskModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    editingTaskId = id;

    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    document.getElementById('taskSaveBtn').textContent = 'Save Changes';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description || '';
    document.getElementById('taskTitleError').textContent = '';

    // Show edit fields (with status)
    document.getElementById('taskFormRowEdit').style.display = 'none';
    document.getElementById('taskFormRowEditStatus').style.display = 'grid';
    document.getElementById('taskDueDateEdit').value = task.dueDate || '';
    document.getElementById('taskPriorityEdit').value = task.priority || 'MEDIUM';
    document.getElementById('taskStatus').value = task.status || 'OPEN';

    openOverlay('taskModal');
    setTimeout(() => document.getElementById('taskTitle').focus(), 100);
}

function closeTaskModal() {
    closeOverlay('taskModal');
}

async function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const errEl = document.getElementById('taskTitleError');

    if (!title) {
        errEl.textContent = 'Title is required.';
        document.getElementById('taskTitle').focus();
        return;
    }
    errEl.textContent = '';

    const btn = document.getElementById('taskSaveBtn');
    btn.disabled = true;
    btn.textContent = editingTaskId ? 'Saving...' : 'Creating...';

    try {
        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            const dueDate = document.getElementById('taskDueDateEdit').value || null;
            const priority = document.getElementById('taskPriorityEdit').value;
            const status = document.getElementById('taskStatus').value;

            const updated = await API.tasks.update(taskListId, editingTaskId, {
                id: editingTaskId,
                title,
                description: desc || null,
                dueDate,
                priority,
                status,
            });
            const idx = tasks.findIndex(t => t.id === editingTaskId);
            if (idx !== -1) tasks[idx] = updated;
            showToast('Task updated!');
        } else {
            const dueDate = document.getElementById('taskDueDate').value || null;
            const priority = document.getElementById('taskPriority').value;

            const created = await API.tasks.create(taskListId, { title, description: desc || null, dueDate, priority });
            tasks.push(created);
            showToast('Task created!');
        }
        closeTaskModal();
        renderTasks();
        renderStats();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = editingTaskId ? 'Save Changes' : 'Create Task';
    }
}

// ── Delete Task ────────────────────────────────────────
function openDeleteTaskModal(id, name) {
    deletingTaskId = id;
    document.getElementById('deleteTaskName').textContent = `"${name}"`;
    openOverlay('deleteTaskModal');
}

function closeDeleteTaskModal() {
    closeOverlay('deleteTaskModal');
}

async function confirmDeleteTask() {
    if (!deletingTaskId) return;
    const btn = document.querySelector('#deleteTaskModal .btn-danger');
    btn.disabled = true;
    btn.textContent = 'Deleting...';
    try {
        await API.tasks.delete(taskListId, deletingTaskId);
        tasks = tasks.filter(t => t.id !== deletingTaskId);
        showToast('Task deleted');
        closeDeleteTaskModal();
        renderTasks();
        renderStats();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Delete Task';
    }
}

// ── Edit List Modal ────────────────────────────────────
function openEditListModal() {
    if (!currentList) return;
    document.getElementById('editListTitle').value = currentList.title;
    document.getElementById('editListDesc').value = currentList.description || '';
    document.getElementById('editListTitleError').textContent = '';
    openOverlay('editListModal');
    setTimeout(() => document.getElementById('editListTitle').focus(), 100);
}

function closeEditListModal() {
    closeOverlay('editListModal');
}

async function saveEditList() {
    const title = document.getElementById('editListTitle').value.trim();
    const desc = document.getElementById('editListDesc').value.trim();
    const errEl = document.getElementById('editListTitleError');

    if (!title) {
        errEl.textContent = 'Title is required.';
        return;
    }
    errEl.textContent = '';

    const btn = document.querySelector('#editListModal .btn-primary');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
        currentList = await API.taskLists.update(taskListId, title, desc || undefined);
        renderListHeader();
        showToast('List updated!');
        closeEditListModal();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Changes';
    }
}

// ── Helpers ────────────────────────────────────────────
function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(s) {
    return String(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;');
}

// Enter key in task title
document.getElementById('taskTitle')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveTask();
});

// ── Filter button active style ──────────────────────────
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .filter-btn.active {
      background: var(--accent) !important;
      color: #fff !important;
      border-color: var(--accent) !important;
    }
  </style>
`);

// ── Boot ───────────────────────────────────────────────
init();