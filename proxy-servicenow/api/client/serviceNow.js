// services/serviceNow.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const instance = axios.create({
    baseURL: process.env.SERVICE_NOW_URL,
    auth: {
        username: process.env.SERVICE_NOW_USER,
        password: process.env.SERVICE_NOW_PASSWORD,
    },
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
});

const endpoint = '/api/now/table/u_users';

module.exports = {
    createClient: async(data) => {
        const response = await instance.post(endpoint, data);
        return response.data.result;
    },

    getClient: async(sys_id) => {
        const response = await instance.get(`${endpoint}/${sys_id}`);
        return response.data.result;
    },

    updateClient: async(sys_id, data) => {
        const response = await instance.put(`${endpoint}/${sys_id}`, data);
        return response.data.result;
    },

    deleteClient: async(sys_id) => {
        const response = await instance.delete(`${endpoint}/${sys_id}`);
        return response.data.result;
    }
};