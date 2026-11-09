<template>
  <!-- Main application shell layout with dynamic monospace font styling based on route -->
  <div 
    class="h-screen w-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden"
    :class="{ 'font-ui-monospace': route.path !== '/' }"
  >
    <!-- Conditionally render navigation bar hiding on public or specialized full-screen views -->
    <Navbar v-if="route.name !== 'Home' && !route.path.startsWith('/kiosk') && !route.path.startsWith('/display') && !route.path.startsWith('/login') && !route.path.startsWith('/register') " />
    <!-- Scrollable main router view container -->
    <main class="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';

// Initialize vue-router instance to track current active route
const route = useRoute();
</script>