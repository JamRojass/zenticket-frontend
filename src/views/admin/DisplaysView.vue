<template>
  <div class="flex flex-col space-y-2 w-full">
    <!-- Header title and action buttons -->
    <div class="flex items-center justify-between bg-white px-5 py-3 border border-slate-200 rounded-sm shadow-2xs">
      <div>
        <h4 class="text-base">Displays Management</h4>
        <p class="text-[12px] text-slate-400">Waiting room monitor and calling screen control</p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="openCreateModal"
          class="px-3 py-1.5 bg-[#002D62] text-white text-xs rounded-sm hover:bg-blue-900 transition"
        >
          + Add Display
        </button>
      </div>
    </div>
    <!-- Filter controls section -->
    <section
      class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
    >
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">Filter by Name</label>
        <input
          v-model="filters.name"
          type="text"
          placeholder="e.g. Lobby TV"
          class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#002D62]"
        />
      </div>
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">Filter by Type</label>
        <select
          v-model="filters.type"
          class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
        >
          <option value="">All Types</option>
          <option value="tv">TV Display</option>
          <option value="kiosk">Kiosk</option>
        </select>
      </div>
      <div class="flex space-x-2">
        <button
          @click="applyFilters"
          class="flex-1 py-2 bg-[#002D62] text-white text-xs rounded-xl hover:bg-blue-900 transition shadow-xs"
        >
          Apply Filters
        </button>
        <button
          @click="resetFilters"
          class="px-3 py-2 bg-slate-100 text-slate-600 text-xs rounded-xl hover:bg-slate-200 transition"
        >
          Reset
        </button>
      </div>
    </section>
    <!-- Displays table -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-150 border-y border-slate-200">
          <tr>
            <th class="py-2.5 px-4">ID</th>
            <th class="py-2.5 px-4">Device Name</th>
            <th class="py-2.5 px-4">Type</th>
            <th class="py-2.5 px-4">Pairing Code</th>
            <!--<th class="py-2.5 px-4">Status</th>-->
            <th class="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="6" class="py-12 text-center text-slate-400 font-medium">Loading devices...</td>
          </tr>
          <template v-else-if="displays.length > 0">
            <tr v-for="d in displays" :key="d.id" class="hover:bg-slate-50 transition">
              <td class="py-2.5 px-4 font-mono text-slate-400">#{{ d.id }}</td>
              <td class="py-2.5 px-4 text-slate-900">{{ d.name }}</td>
              <td class="py-2.5 px-4">
                <span
                  :class="d.type === 'kiosk' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'"
                  class="px-2 py-0.5 rounded text-[10px] uppercase border"
                >
                  {{ d.type || 'tv' }}
                </span>
              </td>
              <td class="py-2.5 px-4 font-mono text-blue-600 tracking-wider">
                {{ d.pairing_code || '------' }}
              </td>
              <!--
              <td class="py-2.5 px-4">
                <span
                  :class="d.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'"
                  class="px-2 py-0.5 rounded-full text-[10px] border"
                >
                  {{ d.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              -->
              <td class="py-2.5 px-4 text-right space-x-2">
                <button
                  @click="regenerateCode(d.id)"
                  class="text-blue-600 hover:underline"
                  title="Regenerate code"
                >
                  <Key class="w-4 h-4 text-indigo-500" />
                </button>
                <button
                  @click="disconnectDisplay(d.id)"
                  class="text-blue-600 hover:underline"
                  title="Disconnect"
                >
                  <LogOut class="w-4 h-4 text-amber-500" />
                </button>
                <!--
                <button
                  @click="toggleDisplayStatus(d.id)"
                  :title="d.is_active ? 'Deactivate' : 'Activate'"
                  class="p-1 transition"
                  :class="d.is_active ? 'hover:text-emerald-500' : 'hover:text-slate-400'"
                >
                  <component 
                    :is="d.is_active ? PowerOff : Power" 
                    :class="d.is_active ? 'w-4 h-4 text-slate-500' : 'w-4 h-4 text-emerald-500'" 
                  />
                </button>
                -->
                <button @click="openEditModal(d)" class="text-blue-600 hover:underline" title="Edit">
                  <Pencil class="w-4 h-4 text-slate-500" />
                </button>
                <button @click="deleteDisplay(d.id)" class="text-rose-600 hover:underline" title="Delete">
                  <Trash2 class="w-4 h-4 text-rose-500" />
                </button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="py-12 text-center text-slate-400 font-medium">
              No devices registered matching criteria.
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination footer controls -->
      <div
        class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3"
      >
        <span>
          Showing page <strong class="text-slate-900">{{ currentPage }}</strong> of
          <strong class="text-slate-900">{{ totalPages || 1 }}</strong>
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
    <!-- Add display modal -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
          <h3 class="text-sm text-slate-900">Add New Display</h3>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div v-if="!newlyCreatedCode">
            <div class="space-y-3">
              <div>
                <label class="block text-[11px] text-slate-700 mb-1">Device Name</label>
                <input
                  v-model="form.name"
                  @input="sanitizeCreateName"
                  placeholder="e.g. Lobby TV or Main Kiosk"
                  class="w-full p-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label class="block text-[11px] text-slate-700 mb-1">Device Type</label>
                <select v-model="form.type" class="w-full p-2 border rounded-xl text-xs bg-white font-medium">
                  <option value="tv">TV Display (Waiting Room Screen)</option>
                  <option value="kiosk">Kiosk (Ticket Generator)</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end space-x-2 pt-4">
              <button
                @click="isModalOpen = false"
                class="px-3 py-1.5 border rounded-xl text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                @click="submitRegisterDisplay"
                class="px-4 py-1.5 bg-[#002D62] text-white rounded-xl text-xs hover:bg-blue-900 shadow"
              >
                Save Display
              </button>
            </div>
          </div>
          <div v-else class="text-center space-y-3 py-2">
            <p class="text-xs text-slate-600">
              Device registered successfully! Use this 6-digit code on the hardware unit:
            </p>
            <div
              class="bg-slate-100 border border-slate-200 py-3 rounded-xl font-mono text-2xl tracking-widest text-[#002D62]"
            >
              {{ newlyCreatedCode }}
            </div>
            <button
              @click="closeModalAndReload"
              class="w-full py-2 bg-[#002D62] text-white rounded-xl text-xs hover:bg-blue-900 shadow"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Edit display modal -->
    <Teleport to="body">
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
          <h3 class="text-base text-slate-900">Edit Display</h3>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Device Name</label>
              <input
                v-model="editForm.name"
                @input="sanitizeEditName"
                placeholder="e.g. Lobby TV or Main Kiosk"
                class="w-full p-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Device Type</label>
              <select v-model="editForm.type" class="w-full p-2 border rounded-xl text-xs bg-white font-medium">
                <option value="tv">TV Display (Waiting Room Screen)</option>
                <option value="kiosk">Kiosk (Ticket Generator)</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <button
              @click="isEditModalOpen = false"
              class="px-3 py-1.5 border rounded-xl text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              @click="submitEditDisplay"
              class="px-4 py-1.5 bg-[#002D62] text-white rounded-xl text-xs hover:bg-blue-900 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { Pencil, Key, LogOut, Trash2, Power, PowerOff } from 'lucide-vue-next';

const displays = ref([]);
const isModalOpen = ref(false);
const isEditModalOpen = ref(false);
const limitPerPage = ref(10);
const currentPage = ref(1);
const totalRecords = ref(0);
const isLoading = ref(false);
const modalErrorMessage = ref('');
const filters = ref({
  name: '',
  type: ''
});
const form = ref({
  name: '',
  type: 'tv'
});
const editForm = ref({
  id: null,
  name: '',
  type: 'tv'
});
const newlyCreatedCode = ref(null);

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

// Sanitization helpers
const sanitizeCreateName = (e) => {
  form.value.name = e.target.value.replace(/[^a-zA-Z0-9\s-_]/g, '');
};
const sanitizeEditName = (e) => {
  editForm.value.name = e.target.value.replace(/[^a-zA-Z0-9\s-_]/g, '');
};

const loadPreferences = () => {
  const savedSettings = localStorage.getItem('admin_settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      if (parsed.perPage) limitPerPage.value = parsed.perPage;
    } catch (e) {
      console.error('Error parsing settings:', e);
    }
  }
};

// Fetch displays from API
const loadDisplays = async () => {
  isLoading.value = true;
  try {
    loadPreferences();
    const offset = (currentPage.value - 1) * limitPerPage.value;
    let params = {
      limit: limitPerPage.value,
      offset: offset
    };
    if (filters.value.name.trim()) {
      params.name = filters.value.name.trim();
    }
    if (filters.value.type) {
      params.type = filters.value.type;
    }
    const res = await api.get('/admin/displays', { params });
    displays.value = Array.isArray(res.data) ? res.data : [];
    const headers = res.headers || {};
    const totalHeader = headers['x-total-count'] || headers['X-Total-Count'];
    if (totalHeader !== undefined && totalHeader !== null && totalHeader !== '') {
      totalRecords.value = parseInt(totalHeader, 10);
    } else {
      totalRecords.value = displays.value.length;
    }
  } catch (error) {
    console.error('Error fetching displays:', error.response?.data || error);
    displays.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadDisplays();
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  loadDisplays();
};

const resetFilters = () => {
  filters.value.name = '';
  filters.value.type = '';
  currentPage.value = 1;
  loadDisplays();
};

const openCreateModal = () => {
  form.value = { name: '', type: 'tv' };
  newlyCreatedCode.value = null;
  modalErrorMessage.value = '';
  isModalOpen.value = true;
};

const openEditModal = (display) => {
  editForm.value = {
    id: display.id,
    name: display.name,
    type: display.type || 'tv'
  };
  modalErrorMessage.value = '';
  isEditModalOpen.value = true;
};

const submitRegisterDisplay = async () => {
  modalErrorMessage.value = '';
  try {
    if (!form.value.name || !form.value.name.trim()) {
      modalErrorMessage.value = 'Please enter a device name.';
      return;
    }
    const res = await api.post('/admin/displays', {
      name: form.value.name.trim(),
      type: form.value.type
    });
    newlyCreatedCode.value = res.data.pairing_code || res.data.code || '------';
    loadDisplays();
  } catch (error) {
    console.error('Error registering device:', error.response?.data || error);
    modalErrorMessage.value = error.response?.data?.detail || 'Error registering device';
  }
};

const submitEditDisplay = async () => {
  modalErrorMessage.value = '';
  try {
    if (!editForm.value.name || !editForm.value.name.trim()) {
      modalErrorMessage.value = 'Please enter a device name.';
      return;
    }
    await api.put(`/admin/displays/${editForm.value.id}`, {
      name: editForm.value.name.trim(),
      type: editForm.value.type
    });
    isEditModalOpen.value = false;
    loadDisplays();
  } catch (error) {
    console.error('Error updating device:', error.response?.data || error);
    modalErrorMessage.value = error.response?.data?.detail || 'Error updating device';
  }
};

const closeModalAndReload = () => {
  isModalOpen.value = false;
  loadDisplays();
};

const toggleDisplayStatus = async (id) => {
  try {
    await api.put(`/admin/displays/${id}/toggle`);
    loadDisplays();
  } catch (error) {
    console.error('Error toggling display status:', error.response?.data || error);
  }
};

const deleteDisplay = async (id) => {
  if (!confirm('Are you sure you want to delete this device?')) return;
  try {
    await api.delete(`/admin/displays/${id}`);
    loadDisplays();
  } catch (error) {
    console.error('Error deleting display:', error.response?.data || error);
  }
};

const regenerateCode = async (id) => {
  if (!confirm('Are you sure you want to regenerate the connection code? The display will need the new code.')) return;
  try {
    const response = await api.post(`/admin/displays/${id}/regenerate-code`);
    alert(`New Connection Code: ${response.data.new_connection_code}`);
    loadDisplays();
  } catch (error) {
    alert(error.response?.data?.detail || 'Error regenerating code');
  }
};

const disconnectDisplay = async (id) => {
  if (!confirm('Are you sure you want to disconnect this display and force its logout?')) return;
  try {
    await api.post(`/admin/displays/${id}/disconnect`);
    alert('Display disconnected successfully.');
    loadDisplays();
  } catch (error) {
    alert(error.response?.data?.detail || 'Error disconnecting display');
  }
};

onMounted(() => {
  loadDisplays();
});
</script>