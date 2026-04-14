import axios from 'axios';

// export const Altaxios = axios.create({
//     withCredentials: true,
//     baseURL: process.env.REACT_APP_API_URL,
// });
// const OtherUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/`;
// const API_BASE_URL = process.env.REACT_APP_API_URL || OtherUrl;
// const API_BASE_URL = OtherUrl;
const API_BASE_URL = "https://192.168.8.103:5000/api";
export const Altaxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
