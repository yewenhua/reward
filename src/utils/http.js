import axios from 'axios'

// axios 配置
axios.defaults.timeout = 30000;
axios.defaults.baseURL = 'http://lottery.voc.so';

// http request 拦截器
axios.interceptors.request.use(
    config => {
        return config;
    },
    err => {
        return Promise.reject(err);
    });

// http response 拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    break;
            }
        }
        return Promise.reject(error.response.data);
    });

export default axios;
