<template>
  <div class="min-h-[90vh] w-full flex flex-col bg-white text-slate-900 font-sans p-4 sm:p-10 select-none">
    <!-- Station selection view for operators without an assigned counter workstation -->
    <div v-if="authStore.userRole === 'operator' && !selectedStation" class="min-h-[75vh] flex items-center justify-center w-full">
      <div class="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-xl space-y-6 text-center">
        <div>
          <div class="w-14 h-14 bg-[#002D62] text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-md">
            S
          </div>
          <h2 class="text-xl font-black text-slate-900">Select Work Station</h2>
          <p class="text-xs text-slate-500 mt-1">Department Area: <span class="font-bold text-slate-800">{{ authStore.user?.area_name || 'Assigned Area' }}</span></p>
          <p class="text-[11px] text-slate-400 mt-1">Please choose your physical counter or window to begin attending.</p>
        </div>
        <div v-if="stations.length > 0" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Available Stations</label>
            <select
              v-model="chosenStationId"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D62] bg-white text-xs font-medium"
            >
              <option :value="null" disabled>Select your station...</option>
              <option v-for="st in stations" :key="st.id" :value="st.id">
                {{ st.name }}
              </option>
            </select>
          </div>
          <button
            @click="confirmStationSelection"
            :disabled="!chosenStationId"
            class="w-full py-3.5 bg-[#002D62] hover:bg-blue-900 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl transition shadow-lg"
          >
            Start Working Session
          </button>
        </div>
        <div v-else class="space-y-4 py-4">
          <div class="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            No physical stations registered for your department area. Please contact the administrator.
          </div>
          <button
            @click="handleLogout"
            class="w-full py-3 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-bold text-xs rounded-xl transition shadow-xs"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
    <!-- Main operator control workspace once station is selected -->
    <template v-else>
      <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div class="flex items-center space-x-3">
          <span 
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
              (isPaired && isShiftOpen) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            ]"
          >
            <span 
              :class="[
                'w-2 h-2 mr-1.5 rounded-full',
                (isPaired && isShiftOpen) ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
              ]"
            ></span>
            {{ (isPaired && isShiftOpen) ? 'Connected Live' : 'Disconnected (Shift Closed)' }}
          </span>
          <span class="text-xs text-slate-500 font-medium">
            Station: <strong class="text-slate-800">{{ currentStationName }}</strong>
          </span>
        </div>
        <div class="flex items-center space-x-3">
        </div>
      </div>
      <!-- Shift closed warning banner -->
      <div v-if="!isShiftOpen" class="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between w-full">
        <span>⚠️ The administrative shift is currently closed. Ticket calling and operations are restricted until the shift opens.</span>
      </div>
      <!-- Error notification banner -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-xs flex items-center justify-between w-full"
      >
        <span>{{ errorMessage }}</span>
        <button @click="errorMessage = ''" class="font-bold text-rose-900">&times;</button>
      </div>
      <!-- Main layout grid for active ticket panel and waiting queue list -->
      <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        <div class="lg:col-span-8 w-full">
          <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs relative overflow-hidden flex flex-col justify-center min-h-[420px]">
            <div class="flex items-center justify-between mb-6">
              <span class="text-xs font-bold tracking-wider uppercase text-slate-400">Current Calling Ticket</span>
              <span
                v-if="activeTicket"
                class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 animate-pulse border border-amber-200"
              >
                IN PROGRESS
              </span>
              <span v-else class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                IDLE DESK
              </span>
            </div>
            <!-- Display details of currently active customer being served -->
            <div v-if="activeTicket" class="text-center py-6">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Serving Customer</p>
              <div class="text-7xl sm:text-8xl font-black text-[#002D62] tracking-tight font-mono mb-3">
                {{ activeTicket.ticket_code }}
              </div>
              <p class="text-xl font-bold text-slate-800">
                {{ activeTicket.area_name || authStore.user?.area_name || 'General Attention' }}
              </p>
              <p class="text-xs text-slate-400 mt-2">
                Called at: {{ formatTimestamp(activeTicket.called_at) }}
              </p>
              <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  @click="openConfirm('complete', activeTicket)"
                  class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition flex items-center space-x-2 text-xs"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Finish Attention</span>
                </button>
                <button
                  @click="openDeriveModal"
                  class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition flex items-center space-x-2 text-xs"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Transfer Area</span>
                </button>
                <button
                  @click="openConfirm('return_queue', activeTicket)"
                  class="px-4 py-3 bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-600 border border-slate-200 rounded-xl font-bold transition flex items-center space-x-2 text-xs"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Return to Queue</span>
                </button>
                <button
                  @click="openConfirm('cancel', activeTicket)"
                  class="px-4 py-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl font-bold transition flex items-center space-x-2 text-xs"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel / No Show</span>
                </button>
              </div>
            </div>
            <!-- Idle desk state when no customer is currently active -->
            <div v-else class="text-center py-12">
              <div class="w-16 h-16 mx-auto mb-4 bg-blue-50 text-[#002D62] rounded-2xl flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">No active customer</h3>
              <p class="text-slate-500 text-xs max-w-sm mx-auto mt-1 mb-6">
                You are ready to attend. Call the next available ticket or select one from the waiting queue.
              </p>
              <button
                @click="callNextTicket"
                :disabled="waitingTickets.length === 0 || loading || !isShiftOpen"
                class="px-8 py-3.5 bg-[#002D62] hover:bg-blue-900 disabled:bg-slate-200 text-white rounded-xl font-bold text-xs shadow transition"
              >
                Call Next Ticket
              </button>
            </div>
          </div>
        </div>
        <!-- Waiting queue sidebar panel -->
        <div class="lg:col-span-4 w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col h-[520px]">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 class="font-bold text-slate-900">Waiting Queue</h3>
              <p class="text-[11px] text-slate-400">Total waiting: {{ waitingTickets.length }}</p>
            </div>
            <span class="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-[#002D62] rounded-full border border-blue-100">
              Click to Call
            </span>
          </div>
          <div v-if="waitingTickets.length === 0" class="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <svg class="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xs font-medium">Queue is currently empty</p>
          </div>
          <div v-else class="space-y-3 overflow-y-auto flex-1 pr-1">
            <div
              v-for="ticket in waitingTickets"
              :key="ticket.id"
              @click="isShiftOpen ? promptCallSpecificTicket(ticket) : null"
              :class="[
                'p-4 rounded-xl border bg-white transition flex items-center justify-between group',
                isShiftOpen ? 'border-slate-200 hover:border-[#002D62] hover:shadow-sm cursor-pointer' : 'border-slate-200 opacity-60 cursor-not-allowed'
              ]"
              :title="isShiftOpen ? 'Click to call this specific ticket' : 'Shift is closed'"
            >
              <div>
                <p class="font-mono font-black text-lg text-slate-800 group-hover:text-[#002D62] transition">{{ ticket.ticket_code }}</p>
                <p class="text-[11px] text-slate-500">{{ ticket.area_name || authStore.user?.area_name }}</p>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#002D62] border border-blue-100">
                  WAITING
                </span>
                <p class="text-[10px] text-slate-400 mt-1">
                  {{ formatTimestamp(ticket.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- Ticket transfer (derive) modal dialog -->
    <div
      v-if="isDeriveOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
        <h3 class="text-xl font-bold text-slate-900 mb-1">Transfer Ticket</h3>
        <p class="text-xs text-slate-500 mb-6">Select the destination service area to transfer this ticket.</p>
        <div class="space-y-4 mb-6">
          <label class="block text-xs font-bold text-slate-700 uppercase">Target Area</label>
          <select
            v-model="selectedTargetAreaId"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D62] bg-white text-xs font-medium"
          >
            <option :value="null" disabled>Select an area...</option>
            <option
              v-for="area in availableAreas"
              :key="area.id"
              :value="area.id"
              :disabled="area.id === activeTicket?.area_id"
            >
              {{ area.name }} ({{ area.short_code }})
            </option>
          </select>
        </div>
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="isDeriveOpen = false"
            class="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 text-xs transition"
          >
            Cancel
          </button>
          <button
            @click="confirmDeriveTicket"
            :disabled="!selectedTargetAreaId"
            class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-semibold text-xs shadow transition"
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    </div>
    <!-- Confirmation modal component for ticket actions -->
    <ConfirmModal
      :isOpen="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :isDanger="modalConfig.isDanger"
      :confirmText="modalConfig.confirmText"
      @confirm="handleModalConfirm"
      @cancel="modalConfig.isOpen = false"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

// Redirect admin users away from operator view
if (authStore.userRole === 'admin') {
  router.push('/admin');
}

const stations = ref([]);
const chosenStationId = ref(null);
const userId = authStore.user?.id || 'guest';
const storageKeyId = `operator_station_id_${userId}`;
const storageKeyName = `operator_station_name_${userId}`;
const selectedStation = ref(localStorage.getItem(storageKeyId) || null);
const currentStationName = ref(localStorage.getItem(storageKeyName) || '');
const isPaired = ref(true);
const isShiftOpen = ref(false);
const activeTicket = ref(null);
const waitingTickets = ref([]);
const availableAreas = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const isDeriveOpen = ref(false);
const selectedTargetAreaId = ref(null);
let socket = null;

const modalConfig = ref({
  isOpen: false,
  action: null,
  ticket: null,
  title: '',
  message: '',
  isDanger: false,
  confirmText: 'Confirm',
});

// Check whether an administrative shift is currently active
const checkActiveShift = async () => {
  const companyCode = authStore.user?.company_short_code || authStore.companyCode;
  if (!companyCode) return;
  try {
    const res = await apiClient.get('/operator/shifts/active', {
      params: { company_code: companyCode }
    });
    isShiftOpen.value = !!res.data.active_shift;
  } catch (err) {
    isShiftOpen.value = false;
  }
};

// Load available physical stations for the operator's department area
const loadStations = async () => {
  if (authStore.userRole !== 'operator') return;
  try {
    const res = await apiClient.get('/operator/available-stations');
    stations.value = res.data || [];
  } catch (err) {
    stations.value = [];
  }
};

// Confirm and initialize operator workstation selection
const confirmStationSelection = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const stationId = chosenStationId.value;
    const found = stations.value.find(s => s.id === Number(stationId));
    if (found) {
      selectedStation.value = found.id;
      currentStationName.value = found.name;
      localStorage.setItem(storageKeyId, found.id);
      localStorage.setItem(storageKeyName, found.name);
      await checkActiveShift();
      await loadData();
      connectWebSocket();
    }
    apiClient.post('/operator/tickets/create_session_station', {
      station_id: Number(stationId)
    }).then(res => {
      console.log("Backend response:", res.data);
    }).catch(err => {
      console.error("Background session creation error:", err.response?.data?.detail || err.message);
    });
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error selecting the station';
  } finally {
    loading.value = false;
  }
};

// Handle operator logout and clear station storage
const handleLogout = async () => {
  const userId = authStore.user?.id || 'guest';
  localStorage.removeItem(`operator_station_id_${userId}`);
  localStorage.removeItem(`operator_station_name_${userId}`);
  await authStore.logout();
  router.push('/login');
};

// Format timestamp seconds into readable time string
const formatTimestamp = (ts) => {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Load active ticket and waiting queue data
const loadData = async () => {
  try {
    errorMessage.value = '';
    const [activeRes, waitingRes] = await Promise.all([
      apiClient.get('/tickets/operator/active'),
      apiClient.get('/tickets/operator/waiting'),
    ]);
    activeTicket.value = activeRes.data;
    let allWaiting = waitingRes.data || [];
    if (authStore.user?.area_id) {
      allWaiting = allWaiting.filter(t => t.area_id === authStore.user.area_id);
    }
    waitingTickets.value = allWaiting;
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error loading queue data';
  }
};

// Call the next ticket in the queue for the current station
const callNextTicket = async () => {
  if (!isShiftOpen.value) {
    alert('Cannot call tickets because the shift is closed.');
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    const stationId = selectedStation.value;
    const res = await apiClient.post('/operator/call_next_ticket_by_station', {
      station_id: Number(stationId)
    });
    activeTicket.value = res.data;
    await loadData();
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'No tickets available or error occurred';
  } finally {
    loading.value = false;
  }
};

// Prompt confirmation to call a specific ticket from the queue list
const promptCallSpecificTicket = (ticket) => {
  if (!isShiftOpen.value) return;
  if (activeTicket.value) {
    alert('Please finish or complete your current active ticket before calling another one.');
    return;
  }
  modalConfig.value.action = 'call_specific';
  modalConfig.value.ticket = ticket;
  modalConfig.value.title = 'Call Specific Ticket';
  modalConfig.value.message = `Are you sure you want to call ticket ${ticket.ticket_code} (${ticket.area_name || authStore.user?.area_name})?`;
  modalConfig.value.isDanger = false;
  modalConfig.value.confirmText = 'Call Ticket';
  modalConfig.value.isOpen = true;
};

// Open confirmation modal for ticket actions (complete, return, cancel)
const openConfirm = (action, ticket) => {
  modalConfig.value.action = action;
  modalConfig.value.ticket = ticket;
  if (action === 'complete') {
    modalConfig.value.title = 'Complete Ticket';
    modalConfig.value.message = `Are you sure you want to finalize service for ticket ${ticket.ticket_code}?`;
    modalConfig.value.isDanger = false;
    modalConfig.value.confirmText = 'Finalize';
  } else if (action === 'return_queue') {
    modalConfig.value.title = 'Return to Queue';
    modalConfig.value.message = `Are you sure you want to return ticket ${ticket.ticket_code} back to the waiting queue?`;
    modalConfig.value.isDanger = false;
    modalConfig.value.confirmText = 'Return';
  } else if (action === 'cancel') {
    modalConfig.value.title = 'Cancel Ticket';
    modalConfig.value.message = `Are you sure you want to cancel ticket ${ticket.ticket_code}? This action cannot be undone.`;
    modalConfig.value.isDanger = true;
    modalConfig.value.confirmText = 'Cancel Ticket';
  }
  modalConfig.value.isOpen = true;
};

// Execute confirmed modal action
const handleModalConfirm = async () => {
  const { action, ticket } = modalConfig.value;
  modalConfig.value.isOpen = false;
  try {
    if (action === 'call_specific') {
      loading.value = true;
      errorMessage.value = '';
      const res = await apiClient.post('/operator/call_next_ticket_by_station', {
        station_id: Number(selectedStation.value)
      });
      activeTicket.value = res.data;
      await loadData();
      loading.value = false;
    } else if (action === 'complete') {
      await apiClient.post(`/tickets/operator/${ticket.id}/complete`);
      activeTicket.value = null;
      await loadData();
    } else if (action === 'return_queue') {
      await apiClient.post(`/tickets/operator/${ticket.id}/return`);
      activeTicket.value = null;
      await loadData();
    } else if (action === 'cancel') {
      await apiClient.post(`/tickets/operator/${ticket.id}/cancel`);
      activeTicket.value = null;
      await loadData();
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error performing action';
    loading.value = false;
  }
};

// Open modal to transfer/derive ticket to another area
const openDeriveModal = async () => {
  try {
    const res = await apiClient.get('/admin/areas');
    availableAreas.value = res.data;
    isDeriveOpen.value = true;
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error loading areas';
  }
};

// Confirm ticket transfer to target area
const confirmDeriveTicket = async () => {
  if (!activeTicket.value || !selectedTargetAreaId.value) return;
  try {
    await apiClient.post(`/tickets/operator/${activeTicket.value.id}/derive`, {
      target_area_id: selectedTargetAreaId.value,
    });
    isDeriveOpen.value = false;
    activeTicket.value = null;
    await loadData();
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error transferring ticket';
  }
};

// Establish WebSocket connection for real-time queue synchronization
const connectWebSocket = () => {
  const currentUserId = authStore.user?.id || '';
  const companyShortCode = authStore.user?.company_short_code || authStore.companyCode;
  if (!companyShortCode || !currentUserId) return;
  const wsUrl = `ws://localhost:8000/ws/${companyShortCode}?user_id=${currentUserId}`;
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log(`🟢 [WS CONNECTED] Company Code: ${companyShortCode} | User ID: ${currentUserId}`);
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.action === 'FORCE_LOGOUT') {
        const userId = authStore.user?.id || 'guest';
        localStorage.removeItem(`operator_station_id_${userId}`);
        localStorage.removeItem(`operator_station_name_${userId}`);
        authStore.logout();
        if (socket) socket.close();
        alert(data.reason || 'Your account has been disconnected by the administrator.');
        router.push('/login');
        return;
      }
      if (data.action === 'SHIFT_OPENED') {
        isShiftOpen.value = true;
      } else if (data.action === 'SHIFT_CLOSED') {
        isShiftOpen.value = false;
      }
      if (['TICKET_CREATED', 'TICKET_CALLED', 'TICKET_COMPLETED', 'TICKET_DERIVED', 'TICKET_CANCELLED', 'TICKET_RETURNED'].includes(data.event)) {
        loadData();
      }
    } catch (e) {}
  };
  
  socket.onclose = () => {
    console.log(`🔴 [WS DISCONNECTED] Company Code: ${companyShortCode} | User ID: ${currentUserId}`);
    if (authStore.token) {
      setTimeout(connectWebSocket, 3000);
    }
  };
};

onMounted(() => {
  if (authStore.userRole !== 'admin') {
    if (selectedStation.value) {
      checkActiveShift();
      loadData();
      connectWebSocket();
    } else {
      loadStations();
    }
  }
});

onUnmounted(() => {
  if (socket) socket.close();
});
</script>