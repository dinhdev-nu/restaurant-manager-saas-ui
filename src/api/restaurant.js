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

