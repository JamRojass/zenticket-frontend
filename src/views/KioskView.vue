<template>
  <div class="min-h-screen bg-white text-slate-900 flex flex-col justify-between select-none font-sans w-full overflow-x-hidden">
    <!-- Kiosk pairing screen for entering connection code -->
    <div v-if="!isPaired" class="min-h-[85vh] flex items-center justify-center w-full p-4">
      <div class="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-xl space-y-6 text-center">
        <div>
          <div class="w-14 h-14 bg-[#002D62] text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-md">
            T
          </div>
          <h2 class="text-xl font-black text-slate-900">Kiosk Connection</h2>
          <p class="text-xs text-slate-500 mt-1">
            Company Code: <span class="font-mono text-[#002D62] uppercase font-bold">{{ companyCode }}</span>
          </p>
          <p class="text-[11px] text-slate-400 mt-1">Enter the 6-digit connection code assigned in the admin panel.</p>
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
            @click="pairKiosk"
            class="w-full py-3.5 bg-[#002D62] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition shadow-lg"
          >
            Connect Kiosk
          </button>
        </div>
      </div>
    </div>
    <!-- Active connected kiosk interface -->
    <template v-else>
      <header class="w-full h-[60px] flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 relative">
        <div class="flex items-center flex-1 sm:flex-none">
          <img
            src="@/assets/zenticket-logo.svg"
            alt="Zenticket"
            class="h-10 sm:h-12 w-auto max-w-[160px] sm:max-w-none object-contain transition-transform"
          />
        </div>
        <div class="hidden sm:block">
          <button
            @click="disconnectKiosk"
            class="text-base text-rose-600 hover:text-rose-700 font-bold underline transition"
          >
            Exit
          </button>
        </div>
        <div class="flex sm:hidden items-center relative">
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="p-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            aria-label="Menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div
            v-if="showMobileMenu"
            class="absolute right-0 top-12 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-40 z-50 animate-fade-in text-center"
          >
            <button
              @click="disconnectKiosk; showMobileMenu = false"
              class="w-full py-2 text-sm text-rose-600 font-bold rounded-lg hover:bg-rose-50 transition"
            >
              Exit
            </button>
          </div>
        </div>
      </header>
      <main class="w-full py-6 px-4 sm:px-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
        <div class="flex flex-col items-center justify-center mb-8 pt-2 space-y-2">
          <div class="flex items-center space-x-2.5">
            <span 
              :class="[
                'w-5 h-5 sm:w-6 sm:h-6 rounded-full inline-block transition-colors shrink-0', 
                (isPaired && isShiftOpen) ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              ]"
            ></span>
            <span class="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-600">
              {{ (isPaired && isShiftOpen) ? 'Connect' : 'Disconnected' }}
            </span>
          </div>
          <div class="font-mono text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black text-slate-800 tracking-tight text-center">
            {{ currentTime }}
          </div>
        </div>
        <!-- Shift closed warning banner -->
        <div v-if="isPaired && !isShiftOpen && !loading" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
          <p class="text-amber-800 font-bold text-sm">Shift is currently closed</p>
          <p class="text-amber-600 text-xs mt-0.5">Please wait for the administrator to open the shift.</p>
        </div>
        <!-- Service areas selection grid for ticket generation -->
        <div class="my-auto flex flex-col justify-center flex-1">
          <div v-if="loading" class="text-center py-20">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#002D62] border-t-transparent"></div>
            <p class="mt-4 text-slate-500 font-medium text-xs">Loading service areas...</p>
          </div>
          <div
            v-else-if="areas.length === 0"
            class="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm w-full"
          >
            <h3 class="text-lg font-bold text-slate-800">No Service Areas Found</h3>
            <p class="text-slate-500 text-xs mt-1">There are no service areas configured for this company.</p>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <button
              v-for="area in areas"
              :key="area.id"
              @click="generateTicket(area)"
              :disabled="generating || !isShiftOpen"
              class="group bg-white hover:border-[#002D62] hover:shadow-xl active:scale-95 border border-slate-200 p-6 sm:p-8 rounded-3xl transition-all duration-200 shadow-xs flex flex-col items-center text-center justify-between h-72 sm:h-80 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-xs disabled:active:scale-100"
            >
              <h3 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight w-full truncate">{{ area.name }}</h3>
              <div class="my-auto">
                <span class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50 group-hover:bg-[#002D62] text-[#002D62] group-hover:text-white font-mono font-black text-3xl sm:text-4xl flex items-center justify-center transition shadow-xs">
                  {{ area.short_code }}
                </span>
              </div>
              <p class="text-xs uppercase font-extrabold tracking-wider text-slate-400 group-hover:text-[#002D62] transition-colors w-full">
                {{ isShiftOpen ? 'Touch to print ticket' : 'Shift closed' }}
              </p>
            </button>
          </div>
        </div>
      </main>
    </template>
    <!-- Generated ticket popup modal preview -->
    <div
      v-if="generatedTicket"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div class="bg-white text-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
        <div class="w-16 h-16 bg-blue-50 text-[#002D62] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">YOUR TICKET NUMBER</p>
        <div class="font-mono text-6xl font-black text-[#002D62] my-3 tracking-tight">
          {{ generatedTicket.ticket_code }}
        </div>
        <p class="text-lg font-bold text-slate-800">{{ generatedAreaName }}</p>
        <p class="text-xs text-slate-500 mt-2">Please proceed to the waiting area.</p>
        <div class="mt-8">
          <button
            @click="generatedTicket = null"
            class="w-full py-3 bg-[#002D62] hover:bg-blue-900 text-white rounded-xl font-bold text-sm shadow transition"
          >
            Done ({{ countdown }}s)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

const showMobileMenu = ref(false);
const route = useRoute();
const companyCode = ref(route.params.code || 'DEMO');
const companyName = ref('Company');
const pairingCode = ref('');
const isPaired = ref(false);
const isShiftOpen = ref(false);
const areas = ref([]);
const loading = ref(false);
const generating = ref(false);
const generatedTicket = ref(null);
const generatedAreaName = ref('');
const countdown = ref(6);
let countdownTimer = null;
const currentTime = ref('');
let clockTimer = null;

// Update real-time clock every second
const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Establish WebSocket connection for kiosk shift status updates
const connectWebSocket = () => {
  const wsUrl = `ws://localhost:8000/ws/${companyCode.value}`;
  let ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.action === 'FORCE_LOGOUT') {
        const savedToken = localStorage.getItem(`kiosk_token_${companyCode.value}`);
        if (!data.pairing_code || data.pairing_code === savedToken) {
          localStorage.removeItem(`kiosk_token_${companyCode.value}`);
          isPaired.value = false;
          pairingCode.value = '';
          if (ws) ws.close();
          alert(data.reason || 'This kiosk has been disconnected by the administrator.');
        }
      } else if (data.action === 'SHIFT_OPENED') {
        isShiftOpen.value = true;
      } else if (data.action === 'SHIFT_CLOSED') {
        isShiftOpen.value = false;
      }
    } catch (e) {}
  };
  ws.onclose = () => {
    if (isPaired.value) {
      setTimeout(connectWebSocket, 3000);
    }
  };
};

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  const savedToken = localStorage.getItem(`kiosk_token_${companyCode.value}`);
  if (savedToken) {
    isPaired.value = true;
    loadAreasAndInfo();
    checkActiveShift();
    connectWebSocket();
  }
});

onUnmounted(() => {
  clearInterval(clockTimer);
  clearInterval(countdownTimer);
});

// Verify kiosk pairing connection code
const pairKiosk = async () => {
  const code = pairingCode.value.trim().toUpperCase();
  if (!code || code.length < 6) {
    alert('Please enter a valid 6-digit connection code.');
    return;
  }
  try {
    const res = await apiClient.post('/tickets/display/verify-pairing', {
      company_code: companyCode.value,
      pairing_code: code,
      device_type: 'kiosk'
    });
    if (res.data.status === 'paired') {
      localStorage.setItem(`kiosk_token_${companyCode.value}`, code);
      companyName.value = res.data.company_name || companyCode.value;
      isPaired.value = true;
      loadAreasAndInfo();
      checkActiveShift();
      connectWebSocket();
    }
  } catch (err) {
    alert(err.response?.data?.detail || 'Invalid or inactive connection code.');
  }
};

// Disconnect kiosk and clear stored token
const disconnectKiosk = () => {
  localStorage.removeItem(`kiosk_token_${companyCode.value}`);
  isPaired.value = false;
  pairingCode.value = '';
  isShiftOpen.value = false;
};

// Load service areas for kiosk ticket issuance
const loadAreasAndInfo = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/tickets/kiosk/${companyCode.value}/areas`);
    areas.value = res.data;
    companyName.value = route.params.code.toUpperCase();
  } catch (err) {
    areas.value = [];
  } finally {
    loading.value = false;
  }
};

// Check if an administrative shift is active
const checkActiveShift = async () => {
  try {
    const res = await apiClient.get('/operator/shifts/active', {
      params: { company_code: companyCode.value }
    });
    isShiftOpen.value = !!res.data.active_shift;
  } catch (err) {
    isShiftOpen.value = false;
  }
};

// Generate a new ticket for the selected service area
const generateTicket = async (area) => {
  generating.value = true;
  try {
    const res = await apiClient.post(`/tickets/kiosk/${companyCode.value}/create`, {
      area_id: area.id,
    });
    generatedTicket.value = res.data;
    generatedAreaName.value = area.name;
    countdown.value = 6;
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        generatedTicket.value = null;
        clearInterval(countdownTimer);
      }
    }, 1000);
  } catch (err) {
    alert(err.response?.data?.detail || 'Error issuing ticket');
  } finally {
    generating.value = false;
  }
};
</script>