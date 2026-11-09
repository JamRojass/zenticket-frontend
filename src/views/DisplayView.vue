<template>
  <div
    class="min-h-screen bg-white text-slate-900 flex flex-col justify-between select-none font-sans w-full"
  >
    <!-- Display pairing view before entering 6-digit PIN code -->
    <div v-if="!isPaired" class="min-h-[85vh] flex items-center justify-center w-full">
      <div class="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-xl space-y-6 text-center">
        <div>
          <div class="w-14 h-14 bg-[#002D62] text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-md">
            TV
          </div>
          <h2 class="text-xl font-black text-slate-900">Display Connection</h2>
          <p class="text-xs text-slate-500 mt-1">Company Code: <span class="font-mono text-[#002D62] uppercase font-bold">{{ companyCode }}</span></p>
          <p class="text-[11px] text-slate-400 mt-1">Enter the 6-digit pairing code generated from your admin panel.</p>
        </div>
        <div class="space-y-3">
          <input 
            v-model="pairingCode" 
            type="text" 
            maxlength="6" 
            placeholder="000000" 
            class="w-full py-3 bg-white border border-slate-200 rounded-xl text-center font-mono text-2xl tracking-widest text-slate-900 focus:outline-none focus:border-[#002D62] uppercase shadow-2xs"
          />
          <button 
            @click="pairDisplay" 
            class="w-full py-3.5 bg-[#002D62] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition shadow-lg"
          >
            Connect Screen
          </button>
        </div>
      </div>
    </div>
    <!-- Paired TV waiting room display board -->
    <template v-else>
      <header class="w-full h-[60px] flex items-center justify-between border-b border-slate-100 px-4 sm:px-6">
        <div class="flex items-center space-x-3.5">
          <img
            src="@/assets/zenticket-logo.svg"
            alt="Zenticket"
            class="h-12 w-auto transition-transform"
          />
        </div>
        <div class="flex items-center space-x-6">
          <div class="font-mono text-4xl font-black text-slate-800 tracking-wide">{{ currentTime }}</div>
          <button
            @click="disconnectDisplay"
            class="text-xs text-rose-600 hover:text-rose-700 font-bold underline transition"
          >
            Exit
          </button>
        </div>
      </header>
      <main class="w-full my-6 px-4 sm:px-6 flex-1 flex flex-col">
        <div v-if="loading" class="text-center py-20 my-auto">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#002D62] border-t-transparent"></div>
          <p class="mt-4 text-slate-500 font-medium text-xs">Synchronizing queue display...</p>
        </div>
        <div v-else class="grid gap-6 flex-1 items-start" :style="{ gridTemplateColumns: `repeat(${gridColumnsCount}, minmax(0, 1fr))` }">
          <!-- Waiting queue summary column -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col h-[70vh] shadow-2xs">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <h3 class="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Pending Queue</h3>
              <span class="px-2.5 py-0.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-full">
                {{ waitingTickets.length }}
              </span>
            </div>
            <div v-if="waitingTickets.length === 0" class="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <p>No waiting tickets</p>
            </div>
            <div v-else class="space-y-3 overflow-y-auto flex-1 pr-1">
              <div
                v-for="ticket in waitingTickets"
                :key="ticket.id"
                class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between"
              >
                <span class="font-mono font-black text-xl text-slate-900">{{ ticket.ticket_code }}</span>
                <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {{ ticket.area_name }}
                </span>
              </div>
            </div>
          </div>
          <!-- Service area active calling columns -->
          <div 
            v-for="area in areas" 
            :key="area.id"
            class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-[70vh] shadow-2xs"
          >
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <h3 class="font-extrabold text-sm text-[#002D62] uppercase tracking-wider">{{ area.name }}</h3>
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-50 text-[#002D62] rounded border border-blue-100">
                {{ area.short_code }}
              </span>
            </div>
            <div class="space-y-3 overflow-y-auto flex-1 pr-1">
              <div
                v-for="ticket in getTicketsForArea(area.id)"
                :key="ticket.id"
                class="p-4 rounded-xl border transition shadow-sm flex flex-col justify-between space-y-2"
                :class="getTicketStatusCardClass(ticket.status)"
              >
                <div class="flex items-center justify-between">
                  <span class="font-mono font-black text-3xl tracking-tight text-slate-900">{{ ticket.ticket_code }}</span>
                  <span :class="getTicketBadgeClass(ticket.status)" class="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-wide">
                    {{ formatStatusLabel(ticket.status) }}
                  </span>
                </div>
                <div class="text-xs font-semibold text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100/60">
  <span>Station:</span>
  <span class="font-mono font-bold text-slate-800">{{ ticket.station_name || 'Counter' }}</span>
</div>
              </div>
              <div v-if="getTicketsForArea(area.id).length === 0" class="h-full flex flex-col items-center justify-center text-center text-slate-300 text-xs py-20">
                <p class="font-medium">Ready for next call</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const companyCode = ref(route.params.code || 'DEMO');
const companyName = ref('Company');
const pairingCode = ref('');
const isPaired = ref(false);
const areas = ref([]);
const waitingTickets = ref([]);
const activeOrCalledTickets = ref([]);
const loading = ref(false);
let socket = null;
let pollTimer = null;
const currentTime = ref('');
let clockTimer = null;

// Update real-time clock every second
const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Compute grid column count based on number of service areas plus waiting queue
const gridColumnsCount = computed(() => {
  return 1 + (areas.value.length > 0 ? areas.value.length : 1);
});

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  const savedToken = localStorage.getItem(`tv_token_${companyCode.value}`);
  if (savedToken) {
    isPaired.value = true;
    loadDisplayData();
    connectWebSocket();
  }
});

onUnmounted(() => {
  clearInterval(clockTimer);
  if (pollTimer) clearInterval(pollTimer);
  if (socket) socket.close();
});

// Verify pairing code with backend to activate TV display
const pairDisplay = async () => {
  const code = pairingCode.value.trim().toUpperCase();
  if (!code || code.length < 6) {
    alert('Please enter a valid 6-digit pairing code.');
    return;
  }
  try {
    const res = await apiClient.post('/tickets/display/verify-pairing', {
      company_code: companyCode.value,
      pairing_code: code,
      device_type: 'tv'
    });
    if (res.data.status === 'paired') {
      localStorage.setItem(`tv_token_${companyCode.value}`, code);
      companyName.value = res.data.company_name || companyCode.value;
      isPaired.value = true;
      loadDisplayData();
      connectWebSocket();
    }
  } catch (err) {
    alert(err.response?.data?.detail || 'Invalid or inactive pairing code.');
  }
};

// Disconnect TV display and clear token
const disconnectDisplay = () => {
  localStorage.removeItem(`tv_token_${companyCode.value}`);
  isPaired.value = false;
  pairingCode.value = '';
  if (socket) socket.close();
};

// Load display board queue status and service areas
const loadDisplayData = async () => {
  try {
    const [boardRes, areasRes] = await Promise.all([
      apiClient.get(`/tickets/display/${companyCode.value}/board`),
      apiClient.get(`/tickets/kiosk/${companyCode.value}/areas`)
    ]);
    companyName.value = boardRes.data.company_name || companyCode.value.toUpperCase();
    waitingTickets.value = boardRes.data.waiting || [];
    activeOrCalledTickets.value = boardRes.data.serving || [];
    areas.value = areasRes.data || [];
  } catch (err) {
    console.error('Error loading display board:', err);
  } finally {
    loading.value = false;
  }
};

// Filter active/called tickets for a specific area
const getTicketsForArea = (areaId) => {
  return activeOrCalledTickets.value.filter(t => t.area_id === areaId);
};

// Determine card styling based on ticket status
const getTicketStatusCardClass = (status) => {
  if (status === 'CALLED') {
    return 'bg-amber-50/80 border-amber-300 shadow-amber-100 animate-pulse';
  } else if (status === 'IN_SERVICE' || status === 'SERVING') {
    return 'bg-emerald-50/80 border-emerald-300 shadow-emerald-100';
  }
  return 'bg-blue-50/80 border-blue-200';
};

// Determine status badge class
const getTicketBadgeClass = (status) => {
  if (status === 'CALLED') {
    return 'bg-amber-200 text-amber-900';
  } else if (status === 'IN_SERVICE' || status === 'SERVING') {
    return 'bg-emerald-200 text-emerald-900';
  }
  return 'bg-blue-200 text-blue-900';
};

// Format status label for display
const formatStatusLabel = (status) => {
  if (status === 'CALLED') return 'ALERTED / CALLED';
  if (status === 'IN_SERVICE' || status === 'SERVING') return 'SERVING';
  return status;
};

// Connect WebSocket for live display board synchronization
const connectWebSocket = () => {
  const wsUrl = `ws://localhost:8000/ws/${companyCode.value}`;
  socket = new WebSocket(wsUrl);
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.action === 'FORCE_LOGOUT') {
        const savedToken = localStorage.getItem(`tv_token_${companyCode.value}`);
        if (!data.pairing_code || data.pairing_code === savedToken) {
          disconnectDisplay();
          alert(data.reason || 'This display has been disconnected by the administrator.');
          return;
        }
      }
      if (['TICKET_CREATED', 'TICKET_CALLED', 'TICKET_COMPLETED', 'TICKET_DERIVED', 'TICKET_RETURNED', 'TICKET_CANCELLED'].includes(data.event)) {
        loadDisplayData();
      }
    } catch (e) {
    }
  };
  socket.onclose = () => {
    setTimeout(connectWebSocket, 3000);
  };
};
</script>