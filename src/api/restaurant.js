

export const createRestaurantApi = async (restaurantData) => {
    const res = await CallApiWithAuth.post("/restaurants", restaurantData);
    return res.data;
}

