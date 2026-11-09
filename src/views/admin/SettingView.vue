<template>
  <div class="flex flex-col space-y-2 w-full max-w-2xl">
    <!-- Header title -->
    <div class="bg-white px-5 py-3 border border-slate-200 rounded-sm shadow-2xs">
      <h4 class="text-base">System settings</h4>
      <p class="text-[11px] text-slate-400">Core application preferences and configurations</p>
    </div>
    <!-- Settings form section -->
    <section class="bg-white border border-slate-200 rounded-sm shadow-2xs p-5 space-y-4">
      <div class="space-y-1.5">
        <label class="block text-xs text-slate-700">Rows per page (Pagination)</label>
        <p class="text-[11px] text-slate-400">Select how many records to show per table page.</p>
        <select v-model.number="settings.perPage" class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium">
          <option :value="10">10 rows</option>
          <option :value="25">25 rows</option>
          <option :value="50">50 rows</option>
          <option :value="100">100 rows</option>
        </select>
      </div>
      <hr class="border-slate-100" />
      <div class="space-y-1.5">
        <label class="block text-xs text-slate-700">TV Display Link</label>
        <p class="text-[11px] text-slate-400">Public link where physical lobby TV screens connect for your company.</p>
        <div class="flex items-center space-x-2">
          <input type="text" :value="tvDisplayUrl" readonly class="w-full p-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-mono text-slate-600" />
          <button @click="copyTvUrl" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition">Copy</button>
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="block text-xs text-slate-700">Kiosk Touch Link</label>
        <p class="text-[11px] text-slate-400">Public link where touch kiosks connect to issue tickets for your company.</p>
        <div class="flex items-center space-x-2">
          <input type="text" :value="kioskDisplayUrl" readonly class="w-full p-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-mono text-slate-600" />
          <button @click="copyKioskUrl" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition">Copy</button>
        </div>
      </div>
      <div class="pt-3 flex justify-end">
        <button @click="saveSettings" class="px-4 py-2 bg-[#002D62] text-white text-xs rounded-xl hover:bg-blue-900 shadow transition">
          Save Preferences
        </button>
      </div>
    </section>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

const authStore = useAuthStore();
const settings = ref({
  perPage: 10,
  fontSize: 'text-xs',
  fontFamily: 'font-sans'
});

const companyCode = computed(() => authStore.user?.company_code || authStore.companyCode || 'DEMO');
const tvDisplayUrl = computed(() => `${window.location.origin}/display/${companyCode.value}`);
const kioskDisplayUrl = computed(() => `${window.location.origin}/kiosk/${companyCode.value}`);

onMounted(async () => {
  try {
    const res = await api.get('/admin/preferences');
    if (res.data) {
      settings.value.perPage = res.data.per_page ?? 10;
      settings.value.fontSize = res.data.font_size ?? 'text-xs';
      settings.value.fontFamily = res.data.font_family ?? 'font-sans';
      localStorage.setItem('admin_settings', JSON.stringify(res.data));
    }
  } catch (e) {
    console.error('Error fetching preferences from DB, falling back to local:', e);
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        settings.value.perPage = parsed.perPage || 10;
        settings.value.fontSize = parsed.fontSize || 'text-xs';
        settings.value.fontFamily = parsed.fontFamily || 'font-sans';
      } catch (err) {
        console.error('Error parsing local settings:', err);
      }
    }
  }
});

// Save preferences to backend and local storage
const saveSettings = async () => {
  try {
    await api.put('/admin/preferences', {
      per_page: settings.value.perPage,
      font_size: settings.value.fontSize,
      font_family: settings.value.fontFamily
    });
    localStorage.setItem('admin_settings', JSON.stringify({
      perPage: settings.value.perPage,
      fontSize: settings.value.fontSize,
      fontFamily: settings.value.fontFamily
    }));
    alert('Configuration saved successfully to database!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving preferences.');
  }
};

const copyTvUrl = () => {
  navigator.clipboard.writeText(tvDisplayUrl.value);
  alert('TV URL copied to clipboard!');
};

const copyKioskUrl = () => {
  navigator.clipboard.writeText(kioskDisplayUrl.value);
  alert('Kiosk URL copied to clipboard!');
};
</script>