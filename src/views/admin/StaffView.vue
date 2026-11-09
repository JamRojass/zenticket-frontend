<template>
  <div class="flex flex-col space-y-2 w-full">
    <!-- Header title and action buttons -->
    <div class="flex items-center justify-between bg-white px-5 py-3 border border-slate-200 rounded-sm shadow-2xs">
      <div>
        <h4 class="text-base">Staff Management</h4>
        <p class="text-[12px] text-slate-400">Personnel administration and access control</p>
      </div>
      <div class="flex items-center space-x-2">
        <button @click="openCreateUserModal" class="px-3 py-1.5 bg-[#002D62] text-white text-xs rounded-sm hover:bg-blue-900 transition">+ Add Staff</button>
      </div>
    </div>
    <!-- Filter controls section -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">Filter by username</label>
        <input 
          v-model="filters.username" 
          type="text" 
          placeholder="e.g. users" 
          class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#002D62]"
        />
      </div>
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">Filter by area</label>
        <select v-model="filters.area_id" class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium">
          <option :value="null">All Areas</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
      </div>
      <div class="flex space-x-2">
        <button @click="applyFilters" class="flex-1 py-2 bg-[#002D62] text-white text-xs rounded-xl hover:bg-blue-900 transition shadow-xs">
          Apply Filters
        </button>
        <button @click="resetFilters" class="px-3 py-2 bg-slate-100 text-slate-600 text-xs rounded-xl hover:bg-slate-200 transition">
          Reset
        </button>
      </div>
    </section>
    <!-- Staff records table -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-150 border-y border-slate-200">
          <tr>
            <th class="py-2.5 px-4">Username</th>
            <th class="py-2.5 px-4">Full name</th>
            <th class="py-2.5 px-4">Role</th>
            <th class="py-2.5 px-4">Area</th>
            <th class="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="5" class="py-12 text-center text-slate-400 font-medium">
              Loading staff records...
            </td>
          </tr>
          <template v-else-if="users.length > 0">
            <tr v-for="u in users" :key="u.id || u.username" class="hover:bg-slate-50 transition">
              <td class="py-2.5 px-4 text-slate-900">@{{ u.username }}</td>
              <td class="py-2.5 px-4 text-slate-700">{{ u.fullname || u.full_name || 'N/A' }}</td>
              <td class="py-2.5 px-4 uppercase text-[10px] text-blue-700">{{ u.role }}</td>
              <td class="py-2.5 px-4 text-slate-600">{{ getAreaName(u.area_id) }}</td>
              <td class="py-2.5 px-4 text-right space-x-2">
                <button @click="openChangePassword(u)" class="text-purple-600 hover:underline" title="Change password">
                  <Key class="w-4 h-4 text-indigo-500" />
                </button>
                <button v-if="u.role !== 'admin'" @click="disconnectStaff(u)" class="text-amber-600 hover:underline" title="Disconnect">
                  <LogOut class="w-4 h-4 text-amber-500" />
                </button>
                <button @click="openEditUser(u)" class="text-blue-600 hover:underline" title="Edit">
                  <Pencil class="w-4 h-4 text-blue-500" />
                </button>
                <button v-if="u.role !== 'admin'" @click="deleteStaff(u)" class="text-red-600 hover:underline" title="Delete">
                  <Trash2 class="w-4 h-4 text-rose-500" />
                </button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="py-12 text-center text-slate-400 font-medium">No staff accounts registered yet.</td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination footer controls -->
      <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
        <span>
          Showing page <strong class="text-slate-900">{{ currentPage }}</strong> of <strong class="text-slate-900">{{ totalPages || 1 }}</strong> 
          <span class="text-slate-400 ml-1">(Total: {{ totalRecords }} records)</span>
        </span>
        <div class="flex items-center space-x-1">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs mr-1"
          >
            &larr; Previous
          </button>
          <button 
            v-for="page in displayedPages" 
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-1.5 border rounded-lg transition shadow-2xs',
              currentPage === page 
                ? 'bg-[#002D62] text-white border-[#002D62]' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            ]"
          >
            {{ page }}
          </button>
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs ml-1"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </section>
    <!-- Create staff modal -->
    <Teleport to="body">
      <div v-if="isCreateUserOpen" class="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3 shadow-xl">
          <h4 class="text-base">Add New Staff</h4>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div class="space-y-2">
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Full Name</label>
              <input 
                v-model="newUser.fullname" 
                @input="sanitizeCreateFullname"
                placeholder="e.g. John Doe" 
                class="w-full p-2 border rounded-xl text-xs" 
              />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Username (Immutable)</label>
              <input 
                v-model="newUser.username" 
                @input="sanitizeCreateUsername"
                placeholder="e.g. operator1" 
                class="w-full p-2 border rounded-xl text-xs" 
              />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Password</label>
              <input v-model="newUser.password" type="password" placeholder="••••••••" class="w-full p-2 border rounded-xl text-xs" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Role</label>
              <input type="text" disabled value="Operator" class="w-full p-2 border rounded-xl text-xs bg-slate-100 text-slate-500 font-medium cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Area</label>
              <select v-model="newUser.area_id" class="w-full p-2 border rounded-xl text-xs bg-white font-medium">
                <option value="" disabled>Select Area</option>
                <option v-for="area in areas" :value="area.id" :key="area.id">{{ area.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-3">
            <button @click="isCreateUserOpen = false" class="px-3 py-1.5 border rounded-xl text-xs hover:bg-slate-50">Cancel</button>
            <button @click="submitCreateUser" class="px-4 py-1.5 bg-[#002D62] text-white rounded-xl text-xs hover:bg-blue-900 shadow">Save Staff</button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Edit staff modal -->
    <Teleport to="body">
      <div v-if="isEditUserOpen" class="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full space-y-3 shadow-xl">
          <h4 class="text-base">Edit Staff</h4>
          <p class="text-[11px] text-slate-400">Username <span class="text-slate-700">@{{ editUserForm.username }}</span> is immutable.</p>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div class="space-y-2">
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Full Name</label>
              <input 
                v-model="editUserForm.fullname" 
                @input="sanitizeEditFullname"
                placeholder="Full Name" 
                class="w-full p-2 border rounded text-xs" 
              />
            </div>
            <div v-if="editUserForm.role !== 'admin'">
              <label class="block text-[11px] text-slate-700 mb-1">Area</label>
              <select v-model="editUserForm.area_id" class="w-full p-2 border rounded text-xs bg-white font-medium">
                <option value="" disabled>Select Area</option>
                <option v-for="area in areas" :value="area.id" :key="area.id">{{ area.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-2">
            <button @click="isEditUserOpen = false" class="px-3 py-1 border rounded text-xs">Cancel</button>
            <button @click="submitEditUser" class="px-3 py-1 bg-[#002D62] text-white rounded text-xs">Save Changes</button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Change staff password modal -->
    <Teleport to="body">
      <div v-if="isChangePasswordOpen" class="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
        <div class="bg-white rounded p-6 max-w-sm w-full space-y-3 shadow-xl">
          <h3 class="text-sm text-slate-900">Change Password for @{{ passwordForm.username }}</h3>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div class="space-y-2">
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">New Password</label>
              <input v-model="passwordForm.newPassword" type="password" placeholder="New Password" class="w-full p-2 border rounded text-xs" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Confirm Password</label>
              <input v-model="passwordForm.confirmPassword" type="password" placeholder="Confirm Password" class="w-full p-2 border rounded text-xs" />
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-2">
            <button @click="isChangePasswordOpen = false" class="px-3 py-1 border rounded text-xs">Cancel</button>
            <button @click="submitChangePassword" class="px-3 py-1 bg-[#002D62] text-white rounded text-xs">Update Password</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { Pencil, Key, LogOut, Trash2 } from 'lucide-vue-next';

const users = ref([]);
const areas = ref([]);
const limitPerPage = ref(10);
const currentPage = ref(1);
const totalRecords = ref(0);
const isLoading = ref(false);
const filters = ref({
  area_id: null,
  username: ''
});
const isCreateUserOpen = ref(false);
const isEditUserOpen = ref(false);
const isChangePasswordOpen = ref(false);
const newUser = ref({ username: '', fullname: '', password: '', role: 'operator', area_id: '' });
const editUserForm = ref({ id: null, username: '', fullname: '', role: '', area_id: '' });
const passwordForm = ref({ userId: null, username: '', newPassword: '' });
const modalErrorMessage = ref('');

// Load per-page preferences from local storage
const loadPreferences = () => {
  const savedSettings = localStorage.getItem('admin_settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      if (parsed.perPage) limitPerPage.value = parsed.perPage;
    } catch (e) {
      console.error('Error loading preferences', e);
    }
  }
};

const totalPages = computed(() => {
  if (totalRecords.value === 0 || limitPerPage.value <= 0) return 1;
  return Math.ceil(totalRecords.value / limitPerPage.value);
});

const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const range = [];
  let start = Math.max(1, current - 2);
  let end = Math.min(total, start + 4);
  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});

// Load staff user accounts from API
const loadUsers = async () => {
  isLoading.value = true;
  try {
    loadPreferences();
    const offset = (currentPage.value - 1) * limitPerPage.value;
    let params = {
      limit: limitPerPage.value,
      offset: offset
    };
    if (filters.value.area_id) params.area_id = filters.value.area_id;
    if (filters.value.username.trim()) params.username = filters.value.username.trim();
    const res = await api.get('/admin/users', { params });
    const data = res.data;
    users.value = Array.isArray(data) ? data : (data.users || data.data || []);
    totalRecords.value = data.total !== undefined ? data.total : users.value.length;
  } catch (error) {
    console.error('Error fetching users:', error);
    users.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadUsers();
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  loadUsers();
};

const resetFilters = () => {
  filters.value.area_id = null;
  filters.value.username = '';
  currentPage.value = 1;
  loadUsers();
};

// Load department areas
const loadAreas = async () => {
  try {
    const res = await api.get('/admin/areas');
    const data = res.data;
    areas.value = Array.isArray(data) ? data : (data.areas || data.data || []);
  } catch (error) {
    console.error('Error fetching areas:', error);
  }
};

const getAreaName = (areaId) => {
  if (!areaId) return 'N/A';
  const found = areas.value.find(a => a.id === areaId);
  return found ? found.name : 'N/A';
};

const openCreateUserModal = () => {
  newUser.value = { username: '', fullname: '', password: '', role: 'operator', area_id: '' };
  modalErrorMessage.value = '';
  isCreateUserOpen.value = true;
};

// Input sanitization helpers
const sanitizeCreateFullname = (e) => {
  newUser.value.fullname = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
};
const sanitizeCreateUsername = (e) => {
  newUser.value.username = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
};
const sanitizeEditFullname = (e) => {
  editUserForm.value.fullname = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
};

const submitCreateUser = async () => {
  modalErrorMessage.value = '';
  if (!newUser.value.fullname || !newUser.value.fullname.trim() ||
      !newUser.value.username || !newUser.value.username.trim() ||
      !newUser.value.password || !newUser.value.password.trim() ||
      !newUser.value.area_id) {
    modalErrorMessage.value = 'All fields are mandatory and cannot be left blank.';
    return;
  }
  try {
    await api.post('/admin/users', {
      username: newUser.value.username.trim(),
      fullname: newUser.value.fullname.trim(),
      password: newUser.value.password,
      role: 'operator',
      area_id: newUser.value.area_id
    });
    isCreateUserOpen.value = false;
    loadUsers();
  } catch (error) {
    console.error('Error creating user account:', error);
    modalErrorMessage.value = error.response?.data?.detail || 'Error creating user account.';
  }
};

const submitEditUser = async () => {
  modalErrorMessage.value = '';
  if (!editUserForm.value.fullname || !editUserForm.value.fullname.trim() ||
      (editUserForm.value.role !== 'admin' && !editUserForm.value.area_id)) {
    modalErrorMessage.value = 'All fields are mandatory and cannot be left blank.';
    return;
  }
  try {
    await api.put(`/admin/users/${editUserForm.value.id}`, {
      username: editUserForm.value.username,
      fullname: editUserForm.value.fullname.trim(),
      area_id: editUserForm.value.role !== 'admin' ? editUserForm.value.area_id : undefined
    });
    isEditUserOpen.value = false;
    loadUsers();
  } catch (error) {
    console.error('Error updating user member:', error);
    modalErrorMessage.value = error.response?.data?.detail || 'Error updating user member.';
  }
};

const submitChangePassword = async () => {
  modalErrorMessage.value = '';
  if (!passwordForm.value.newPassword || !passwordForm.value.newPassword.trim() ||
      !passwordForm.value.confirmPassword || !passwordForm.value.confirmPassword.trim()) {
    modalErrorMessage.value = 'Password fields cannot be left blank.';
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    modalErrorMessage.value = 'Passwords do not match.';
    return;
  }
  try {
    await api.put(`/admin/users/${passwordForm.value.userId}/password`, {
      password: passwordForm.value.newPassword
    });
    isChangePasswordOpen.value = false;
    alert('Password updated successfully.');
  } catch (error) {
    console.error('Error updating password:', error);
    modalErrorMessage.value = error.response?.data?.detail || 'Error updating password.';
  }
};

const openEditUser = (user) => {
  editUserForm.value = { 
    id: user.id, 
    username: user.username, 
    fullname: user.fullname || user.full_name || '', 
    role: user.role, 
    area_id: user.area_id || '' 
  };
  modalErrorMessage.value = '';
  isEditUserOpen.value = true;
};

const openChangePassword = (user) => {
  passwordForm.value = { userId: user.id, username: user.username, newPassword: '' };
  modalErrorMessage.value = '';
  isChangePasswordOpen.value = true;
};

const disconnectStaff = async (user) => {
  if (!confirm(`Are you sure you want to disconnect @${user.username}? This will release their station and reset active tickets.`)) return;
  try {
    await api.post(`/admin/users/${user.id}/disconnect`);
    alert(`Staff @${user.username} has been disconnected.`);
    loadUsers();
  } catch (error) {
    console.error('Error disconnecting user:', error);
    alert(error.response?.data?.detail || 'Failed to disconnect user.');
  }
};

const deleteStaff = async (user) => {
  if (!confirm(`Are you sure you want to soft-delete staff account @${user.username}?`)) return;
  try {
    await api.delete(`/admin/users/${user.id}`);
    alert(`Staff @${user.username} deleted successfully.`);
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert(error.response?.data?.detail || 'Failed to delete user.');
  }
};

onMounted(() => {
  loadAreas();
  loadUsers();
});
</script>