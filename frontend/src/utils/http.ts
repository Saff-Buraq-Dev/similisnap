import axios from "axios";
import store from "../store/store";
import { auth } from '../firebase';


const axiosInstance = axios.create({
    baseURL: 'https://api.similisnap.gharbidev.com'
})

axiosInstance.interceptors.request.use((config) => {
    let authToken = "";
    if (store.state.user) {
        auth.currentUser?.getIdToken(true).then(token => {
            authToken = token;
        });
    }
    config.headers.Authorization = authToken;
    return config;
});

export default axiosInstance;