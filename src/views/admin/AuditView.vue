<template>
  <div class="flex flex-col space-y-2 w-full min-h-full overflow-y-auto">
    <!-- Header title and action buttons -->
    <div class="flex items-center justify-between bg-white px-5 py-3 border border-slate-200 rounded-sm shadow-2xs">
      <div>
        <h4 class="text-base">Audit Logs</h4>
        <p class="text-[12px] text-slate-400">System activity history and security logs</p>
      </div>
      <div class="flex items-center space-x-2">
        <button 
          @click="exportAuditCsv" 
          class="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-sm hover:bg-emerald-700 transition flex items-center space-x-1.5 shadow-2xs"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export to CSV</span>
        </button>
        <button 
          @click="loadAuditLogs" 
          class="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-sm hover:bg-slate-200 transition"
        >
          Refresh Logs
        </button>
      </div>
    </div>
    <!-- Filter controls section -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
      <div class="relative">
        <label class="block text-[11px] text-slate-700 mb-1">Filter by User</label>
        <input 
          v-model="userSearchQuery" 
          type="text" 
          placeholder="Type username..." 
          class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#002D62] focus:outline-none"
          @input="onUserSearchInput"
        />
        <div 
          v-if="showSuggestions && filteredUsers.length > 0" 
          class="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto text-xs"
        >
          <div @click="selectUser(null)" class="px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-400 font-medium border-b border-slate-100">
            -- All Users --
          </div>
          <div 
            v-for="user in filteredUsers" 
            :key="user.id" 
            @click="selectUser(user)"
            class="px-3 py-2 hover:bg-blue-50 hover:text-[#002D62] cursor-pointer flex justify-between items-center"
          >
            <span>@{{ user.username }}</span>
            <span class="text-[10px] text-slate-400 uppercase">({{ user.role }})</span>
          </div>
        </div>
      </div>
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">Start Date</label>
        <input v-model="filters.startDate" type="date" class="w-full p-2 border border-slate-300 rounded-xl text-xs font-medium bg-white" />
      </div>
      <div>
        <label class="block text-[11px] text-slate-700 mb-1">End Date</label>
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
    <!-- Audit logs data table -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-4">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-150 border-y border-slate-200">
          <tr>
            <th class="py-2.5 px-4">ID</th>
            <th class="py-2.5 px-4">User</th>
            <th class="py-2.5 px-4">Action</th>
            <th class="py-2.5 px-4">Details</th>
            <th class="py-2.5 px-4 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="5" class="py-8 text-center text-slate-400 font-medium">
              Loading audit logs...
            </td>
          </tr>
          <template v-else-if="auditLogs.length > 0">
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50 transition">
              <td class="py-2.5 px-4 font-mono text-slate-400">#{{ log.id }}</td>
              <td class="py-2.5 px-4 text-slate-900">
                <span v-if="log.username" class="text-blue-700">@{{ log.username }}</span>
                <span v-else class="text-slate-400 italic">System / Unknown</span>
              </td>
              <td class="py-2.5 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  {{ log.action }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-slate-700">{{ log.details || log.description || 'N/A' }}</td>
              <td class="py-2.5 px-4 font-mono text-slate-400 text-[10px] text-right">{{ formatDate(log.created_at || log.timestamp) }}</td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="py-8 text-center text-slate-400 font-medium">No audit logs found matching criteria.</td>
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
import api from '@/services/api';

const auditLogs = ref([]);
const usersList = ref([]);
const limitPerPage = ref(10);
const currentPage = ref(1);
const totalRecords = ref(0);
const isLoading = ref(false);
const userSearchQuery = ref('');
const selectedUserId = ref(null);
const showSuggestions = ref(false);
const filters = ref({
  startDate: '',
  endDate: ''
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

// Load users list for filter autocomplete
const loadUsersList = async () => {
  try {
    const res = await api.get('/admin/users');
    const data = res.data;
    usersList.value = Array.isArray(data) ? data : (data.users || data.data || []);
  } catch (err) {
    console.error('Error loading users:', err);
  }
};

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return usersList.value;
  const query = userSearchQuery.value.toLowerCase();
  return usersList.value.filter(u => u.username.toLowerCase().includes(query));
});

const onUserSearchInput = () => {
  showSuggestions.value = true;
  if (!userSearchQuery.value) selectedUserId.value = null;
};

const selectUser = (user) => {
  if (user === null) {
    selectedUserId.value = null;
    userSearchQuery.value = '';
  } else {
    selectedUserId.value = user.id;
    userSearchQuery.value = user.username;
  }
  showSuggestions.value = false;
};

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

// Load audit logs from API
const loadAuditLogs = async () => {
  isLoading.value = true;
  try {
    loadPreferences();
    const offset = (currentPage.value - 1) * limitPerPage.value;
    let params = { limit: limitPerPage.value, offset: offset };
    if (selectedUserId.value) params.user_id = selectedUserId.value;
    if (filters.value.startDate) {
      params.start_date = Math.floor(new Date(filters.value.startDate + 'T00:00:00').getTime() / 1000);
    }
    if (filters.value.endDate) {
      params.end_date = Math.floor(new Date(filters.value.endDate + 'T23:59:59').getTime() / 1000);
    }
    const res = await api.get('/admin/audit', { params });
    auditLogs.value = Array.isArray(res.data) ? res.data : [];
    const headers = res.headers || {};
    const totalHeader = headers['x-total-count'] || headers['X-Total-Count'];
    if (totalHeader !== undefined && totalHeader !== null) {
      totalRecords.value = parseInt(totalHeader, 10);
    } else {
      totalRecords.value = auditLogs.value.length;
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    auditLogs.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// Export audit logs report to CSV
const exportAuditCsv = async () => {
  try {
    let params = {};
    if (selectedUserId.value) params.user_id = selectedUserId.value;
    if (filters.value.startDate) {
      params.start_date = Math.floor(new Date(filters.value.startDate + 'T00:00:00').getTime() / 1000);
    }
    if (filters.value.endDate) {
      params.end_date = Math.floor(new Date(filters.value.endDate + 'T23:59:59').getTime() / 1000);
    }
    const res = await api.get('/admin/audit/export-csv', {
      params,
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'audit_logs_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting audit logs CSV:', error);
    alert('Error exporting audit logs CSV report');
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadAuditLogs();
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  loadAuditLogs();
};

const resetFilters = () => {
  userSearchQuery.value = '';
  selectedUserId.value = null;
  filters.value.startDate = '';
  filters.value.endDate = '';
  currentPage.value = 1;
  loadAuditLogs();
};

const formatDate = (dateTimestamp) => {
  if (!dateTimestamp) return 'N/A';
  try {
    const date = typeof dateTimestamp === 'number' ? new Date(dateTimestamp * 1000) : new Date(dateTimestamp);
    return date.toLocaleString();
  } catch {
    return dateTimestamp;
  }
};

onMounted(() => {
  loadPreferences();
  loadUsersList();
  loadAuditLogs();
});
</script>