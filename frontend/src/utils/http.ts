import axios, { AxiosHeaderValue } from "axios";
import { getUserToken } from "@/services/user";

const axiosInstance = axios.create({
    baseURL: 'https://api.similisnap.gharbidev.com'
})

axiosInstance.interceptors.request.use(async (config) => {
    const token = await getUserToken() as AxiosHeaderValue;
    if (token) {
        console.log(token);
        config.headers.Authorization = token;
    }
    return config;
});

export default axiosInstance;