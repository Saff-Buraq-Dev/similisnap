import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import BootstrapVueNext from "bootstrap-vue-next";
import VueApexCharts from "vue3-apexcharts";
import Toaster from "@meforma/vue-toaster";
import { QuillEditor } from '@vueup/vue-quill';
import Vue3Prism from 'vue3-prism/lib/Vue3Prism.common.js';
import store from "./store/store";


import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "swiper/css";
import "swiper/css/bundle";
import 'flatpickr/dist/flatpickr.css';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
import "vue3-prism/lib/Vue3Prism.css"

import "./assets/custom.scss";



const app = createApp(App).use(router);
app.use(store);
app.use(VueApexCharts);
app.use(BootstrapVueNext);
app.use(Toaster);
app.component('QuillEditor', QuillEditor).use(Vue3Prism);
app.mount("#app");
