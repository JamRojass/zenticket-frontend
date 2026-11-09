import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// Create Vue application instance
const app = createApp(App);

// Register Pinia state management container
app.use(createPinia());

// Register Vue Router instance
app.use(router);

// Mount the application to the DOM root element
app.mount('#app');