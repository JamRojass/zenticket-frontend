<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transform transition-all p-6 text-center"
    >
      <div
        class="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4"
        :class="isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'"
      >
        <svg
          v-if="isDanger"
          class="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <svg
          v-else
          class="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-slate-800 mb-2">
        {{ title }}
      </h3>
      <p class="text-slate-600 text-sm mb-6 leading-relaxed">
        {{ message }}
      </p>
      <div class="flex items-center justify-center space-x-3">
        <button
          type="button"
          @click="onCancel"
          class="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          @click="onConfirm"
          :class="
            isDanger
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          "
          class="px-6 py-2.5 rounded-xl font-semibold shadow-md transition"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed with this action?',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  isDanger: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['confirm', 'cancel']);
const onConfirm = () => emit('confirm');
const onCancel = () => emit('cancel');
</script>