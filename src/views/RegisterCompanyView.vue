<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
    <div class="max-w-md w-full bg-white rounded-none p-8 sm:p-10 border border-slate-200 shadow-xl" style="font-family: 'Montserrat', sans-serif;">
      
      <div class="text-center mb-8">
        <div class="flex justify-center items-center mb-3">
          <img 
            src="@/assets/logo.svg" 
            alt="Zenticket Logo" 
            class="h-16 w-auto group-hover:scale-105 transition-transform"
          />
        </div>
        <h2 class="text-2xl font-normal uppercase text-slate-900 tracking-tight">ZENTICKET</h2>
        <p class="text-sm text-slate-500 mt-1 font-normal">Sign up</p>
      </div>

      <!-- Añadimos novalidate para desactivar los globos emergentes nativos del navegador -->
      <form @submit.prevent="handleRegister" novalidate class="space-y-4">
        <div>
          <label class="block text-xs font-normal text-slate-700 tracking-wider mb-1.5">Company Name</label>
          <input
            v-model="form.company_name"
            type="text"
            placeholder="e.g. City General Hospital"
            class="w-full px-4 py-2.5 rounded-none border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[rgb(34,59,132)] text-sm font-normal transition"
          />
        </div>
        <div class="pt-2 border-t border-slate-100">
          <label class="block text-xs font-normal text-slate-700 tracking-wider mb-1.5">Username</label>
          <input
            v-model="form.admin_username"
            type="text"
            autocomplete="username"
            placeholder="e.g. admin"
            class="w-full px-4 py-2.5 rounded-none border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[rgb(34,59,132)] text-sm font-normal transition"
          />
        </div>
        <div>
          <label class="block text-xs font-normal text-slate-700 tracking-wider mb-1.5">Password</label>
          <input
            v-model="form.admin_password"
            type="password"
            autocomplete="new-password"
            placeholder="Minimum 6 characters"
            class="w-full px-4 py-2.5 rounded-none border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[rgb(34,59,132)] text-sm font-normal transition"
          />
        </div>

        <!-- Label de validación / mensaje de error ubicado justo encima del botón -->
        <div v-if="errorMessage" class="w-full pt-2">
          <label class="block text-xs font-normal text-rose-600 uppercase tracking-wider mb-1 bg-rose-50 p-2 border border-rose-200">
            {{ errorMessage }}
          </label>
        </div>

        <button
          type="submit"
          :disabled="loading"
          style="background-color: rgb(34, 59, 132);"
          class="w-full mt-2 py-3.5 px-4 hover:opacity-90 disabled:bg-slate-300 text-white rounded-[2px] font-normal text-sm shadow-lg transition duration-200 uppercase tracking-wider cursor-pointer"
        >
          <span v-if="loading">Creating Company...</span>
          <span v-else>Register & Get Started</span>
        </button>
      </form>

      <div class="mt-6 text-center text-xs text-slate-500 font-normal">
        Already have a tenant company?
        <router-link to="/login" class="text-[rgb(34,59,132)] hover:underline font-normal">
          Sign In
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  company_name: '',
  admin_username: '',
  admin_password: '',
});

const loading = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
  errorMessage.value = '';

  // Validación manual para mostrar el mensaje en tu label en lugar del globo del navegador
  if (!form.company_name.trim() || !form.admin_username.trim() || !form.admin_password.trim()) {
    errorMessage.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  try {
    const res = await apiClient.post('/admin/register', {
      company_name: form.company_name,
      admin_username: form.admin_username,
      admin_password: form.admin_password,
    });
    authStore.setCompanyCode(res.data.company.short_code);
    await authStore.login(form.admin_username, form.admin_password);
    router.push('/admin');
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Error registering company';
  } finally {
    loading.value = false;
  }
};
</script>