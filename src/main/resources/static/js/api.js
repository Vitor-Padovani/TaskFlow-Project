/**
 * API module — all calls to the Spring Boot backend
 */
const API = (() => {
    const BASE = '';

    async function request(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body !== undefined) opts.body = JSON.stringify(body);
        const res = await fetch(BASE + path, opts);
        if (res.status === 204) return null;
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            const msg = (data && data.error) || `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return data;
    }

    // ── Task Lists ──────────────────────────────────────
    const taskLists = {
        list: () => request('GET', '/api/task-lists'),

        create: (title, description) =>
            request('POST', '/api/task-lists', { title, description }),

        get: (id) => request('GET', `/api/task-lists/${id}`),

        update: (id, title, description) =>
            request('PUT', `/api/task-lists/${id}`, { id, title, description }),

        delete: (id) => request('DELETE', `/api/task-lists/${id}`),
    };

    // ── Tasks ───────────────────────────────────────────
    const tasks = {
        list: (listId) => request('GET', `/task-lists/${listId}/tasks`),

        create: (listId, { title, description, dueDate, priority }) =>
            request('POST', `/task-lists/${listId}/tasks`, {
                title,
                description: description || null,
                dueDate: dueDate?.includes('T') ? dueDate : dueDate ? dueDate + 'T00:00:00' : null,

                priority,
            }),

        get: (listId, taskId) =>
            request('GET', `/task-lists/${listId}/tasks/${taskId}`),

        update: (listId, taskId, { id, title, description, dueDate, priority, status }) =>
            request('PUT', `/task-lists/${listId}/tasks/${taskId}`, {
                id,
                title,
                description: description || null,
                dueDate: dueDate?.includes('T') ? dueDate : dueDate ? dueDate + 'T00:00:00' : null,
                priority,
                status,
            }),

        delete: (listId, taskId) =>
            request('DELETE', `/task-lists/${listId}/tasks/${taskId}`),
    };

    return { taskLists, tasks };
})();