import axios from 'axios'

// 基础url
// export const BASE_URL = '/ht/mes-main-pro/'
// export const BASE_USER_URL = '/ht/hzsmt-user-pro/'
export const BASE_URL = '/ht/mes-main/'
export const BASE_USER_URL = '/ht/hzsmt-user/'


// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  const username = localStorage.getItem('username');
  if (username) {
    if (config.method === 'get') {
      if (!config.url!.includes('?')) {
        config.url += '?';
      }
      const urlArr = config.url?.split('&');
      if (urlArr) {
        urlArr.push(`userCode=${username}`)
        config.url = urlArr.join('&')
      }
    } else {
      config.data.userCode = username
    }
  }
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数。
  const { data: {code, msg} } = response;
  if (code === 500 && msg.includes('未登录')) {
    localStorage.removeItem('username');
    location.reload();
  }
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  console.error(error, 969);
  return Promise.reject(error);
});
