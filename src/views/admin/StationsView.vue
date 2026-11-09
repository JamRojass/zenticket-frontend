<template>
  <div class="flex flex-col space-y-2">
    <!-- Header title and action buttons -->
    <div class="flex items-center justify-between bg-white px-5 py-3 border border-slate-200 rounded-sm shadow-2xs">
      <div>
        <h4 class="text-base">Stations management</h4>
        <p class="text-[12px] text-slate-400">Service desk and terminal configuration</p>
      </div>
      <div class="flex items-center space-x-2">
        <button @click="openCreateModal" class="px-3 py-1.5 bg-[#002D62] text-white text-xs rounded-sm hover:bg-blue-900 transition">+ Add station</button>
      </div>
    </div>
    <!-- Filter controls section -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">Filter by station name</label>
        <input 
          v-model="filters.name" 
          type="text" 
          placeholder="e.g. Ventanilla 1" 
          class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#002D62]"
        />
      </div>
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">Filter by area</label>
        <select v-model="filters.area_id" class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium">
          <option :value="null">All Areas</option>
          <option v-for="area in areasList" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
      </div>
      <div class="flex space-x-2">
        <button @click="applyFilters" class="flex-1 py-2 bg-[#002D62] text-white text-xs rounded-xl hover:bg-blue-900 transition shadow-xs">
          Apply filters
        </button>
        <button @click="resetFilters" class="px-3 py-2 bg-slate-100 text-slate-600 text-xs rounded-xl hover:bg-slate-200 transition">
          Reset
        </button>
      </div>
    </section>
    <!-- Stations table -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-150 border-y border-slate-200">
          <tr>
            <th class="py-2.5 px-4">ID</th>
            <th class="py-2.5 px-4">Station Name</th>
            <th class="py-2.5 px-4">Area</th>
            <th class="py-2.5 px-4">Status</th>
            <th class="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="5" class="py-12 text-center text-slate-400 font-medium">
              Loading stations...
            </td>
          </tr>
          <template v-else-if="stations.length > 0">
            <tr v-for="station in stations" :key="station.id" class="hover:bg-slate-50 transition">
              <td class="py-2.5 px-4 font-mono text-slate-400">#{{ station.id }}</td>
              <td class="py-2.5 px-4 text-slate-900">{{ station.name }}</td>
              <td class="py-2.5 px-4 text-slate-700">{{ station.area_name || 'General' }}</td>
              <td class="py-2.5 px-4">
                <span :class="station.is_active !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'" class="px-2 py-0.5 rounded-full text-[10px] border">
                  {{ station.is_active !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-right space-x-2">
                <button @click="openEditModal(station)" class="text-blue-600 hover:underline">
                  <Pencil class="w-4 h-4 text-blue-500" />
                </button>
                <button @click="deleteStation(station.id)" class="text-rose-600 hover:underline">
                  <Trash2 class="w-4 h-4 text-rose-500" />
                </button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="py-12 text-center text-slate-400 font-medium">No stations found matching criteria.</td>
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
    <!-- Add station modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
          <h4 class="text-base">Add New Station</h4>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Station Name</label>
              <input 
                v-model="form.name" 
                @input="sanitizeCreateName"
                placeholder="e.g. Desk 1" 
                class="w-full p-2 border rounded-xl text-xs" 
              />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Area</label>
              <select v-model="form.area_id" class="w-full p-2 border rounded-xl text-xs bg-white font-medium">
                <option :value="null">Select Area</option>
                <option v-for="area in areasList" :key="area.id" :value="area.id">{{ area.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-2">
            <button @click="isModalOpen = false" class="px-3 py-1.5 border rounded-xl text-xs hover:bg-slate-50">Cancel</button>
            <button @click="submitRegisterStation" class="px-4 py-1.5 bg-[#002D62] text-white rounded-xl text-xs hover:bg-blue-900 shadow">Save Station</button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Edit station modal -->
    <Teleport to="body">
      <div v-if="isEditModalOpen" class="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
          <h3 class="text-sm text-slate-900">Edit Station</h3>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Station Name</label>
              <input 
                v-model="editForm.name" 
                @input="sanitizeEditName"
                placeholder="e.g. Desk 1" 
                class="w-full p-2 border rounded-xl text-xs" 
              />
            </div>
            <div>
              <label class="block text-[11px] text-slate-700 mb-1">Area</label>
              <select v-model="editForm.area_id" class="w-full p-2 border rounded-xl text-xs bg-white font-medium">
                <option :value="null">Select Area</option>
                <option v-for="area in areasList" :key="area.id" :value="area.id">{{ area.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-2">
            <button @click="isEditModalOpen = false" class="px-3 py-1.5 border rounded-xl text-xs hover:bg-slate-50">Cancel</button>
            <button @click="submitEditStation" class="px-4 py-1.5 bg-[#002D62] text-white rounded-xl text-xs hover:bg-blue-900 shadow">Update changes</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { Pencil, Key, LogOut, Trash2 } from 'lucide-vue-next';

const stations = ref([]);
const areasList = ref([]);
const isModalOpen = ref(false);
const isEditModalOpen = ref(false);
const modalErrorMessage = ref('');
const limitPerPage = ref(10);
const currentPage = ref(1);
const totalRecords = ref(0);
const isLoading = ref(false);
const filters = ref({
  area_id: null,
  name: ''
});
const form = ref({
  name: '',
  area_id: null
});
const editForm = ref({
  id: null,
  name: '',
  area_id: null
});

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
  form.value.name = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
};
const sanitizeEditName = (e) => {
  editForm.value.name = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
};

const loadPreferences = () => {
  const savedSettings = localStorage.getItem('admin_settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      if (parsed.perPage) limitPerPage.value = parsed.perPage;
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }
};

const loadAreas = async () => {
  try {
    const res = await api.get('/admin/areas');
    areasList.value = Array.isArray(res.data) ? res.data : (res.data.areas || res.data.data || []);
  } catch (err) {
    console.error('Error loading areas:', err);
  }
};

// Fetch stations from API
const loadStations = async () => {
  isLoading.value = true;
  try {
    loadPreferences();
    const offset = (currentPage.value - 1) * limitPerPage.value;
    let params = {
      limit: limitPerPage.value,
      offset: offset
    };
    if (filters.value.area_id) params.area_id = filters.value.area_id;
    if (filters.value.name.trim()) params.name = filters.value.name.trim();
    const res = await api.get('/admin/stations', { params });
    stations.value = Array.isArray(res.data) ? res.data : [];
    const headers = res.headers || {};
    const totalHeader = headers['x-total-count'] || headers['X-Total-Count'];
    if (totalHeader !== undefined && totalHeader !== null && totalHeader !== '') {
      totalRecords.value = parseInt(totalHeader, 10);
    } else {
      totalRecords.value = stations.value.length;
    }
  } catch (error) {
    console.error('Error fetching stations:', error);
    stations.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadStations();
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  loadStations();
};

const resetFilters = () => {
  filters.value.area_id = null;
  filters.value.name = '';
  currentPage.value = 1;
  loadStations();
};

const openCreateModal = () => {
  form.value = { name: '', area_id: null };
  modalErrorMessage.value = '';
  isModalOpen.value = true;
};

const openEditModal = (station) => {
  editForm.value = { 
    id: station.id, 
    name: station.name, 
    area_id: station.area_id 
  };
  modalErrorMessage.value = '';
  isEditModalOpen.value = true;
};

const submitRegisterStation = async () => {
  modalErrorMessage.value = '';
  if (!form.value.name || !form.value.name.trim() || !form.value.area_id) {
    modalErrorMessage.value = 'All fields are mandatory and cannot be left blank.';
    return;
  }
  try {
    await api.post('/admin/stations', {
      name: form.value.name.trim(),
      area_id: form.value.area_id
    });
    isModalOpen.value = false;
    loadStations();
  } catch (error) {
    modalErrorMessage.value = error.response?.data?.detail || 'Error registering station';
  }
};

const submitEditStation = async () => {
  modalErrorMessage.value = '';
  if (!editForm.value.name || !editForm.value.name.trim() || !editForm.value.area_id) {
    modalErrorMessage.value = 'All fields are mandatory and cannot be left blank.';
    return;
  }
  try {
    await api.put(`/admin/stations/${editForm.value.id}`, {
      name: editForm.value.name.trim(),
      area_id: editForm.value.area_id
    });
    isEditModalOpen.value = false;
    loadStations();
  } catch (error) {
    modalErrorMessage.value = error.response?.data?.detail || 'Error updating station';
  }
};

const deleteStation = async (id) => {
  if (!confirm('Are you sure you want to delete this station?')) return;
  try {
    await api.delete(`/admin/stations/${id}`);
    loadStations();
  } catch (error) {
    alert(error.response?.data?.detail || 'Error deleting station');
  }
};

onMounted(() => {
  loadPreferences();
  loadAreas();
  loadStations();
});
</script>