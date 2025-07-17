import axios from "axios";
import config from "../../config.js";

const headers = {
    "Content-Type": "application/json",
};

const auth = {
    username: config.serviceNow.user,
    password: config.serviceNow.pass,
};

const baseURL = `${config.serviceNow.url}api/now/table/u_users`;

export const createUserSN = (data) => axios.post(baseURL, data, { auth, headers });

export const getUserSN = (sys_id) => axios.get(`${baseURL}/${sys_id}`, { auth, headers });

export const updateUserSN = (sys_id, data) => axios.put(`${baseURL}/${sys_id}`, data, { auth, headers });

export const deleteUserSN = (sys_id) => axios.delete(`${baseURL}/${sys_id}`, { auth, headers });