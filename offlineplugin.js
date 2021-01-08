import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeRequest = (request) => {
  const serialized = JSON.stringify(request);
  return AsyncStorage.setItem(`request-${Date.now()}`, serialized);
};

export const consumeQueue = () => {
  const retryPromises = AsyncStorage.getAllKeys()
    .then((keys) => {
      const validKeys = keys.filter((key) => key.startsWith('request-'));
      return AsyncStorage.multiGet(validKeys);
    })
    .then((values) => {
      return values.map(async (entry) => {
        const [key, strRequest] = entry;

        const request = JSON.parse(strRequest);
        let withInterceptor = request;
        console.log('beforeInterceptor');
        axios.interceptors.request.forEach((interceptor) => {
          withInterceptor = interceptor.fulfilled(request);
        });
        console.log(withInterceptor, request);
        console.log('beforeSend');
        return defaultAdapter(withInterceptor).then((response) => {
          console.log('removeItem');
          AsyncStorage.removeItem(key);
          return response;
        });
      });
    })
    .then((promises) => Promise.all(promises));

  return retryPromises;
};

const defaultAdapter = axios.defaults.adapter;
export default function (requestConfig) {
  return defaultAdapter(requestConfig).catch((error) => {
    const {code, message, response} = error;

    if (
      response === undefined &&
      (code === 'ECONNABORTED' || message === 'Network Error')
    ) {
      storeRequest(requestConfig);
    }
    return Promise.reject(error);
  });
}
