import { CallApiWithAuth } from "./axios";


export const createRestaurantApi = async (restaurantData) => {

    const payload = {
        ...restaurantData,
        capacity: Number(restaurantData.capacity),
        phone: restaurantData.phone.replace(/[\s\-\(\)]/g, ''),
    }

    const res = await CallApiWithAuth.post("/restaurants", payload);
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
    console.log('📋 Menu Items Response:', res.data);
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
    console.log('🪑 Tables Response:', res.data);
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
    console.log('👥 Staff Response:', res.data);
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
