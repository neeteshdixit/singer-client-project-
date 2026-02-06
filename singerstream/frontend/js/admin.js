async function loadContentList() {
  const container = document.getElementById('contentList');
  if (!container) return;

  try {
    const results = await api.get('/content?limit=100');
    const content = results.content || [];

    if (!content.length) {
      container.innerHTML = '<p>No content uploaded yet.</p>';
      return;
    }

    container.innerHTML = content.map(item => `
      <div class="item">
        <span>${item.title} (${item.type})</span>
        <button class="delete" data-id="${item.id}">Delete</button>
      </div>
    `).join('');

    container.querySelectorAll('button.delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Delete this content?')) return;
        try {
          await api.delete(`/content/${id}`);
          loadContentList();
        } catch (err) {
          alert(err.message || 'Delete failed');
        }
      });
    });
  } catch (error) {
    console.error('Failed to load content list:', error);
    container.innerHTML = '<p>Failed to load content.</p>';
  }
}

async function loadUserList() {
  const container = document.getElementById('userList');
  if (!container) return;

  try {
    const results = await api.get('/admin/users');
    const users = results.users || [];

    if (!users.length) {
      container.innerHTML = '<p>No users found.</p>';
      return;
    }

    container.innerHTML = `
      <div class="user-row header">
        <span>Username</span>
        <span>Email</span>
        <span>Role</span>
        <span>Action</span>
      </div>
      ${users.map(user => `
        <div class="user-row">
          <span>${user.username}</span>
          <span>${user.email || '-'}</span>
          <span>
            <select class="role-select" data-id="${user.id}">
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
              <option value="fan" ${user.role === 'fan' ? 'selected' : ''}>fan</option>
            </select>
          </span>
          <span>
            <button class="save-role" data-id="${user.id}">Save</button>
          </span>
        </div>
      `).join('')}
    `;

    container.querySelectorAll('button.save-role').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const select = container.querySelector(`select.role-select[data-id="${id}"]`);
        const role = select ? select.value : 'fan';

        try {
          await api.put(`/admin/users/${id}/role`, { role });
          loadUserList();
        } catch (err) {
          alert(err.message || 'Role update failed');
        }
      });
    });
  } catch (error) {
    console.error('Failed to load user list:', error);
    container.innerHTML = '<p>Failed to load users.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.requireAdmin()) return;
  const adminLabel = document.getElementById('adminUserLabel');
  const setLabel = (user) => {
    if (!adminLabel) return;
    if (!user) {
      adminLabel.textContent = 'Not logged in';
      return;
    }
    adminLabel.textContent = `Logged in as ${user.username} (${user.role})`;
  };

  setLabel(auth.currentUser);
  api.get('/user/me')
    .then((response) => {
      if (response && response.user) {
        auth.currentUser = response.user;
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setLabel(response.user);
      }
    })
    .catch(() => {
      setLabel(auth.currentUser);
    });

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }

  window.loadContentList = loadContentList;
  loadContentList();
  loadUserList();
});
