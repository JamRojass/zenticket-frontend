<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
    <!-- Contenedor con fuente Montserrat, sin bordes redondeados (rounded-none) -->
    <div class="max-w-md w-full bg-white rounded-none p-8 sm:p-10 border border-slate-200 shadow-xl" style="font-family: 'Montserrat', sans-serif;">
      
      <div class="text-center mb-8">
        <div 
          style="background-color: rgb(34, 59, 132);" 
          class="w-14 h-14 rounded-none mx-auto flex items-center justify-center text-white shadow-lg mb-3"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <!-- Título en Mayúsculas y sin bold (font-normal) -->
        <h2 class="text-2xl font-normal uppercase text-slate-900 tracking-tight">ZENTICKET</h2>
        <p class="text-sm text-slate-500 mt-1 font-normal">Enter your credentials to access your workspace</p>
      </div>

      <!-- Añadimos novalidate para desactivar las alertas nativas del navegador -->
      <form @submit.prevent="handleSubmit" novalidate class="space-y-5">
        <div>
          <label class="block text-xs font-normal text-slate-700 uppercase tracking-wider mb-2">USERNAME</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="e.g. admin"
            class="w-full px-4 py-3 rounded-none border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[rgb(34,59,132)] text-sm font-normal transition"
          />
        </div>
        <div>
          <label class="block text-xs font-normal text-slate-700 uppercase tracking-wider mb-2">PASSWORD</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-none border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[rgb(34,59,132)] text-sm font-normal transition"
          />
        </div>

        <!-- Label de validación / mensaje de error ubicado justo encima del botón -->
        <div v-if="errorMessage" class="w-full">
          <label class="block text-xs font-normal text-rose-600 uppercase tracking-wider mb-1 bg-rose-50 p-2 border border-rose-200">
            {{ errorMessage }}
          </label>
        </div>

        <!-- Botón con rgb(34, 59, 132), sin bold y redondeo al mínimo (rounded-[2px]) -->
        <button
          type="submit"
          :disabled="loading"
          style="background-color: rgb(34, 59, 132);"
          class="w-full py-3.5 px-4 hover:opacity-90 disabled:bg-slate-300 text-white rounded-[2px] font-normal text-sm shadow-lg transition duration-200 uppercase tracking-wider cursor-pointer"
        >
          <span v-if="loading">SIGNING IN...</span>
          <span v-else>SIGN IN</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

/**
 * Handle form submission, authenticate credentials via store,
 * and redirect user based on assigned role.
 */
const handleSubmit = async () => {
  errorMessage.value = '';

  // Validación manual para mostrar el mensaje en el label superior si están vacíos
  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  try {
    const user = await authStore.login(username.value, password.value);
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/operator');
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Invalid username or password';
  } finally {
    loading.value = false;
  }
};
</script>