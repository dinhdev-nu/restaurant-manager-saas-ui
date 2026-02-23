import { CallApi, CallApiWithAuth } from "./axios";


export const createRestaurantApi = async (restaurantData) => {

    const payload = {
        ...restaurantData,
        capacity: Number(restaurantData.capacity),
        phone: restaurantData.phone.replace(/[\s\-\(\)]/g, ''),
    }

    const res = await CallApiWithAuth.post("/restaurants", payload);
    return res.data;
}

export const updateRestaurantApi = async (restaurantId, restaurantData) => {
    const payload = {
        ...restaurantData,
        capacity: Number(restaurantData.capacity),
        phone: restaurantData.phone.replace(/[\s\-\(\)]/g, ''),
    }
    const res = await CallApiWithAuth.put(`/restaurants/${restaurantId}`, payload);
    return res.data;
}

export const getMyRestaurantsApi = async () => {
    const res = await CallApiWithAuth.get("/restaurants/my-restaurants");
    return res.data;
}

export const createMenuItemApi = async (restaurantId, menuItemData) => {
    const payload = {
        ...menuItemData,
        price: Number(menuItemData.price),
        restaurantId,
    }

    const res = await CallApiWithAuth.post(`/restaurants/item`, payload);
    return res.data;
}

export const getMenuItemsApi = async (restaurantId) => {
    const res = await CallApiWithAuth.get(`/restaurants/${restaurantId}/items`);
    return res.data.metadata;
}

/** 
export class CreateTableDto {
    number: string; 
    floor: number;
    x: number;    y: number;
    shape: string;
    capacity: number;
    status: TABLESTATUS; 
}

export enum TABLESTATUS {
    AVAILABLE = "available",
    OCCUPIED = "occupied",
    RESERVED = "reserved",
    CLEANING = "cleaning",
}

 */
export const createTableApi = async (restaurantId, tableData) => {
    const payload = {
        ...tableData,
        capacity: Number(tableData.capacity),
        restaurantId,
    }
    const res = await CallApiWithAuth.post(`/restaurants/table`, payload);
    return res.data;
}

export const getTablesApi = async (restaurantId) => {
    const res = await CallApiWithAuth.get(`/restaurants/${restaurantId}/tables`);
    return res.data.metadata;
}

export const createStaffApi = async (restaurantId, staffData) => {
    const payload = {
        ...staffData,
        restaurantId,
    }
    const res = await CallApiWithAuth.post(`/restaurants/staff`, payload);
    return res.data;
}

export const getStaffApi = async (restaurantId) => {
    const res = await CallApiWithAuth.get(`/restaurants/${restaurantId}/staffs`);
    return res.data.metadata;
}


export const createOrderApi = async (restaurantId, orderData) => {
    const payload = {
        ...orderData,
        restaurantId,
    }
    const res = await CallApiWithAuth.post(`/orders`, payload);
    return res.data;
}

export const createDraftOrderApi = async (restaurantId, orderData) => {
    const payload = {
        ...orderData,
        restaurantId,
    }
    const res = await CallApi.post(`/orders/draft`, payload)
    return res.data;
}


export const getOrdersApi = async (restaurantId, page = 1, status, limit = 20) => {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (status) queryParams.append('status', status);
    queryParams.append('limit', limit);
    
    const res = await CallApiWithAuth.get(`/orders/${restaurantId}?${queryParams.toString()}`);
    return res.data.metadata;
}

export const getOrderCheckoutDetailsApi = async (orderId) => {
    const res = await CallApiWithAuth.get(`/orders/checkout/${orderId}`);
    return res.data;
}

// payment
export const paymentByCash = async (restaurantId, orderId, paidAmount) => {
    const payload = {
        restaurantId,
        orderId,
        paidAmount,
        method: 'cash'
    };
    const res = await CallApiWithAuth.post(`/payments/cash`, payload);
    return res.data;
}


export const paymentByQRCode = async (restaurantId, orderId, amount) => {
    const payload = {
        restaurantId,
        orderId,
        amount,
        method: 'qr_code'
    };
    const res = await CallApiWithAuth.post(`/payments/qr-code`, payload);
    return res.data;
}