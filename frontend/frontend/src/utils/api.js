import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchWidgets = async () => {
    const response = await apiClient.get('/widgets');
    return response.data;
};

export const createWidget = async (newFormData) => {
    const response = await apiClient.post('/widgets', newFormData);
    return response.data;
};
export const previewWidget = async (widget) => {
    const response = await apiClient.post('/widgets/preview', widget);
    return response.data;
};

export const updateWidget = async (id, widget) => {
    const response = await apiClient.put(`/widgets/${id}`, widget);
    return response.data;
};

export const deleteWidget = async (id) => {
    const response = await apiClient.delete(`/widgets/${id}`);
    return response.data;
};

export const saveDashboard = async (dashboardData) => {
    const response = await apiClient.post('/dashboard/layout', dashboardData);
    return response.data;
};

export const fetchDashboard = async () => {
    const response = await apiClient.get('/dashboard/fetch-widget');
    return response.data;
};



export const getChartInput = async () => {
    const response = await apiClient.post('/widgets/get-chart-input');
    return response.data;
};



export const getWidgetData = async (id) => {
    const response = await apiClient.post(`/dashboard/fetch-widget-data/${id}`,{});
    return response.data;
};



// http://127.0.0.1:8000/api/dashboard/fetch-widget-data/1


// http://127.0.0.1:8000/api/widgets/get-chart-input
