<template>
  <div class="w-full px-4 sm:px-4 py-4 flex-1 bg-white">
    <!-- Admin panel layout grid with sidebar navigation and main nested router view -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
      <!-- Sidebar navigation links -->
      <aside class="lg:col-span-2 bg-white border border-slate-200 rounded-sm shadow-2xs">
        <nav class="divide-y divide-slate-100">
          <router-link to="/admin/areas" class="w-full text-left px-4 py-3 text-xs flex items-center space-x-2 transition-colors" :class="isRouteActive('/admin/areas') ? 'bg-[#002D62] text-white' : 'text-slate-700 hover:bg-slate-50'">
            <span>Areas</span>
          </router-link>
          <router-link to="/admin/staff" class="w-full text-left px-4 py-3 text-xs flex items-center space-x-2 transition-colors" :class="isRouteActive('/admin/staff') ? 'bg-[#002D62] text-white' : 'text-slate-700 hover:bg-slate-50'">
            <span>Staff</span>
          </router-link>
          <router-link to="/admin/stations" class="w-full text-left px-4 py-3 text-xs flex items-center space-x-2 transition-colors" :class="isRouteActive('/admin/stations') ? 'bg-[#002D62] text-white' : 'text-slate-700 hover:bg-slate-50'">
            <span>Stations</span>
          </router-link>
          <router-link to="/admin/tickets" class="w-full text-left px-4 py-3 text-xs flex items-center space-x-2 transition-colors" :class="isRouteActive('/admin/tickets') ? 'bg-[#002D62] text-white' : 'text-slate-700 hover:bg-slate-50'">
            <span>Tickets</span>
          </router-link>
          <router-link to="/admin/displays" class="w-full text-left px-4 py-3 text-xs flex items-center space-x-2 transition-colors" :class="isRouteActive('/admin/displays') ? 'bg-[#002D62] text-white' : 'text-slate-700 hover:bg-slate-50'">
            <span>Displays</span>
          </router-link>
          <router-link to="/admin/audit" class="w-full text-left px-4 py-3 text-xs flex items-center space-x-2 transition-colors" :class="isRouteActive('/admin/audit') ? 'bg-[#002D62] text-white' : 'text-slate-700 hover:bg-slate-50'">
            <span>Audit</span>
          </router-link>
          <router-link to="/admin/settings" class="w-full text-left px-4 py-3 text-xs flex items-center space-x-2 transition-colors" :class="isRouteActive('/admin/settings') ? 'bg-[#002D62] text-white' : 'text-slate-700 hover:bg-slate-50'">
            <span>Settings</span>
          </router-link>
        </nav>
      </aside>
      <!-- Main administrative content container -->
      <main class="lg:col-span-10 flex flex-col space-y-5">
        <router-view />
      </main>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

// Helper to check if current route matches path
const isRouteActive = (path) => {
  return route.path === path;
};
</script>