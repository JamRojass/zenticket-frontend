<template>
  <div class="flex flex-col space-y-2">
    <!-- Header title and action buttons -->
    <div class="flex items-center justify-between bg-white px-5 py-3 border border-slate-200 rounded-sm shadow-2xs">
      <div>
        <h4 class="text-base">Tickets Management</h4>
        <p class="text-[12px] text-slate-400">Queue tracking and service history monitoring</p>
      </div>
      <div class="flex items-center space-x-2">
        <button 
          @click="exportTicketsCsv" 
          class="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-sm hover:bg-emerald-700 transition flex items-center space-x-1.5 shadow-2xs"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export to CSV</span>
        </button>
        <button 
          @click="loadAdminTickets" 
          class="px-3 py-1.5 bg-[#002D62] text-white text-xs rounded-sm hover:bg-blue-900 transition flex items-center space-x-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>
    <!-- Filter controls section -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
      <div>
        <label class="block text-[12px] text-slate-700 mb-1">Filter by Area</label>
        <select v-model="filters.area_id" class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium">
          <option :value="null">All Areas</option>
          <option v-for="area in areasList" :key="area.id" :value="area.id">
            {{ area.name }} ({{ area.short_code }})
          </option>
        </select>
      </div>
      <div>
        <label class="block text-[12px] text-slate-700 mb-1">Filter by Status</label>
        <select v-model="filters.status" class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium">
          <option value="">All Statuses</option>
          <option value="WAITING">WAITING</option>
          <option value="CALLED">CALLED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="DERIVED">DERIVED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
      <div>
        <label class="block text-[12px] text-slate-700 mb-1">Start Date</label>
        <input v-model="filters.startDate" type="date" class="w-full p-2 border border-slate-300 rounded-xl text-xs font-medium bg-white" />
      </div>
      <div>
        <label class="block text-[12px] text-slate-700 mb-1">End Date</label>
        <input v-model="filters.endDate" type="date" class="w-full p-2 border border-slate-300 rounded-xl text-xs font-medium bg-white" />
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
    <!-- Error banner -->
    <div
      v-if="errorMessage"
      class="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center justify-between"
    >
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="text-rose-900">&times;</button>
    </div>
    <!-- Tickets data table -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-150 border-y border-slate-200">
          <tr>
            <th class="py-2.5 px-4">Ticket Code</th>
            <th class="py-2.5 px-4">Area</th>
            <th class="py-2.5 px-4">Station / User</th>
            <th class="py-2.5 px-4">Status</th>
            <th class="py-2.5 px-4 text-right">Created At</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="5" class="py-12 text-center text-slate-400 font-medium">
              Loading tickets history...
            </td>
          </tr>
          <template v-else-if="adminTickets.length > 0">
            <tr v-for="ticket in adminTickets" :key="ticket.id" class="hover:bg-slate-50 transition">
              <td class="py-2.5 px-4 font-mono text-slate-800 text-sm">{{ ticket.ticket_code }}</td>
              <td class="py-2.5 px-4 text-slate-700">{{ ticket.area_name || 'General' }}</td>
              <td class="py-2.5 px-4 text-slate-600">
                <span v-if="ticket.assigned_username">@{{ ticket.assigned_username }}</span>
                <span v-else class="text-slate-400 italic">Unassigned</span>
              </td>
              <td class="py-2.5 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] border font-mono"
                  :class="{
                    'bg-blue-50 text-blue-700 border-blue-200': ticket.status === 'WAITING',
                    'bg-amber-50 text-amber-700 border-amber-200': ticket.status === 'CALLED',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': ticket.status === 'COMPLETED',
                    'bg-indigo-50 text-indigo-700 border-indigo-200': ticket.status === 'DERIVED',
                    'bg-rose-50 text-rose-700 border-rose-200': ticket.status === 'CANCELLED'
                  }"
                >
                  {{ ticket.status }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-right text-slate-400 text-[11px] font-mono">
                {{ formatTimestamp(ticket.created_at) }}
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="py-12 text-center text-slate-400 font-medium">No tickets found matching criteria.</td>
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
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/services/api';

const adminTickets = ref([]);
const areasList = ref([]);
const errorMessage = ref('');
const limitPerPage = ref(10);
const currentPage = ref(1);
const totalRecords = ref(0);
const isLoading = ref(false);
const filters = ref({
  area_id: null,
  status: '',
  startDate: '',
  endDate: ''
});

// Compute total pages
const totalPages = computed(() => {
  if (totalRecords.value === 0 || limitPerPage.value <= 0) return 1;
  return Math.ceil(totalRecords.value / limitPerPage.value);
});

// Compute displayed pagination page range
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

// Load areas for filter dropdown
const loadAreas = async () => {
  try {
    const res = await apiClient.get('/admin/areas');
    areasList.value = Array.isArray(res.data) ? res.data : (res.data.areas || res.data.data || []);
  } catch (err) {
    console.error('Error loading areas for filter', err);
  }
};

// Load table rows per page preference from local storage
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

// Format timestamp into local date and time string
const formatTimestamp = (ts) => {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleString();
};

// Fetch admin tickets history with filters and pagination
const loadAdminTickets = async () => {
  isLoading.value = true;
  try {
    errorMessage.value = '';
    loadPreferences();
    const offset = (currentPage.value - 1) * limitPerPage.value;
    let params = {
      limit: limitPerPage.value,
      offset: offset
    };
    if (filters.value.area_id) params.area_id = filters.value.area_id;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.startDate) {
      params.start_date = Math.floor(new Date(filters.value.startDate + 'T00:00:00').getTime() / 1000);
    }
    if (filters.value.endDate) {
      params.end_date = Math.floor(new Date(filters.value.endDate + 'T23:59:59').getTime() / 1000);
    }
    const res = await apiClient.get('/admin/tickets/history', { params });
    adminTickets.value = Array.isArray(res.data) ? res.data : [];
    const headers = res.headers || {};
    const totalHeader = headers['x-total-count'] || headers['X-Total-Count'];
    if (totalHeader !== undefined && totalHeader !== null && totalHeader !== '') {
      totalRecords.value = parseInt(totalHeader, 10);
    } else {
      totalRecords.value = adminTickets.value.length;
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error loading tickets list';
    adminTickets.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// Export filtered tickets history report to CSV
const exportTicketsCsv = async () => {
  try {
    let params = {};
    if (filters.value.area_id) params.area_id = filters.value.area_id;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.startDate) {
      params.start_date = Math.floor(new Date(filters.value.startDate + 'T00:00:00').getTime() / 1000);
    }
    if (filters.value.endDate) {
      params.end_date = Math.floor(new Date(filters.value.endDate + 'T23:59:59').getTime() / 1000);
    }
    const res = await apiClient.get('/admin/tickets/export-csv', {
      params,
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'tickets_history_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error exporting tickets CSV report';
  }
};

// Change current pagination page
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadAdminTickets();
  }
};

// Apply active search filters
const applyFilters = () => {
  currentPage.value = 1;
  loadAdminTickets();
};

// Reset search filters
const resetFilters = () => {
  filters.value.area_id = null;
  filters.value.status = '';
  filters.value.startDate = '';
  filters.value.endDate = '';
  currentPage.value = 1;
  loadAdminTickets();
};

onMounted(() => {
  loadPreferences();
  loadAreas();
  loadAdminTickets();
});
</script>