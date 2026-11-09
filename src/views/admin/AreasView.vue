<template>
  <div class="flex flex-col space-y-2">
    <!-- Header title and action buttons -->
    <div class="flex items-center justify-between bg-white px-5 py-3 border border-slate-200 rounded-sm shadow-2xs">
      <div>
        <h2 class="text-base">Areas Management</h2>
        <p class="text-[12px] text-slate-400">Areas administration and management</p>
      </div>
      <div class="flex items-center space-x-2">
        <button 
          v-if="areas.length < 3" 
          @click="openCreateAreaModal" 
          class="px-3 py-1.5 bg-[#002D62] text-white text-xs rounded-sm hover:bg-blue-900 transition"
        >
          + Add Area
        </button>
        <span v-else class="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Maximum limit reached (3/3)
        </span>
      </div>
    </div>
    <div v-if="globalErrorMessage" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex justify-between items-center">
      <span>{{ globalErrorMessage }}</span>
      <button @click="globalErrorMessage = ''">&times;</button>
    </div>
    <!-- Areas table -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-150 border-y border-slate-200">
          <tr>
            <th class="py-2.5 px-4">ID</th>
            <th class="py-2.5 px-4">Name</th>
            <th class="py-2.5 px-4">Prefix</th>
            <th class="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="area in areas" :key="area.id">
            <td class="py-2.5 px-4">#{{ area.id }}</td>
            <td class="py-2.5 px-4">{{ area.name }}</td>
            <td class="py-2.5 px-4">{{ area.short_code }}-XX</td>
            <td class="py-2.5 px-4 text-right space-x-2">
              <button @click="openEditArea(area)" class="text-blue-600 hover:underline" title="Edit">
                <Pencil class="w-4 h-4 text-blue-500" />
              </button>
              <button @click="deleteArea(area.id)" class="text-red-600 hover:underline" title="Delete">
                <Trash2 class="w-4 h-4 text-rose-500" />
              </button>
            </td>
          </tr>
          <tr v-if="areas.length === 0">
            <td colspan="4" class="py-4 text-center text-slate-400">No service areas registered yet.</td>
          </tr>
        </tbody>
      </table>
      <p class="text-[11px] text-slate-400 mt-2">Maximum limit: 3 service areas allowed.</p>
    </section>
    <!-- Add area modal -->
    <Teleport to="body">
      <div v-if="isCreateAreaOpen" class="fixed top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full space-y-3 shadow-xl">
          <h4 class="text-sm text-slate-900">Add New Area</h4>
          <div v-if="areas.length >= 3" class="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            You have reached the maximum limit of 3 service areas. You cannot create more.
          </div>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div v-if="areas.length < 3" class="space-y-3">
            <div class="space-y-1">
              <label class="block text-xs text-slate-700">Area Name</label>
              <input 
                v-model="newArea.name" 
                @input="sanitizeCreateName"
                placeholder="e.g. Cashier" 
                class="w-full p-2 border rounded text-xs" 
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs text-slate-700">Prefix Code</label>
              <input 
                v-model="newArea.short_code" 
                @input="sanitizeCreatePrefix"
                placeholder="e.g. C" 
                maxlength="3" 
                class="w-full p-2 border rounded text-xs uppercase" 
              />
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-2">
            <button @click="isCreateAreaOpen = false" class="px-3 py-1 border rounded text-xs">Cancel</button>
            <button 
              v-if="areas.length < 3" 
              @click="submitCreateArea" 
              class="px-3 py-1 bg-[#002D62] text-white rounded text-xs"
            >
              Save Area
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Edit area modal -->
    <Teleport to="body">
      <div v-if="isEditAreaOpen" class="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full space-y-3 shadow-xl">
          <h4 class="text-sm text-slate-900">Edit Area</h4>
          <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {{ modalErrorMessage }}
          </div>
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="block text-xs text-slate-700">Area Name</label>
              <input 
                v-model="editAreaForm.name" 
                @input="sanitizeEditName"
                placeholder="Area Name" 
                class="w-full p-2 border rounded text-xs" 
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs text-slate-700">Prefix Code</label>
              <input 
                v-model="editAreaForm.short_code" 
                @input="sanitizeEditPrefix"
                placeholder="Prefix Code" 
                maxlength="3" 
                class="w-full p-2 border rounded text-xs uppercase" 
              />
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-2">
            <button @click="isEditAreaOpen = false" class="px-3 py-1 border rounded text-xs">Cancel</button>
            <button @click="submitEditArea" class="px-3 py-1 bg-[#002D62] text-white rounded text-xs">Update Area</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { Pencil, Trash2 } from 'lucide-vue-next';

const areas = ref([]);
const isCreateAreaOpen = ref(false);
const isEditAreaOpen = ref(false);
const globalErrorMessage = ref('');
const modalErrorMessage = ref('');
const newArea = ref({ name: '', short_code: '' });
const editAreaForm = ref({ id: null, name: '', short_code: '' });

// Sanitization helpers
const sanitizeCreateName = (e) => {
  newArea.value.name = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
};
const sanitizeEditName = (e) => {
  editAreaForm.value.name = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
};
const sanitizeCreatePrefix = (e) => {
  newArea.value.short_code = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};
const sanitizeEditPrefix = (e) => {
  editAreaForm.value.short_code = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

// Fetch areas from API
const loadAreas = async () => {
  try {
    const res = await api.get('/admin/areas');
    areas.value = Array.isArray(res.data) ? res.data : (res.data.areas || res.data.data || []);
  } catch (error) {
    console.error('Error fetching areas:', error);
    globalErrorMessage.value = 'Failed to load service areas.';
  }
};

const openCreateAreaModal = () => {
  if (areas.value.length >= 3) return;
  newArea.value = { name: '', short_code: '' };
  modalErrorMessage.value = '';
  isCreateAreaOpen.value = true;
};

const submitCreateArea = async () => {
  modalErrorMessage.value = '';
  if (areas.value.length >= 3) {
    modalErrorMessage.value = 'Maximum limit of 3 service areas reached.';
    return;
  }
  if (!newArea.value.name || !newArea.value.name.trim() || !newArea.value.short_code || !newArea.value.short_code.trim()) {
    modalErrorMessage.value = 'All fields are mandatory and cannot be left blank.';
    return;
  }
  try {
    await api.post('/admin/areas', newArea.value);
    isCreateAreaOpen.value = false;
    loadAreas();
  } catch (error) {
    console.error('Error creating area:', error);
    modalErrorMessage.value = error.response?.data?.detail || 'Error creating area.';
  }
};

const openEditArea = (area) => {
  editAreaForm.value = { ...area };
  modalErrorMessage.value = '';
  isEditAreaOpen.value = true;
};

const submitEditArea = async () => {
  modalErrorMessage.value = '';
  if (!editAreaForm.value.name || !editAreaForm.value.name.trim() || !editAreaForm.value.short_code || !editAreaForm.value.short_code.trim()) {
    modalErrorMessage.value = 'All fields are mandatory and cannot be left blank.';
    return;
  }
  try {
    await api.put(`/admin/areas/${editAreaForm.value.id}`, {
      name: editAreaForm.value.name,
      short_code: editAreaForm.value.short_code
    });
    isEditAreaOpen.value = false;
    loadAreas();
  } catch (error) {
    console.error('Error updating area:', error);
    modalErrorMessage.value = error.response?.data?.detail || 'Error updating area.';
  }
};

const deleteArea = async (id) => {
  if (!confirm('Are you sure you want to deactivate this service area?')) return;
  try {
    await api.delete(`/admin/areas/${id}`);
    loadAreas();
  } catch (error) {
    globalErrorMessage.value = error.response?.data?.detail || 'Error deleting area';
  }
};

onMounted(() => {
  loadAreas();
});
</script>