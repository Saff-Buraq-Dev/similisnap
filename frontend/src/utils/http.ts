import axios from "axios";
import store from "../store/store";


const axiosInstance = axios.create({
    baseURL: 'https://api.similisnap.gharbidev.com'
})

axiosInstance.interceptors.request.use((config) => {
    config.headers.Authorization = store.state.user ? store.state.user["accessToken"] : "";
    return config;
});

export default axiosInstance;