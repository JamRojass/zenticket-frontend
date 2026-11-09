<template>
  <nav class="bg-white border-b border-gray-200/85 sticky top-0 z-40 shadow-xs w-full">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-12">
        <div class="flex items-center space-x-3">
          <router-link :to="logoTargetRoute" class="flex items-center space-x-2.5 group">
            <img 
              src="@/assets/zenticket-logo.svg" 
              alt="Zenticket Logo" 
              class="h-9 w-auto group-hover:scale-105 transition-transform"
            />
          </router-link>
        </div>
        <div class="flex items-center space-x-4">
          <!-- Admin shift control button -->
          <div v-if="authStore.isAuthenticated && authStore.userRole === 'admin'">
            <button 
              v-if="!activeShift" 
              @click="openShift" 
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-md transition shadow-sm">
              OPEN SHIFT
            </button>
            <button 
              v-else 
              @click="closeShift" 
              class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-md transition shadow-sm">
              Close Shift (Active #{{ activeShift.id }})
            </button>
          </div>
          <!-- User profile dropdown menu -->
          <div v-if="authStore.isAuthenticated" class="relative" ref="dropdownRef">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              class="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              title="Account Menu"
            >
              <img 
                src="@/assets/profile.jpg" 
                alt="Profile Avatar" 
                class="w-9 h-9 rounded-xl object-cover shadow-2xs border border-slate-200"
              />
              <div class="text-left hidden sm:block">
                <p class="text-xs text-slate-800 leading-tight">
                  {{ authStore.user?.fullname || authStore.user?.username }}
                </p>
                <p class="text-[11px] text-slate-400 capitalize leading-tight">
                  {{ authStore.userRole }}
                </p>
              </div>
              <svg class="w-4 h-4 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in"
            >
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center space-x-3">
                <img src="@/assets/profile.jpg" alt="Avatar" class="w-8 h-8 rounded-lg object-cover border" />
                <div class="overflow-hidden">
                  <p class="text-xs text-slate-900 truncate">
                    {{ authStore.user?.fullname || authStore.user?.username }}
                  </p>
                  <span class="inline-block mt-0.5 px-2 py-0.2 rounded bg-blue-50 text-[#002D62] text-[9px] font-black uppercase">
                    {{ authStore.userRole }}
                  </span>
                </div>
              </div>
              <div class="py-1">
                <button
                  @click="openEditProfileModal"
                  class="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition"
                >
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
                <button
                  @click="openChangePasswordModal"
                  class="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition"
                >
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Change Password</span>
                </button>
              </div>
              <div class="border-t border-slate-100 pt-1">
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 transition"
                >
                  <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
          <div v-else>
            <router-link
              to="/login"
              class="px-4 py-2 text-sm text-[#002D62] hover:underline"
            >
              Sign In
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <!-- Edit Profile Modal -->
  <Teleport to="body">
    <div
      v-if="isEditProfileOpen"
      class="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
        <h3 class="text-base text-slate-900">Edit Profile</h3>
        <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
          {{ modalErrorMessage }}
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-[11px] text-slate-700 mb-1">Full Name</label>
            <input
              v-model="profileForm.fullname"
              @input="sanitizeFullname"
              placeholder="Enter your full name"
              class="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D62] text-xs font-medium"
            />
          </div>
        </div>
        <div class="flex items-center justify-end space-x-2 pt-2">
          <button
            type="button"
            @click="isEditProfileOpen = false"
            class="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="submitEditProfile"
            :disabled="updatingProfile"
            class="px-4 py-1.5 rounded-xl bg-[#002D62] hover:bg-blue-900 text-white text-xs shadow"
          >
            <span v-if="updatingProfile">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
  <!-- Change Password Modal -->
  <Teleport to="body">
    <div
      v-if="isChangePasswordOpen"
      class="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
        <h3 class="text-base text-slate-900">Change Password</h3>
        <div v-if="modalErrorMessage" class="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
          {{ modalErrorMessage }}
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-[11px] text-slate-700 mb-1">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
              class="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D62] text-xs font-medium"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-700 mb-1">Confirm Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              class="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D62] text-xs font-medium"
            />
          </div>
        </div>
        <div class="flex items-center justify-end space-x-2 pt-2">
          <button
            type="button"
            @click="isChangePasswordOpen = false"
            class="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="submitChangePassword"
            :disabled="updatingPassword"
            class="px-4 py-1.5 rounded-xl bg-[#002D62] hover:bg-blue-900 text-white text-xs shadow"
          >
            <span v-if="updatingPassword">Updating...</span>
            <span v-else>Update Password</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const router = useRouter();
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const isEditProfileOpen = ref(false);
const isChangePasswordOpen = ref(false);
const updatingProfile = ref(false);
const updatingPassword = ref(false);
const modalErrorMessage = ref('');
const profileForm = ref({ fullname: '' });
const passwordForm = ref({ newPassword: '', confirmPassword: '' });

// Compute target route based on authentication role
const logoTargetRoute = computed(() => {
  if (!authStore.isAuthenticated) return '/';
  return authStore.userRole === 'admin' ? '/admin' : '/operator';
});

const openEditProfileModal = () => {
  isDropdownOpen.value = false;
  modalErrorMessage.value = '';
  profileForm.value.fullname = authStore.user?.fullname || '';
  isEditProfileOpen.value = true;
};

const openChangePasswordModal = () => {
  isDropdownOpen.value = false;
  modalErrorMessage.value = '';
  passwordForm.value.newPassword = '';
  passwordForm.value.confirmPassword = '';
  isChangePasswordOpen.value = true;
};

const sanitizeFullname = (e) => {
  profileForm.value.fullname = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
};

const submitEditProfile = async () => {
  modalErrorMessage.value = '';
  if (!profileForm.value.fullname || !profileForm.value.fullname.trim()) {
    modalErrorMessage.value = 'Full name cannot be left blank.';
    return;
  }
  updatingProfile.value = true;
  try {
    const userId = authStore.user?.id;
    const res = await apiClient.put(`/admin/users/${userId}`, {
      fullname: profileForm.value.fullname.trim(),
      area_id: authStore.user?.area_id
    });
    authStore.user = res.data;
    localStorage.setItem('user_info', JSON.stringify(res.data));
    isEditProfileOpen.value = false;
  } catch (err) {
    modalErrorMessage.value = err.response?.data?.detail || 'Error updating profile.';
  } finally {
    updatingProfile.value = false;
  }
};

const submitChangePassword = async () => {
  modalErrorMessage.value = '';
  if (!passwordForm.value.newPassword || !passwordForm.value.newPassword.trim() ||
      !passwordForm.value.confirmPassword || !passwordForm.value.confirmPassword.trim()) {
    modalErrorMessage.value = 'Password fields cannot be left blank.';
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    modalErrorMessage.value = 'Passwords do not match.';
    return;
  }
  updatingPassword.value = true;
  try {
    const userId = authStore.user?.id;
    await apiClient.put(`/admin/users/${userId}/password`, {
      password: passwordForm.value.newPassword
    });
    isChangePasswordOpen.value = false;
    alert('Password updated successfully.');
  } catch (err) {
    modalErrorMessage.value = err.response?.data?.detail || 'Error updating password.';
  } finally {
    updatingPassword.value = false;
  }
};

const handleLogout = async () => {
  isDropdownOpen.value = false;
  await authStore.logout();
  router.push('/login');
};

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

const activeShift = ref(null);

const checkActiveShift = async () => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') return;
  try {
    const response = await apiClient.get('/admin/shifts/active');
    activeShift.value = response.data.active_shift;
  } catch (error) {
    console.error('Error fetching shift status', error);
  }
};

const openShift = async () => {
  if (!confirm('Are you sure you want to open a new shift? The ticket counter will start at 1.')) return;
  try {
    await apiClient.post('/admin/shifts/open');
    await checkActiveShift();
  } catch (error) {
    alert(error.response?.data?.detail || 'Error opening shift');
  }
};

const closeShift = async () => {
  if (!confirm('Are you sure you want to close the current shift? This will end operations.')) return;
  try {
    await apiClient.post('/admin/shifts/close');
    activeShift.value = null;
  } catch (error) {
    alert(error.response?.data?.detail || 'Error closing shift');
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (authStore.isAuthenticated && authStore.userRole === 'admin') {
    checkActiveShift();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>