import { useState, useEffect } from "react";
import { getMeApi, updateProfileApi, updatePreferencesApi } from "../../../api/auth";
import { useAuthStore } from "../../../stores/auth.store";

export function useProfile() {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const updateUser = useAuthStore((state) => state.updateUser);
    const user = useAuthStore((state) => state.user);

    // Fetch user profile
    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getMeApi();
            let userData = response?.data;
            if (!userData) {
                userData = user;
            }
            setProfile(userData);
            // Update auth store with latest user data
            updateUser(userData);
            console.log("Fetched profile:", userData);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError(err.message || "Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Update profile info (name, DOB, gender)
    const updateProfile = async (data) => {
        try {
            const response = await updateProfileApi(data);
            const updatedUser = response?.data;
            if (updatedUser) {
                setProfile((prev) => {
                    const mergedUser = { ...(prev || {}), ...updatedUser };
                    updateUser(mergedUser);
                    return mergedUser;
                });
            }
            return { success: true, data: response };
        } catch (err) {
            console.error("Failed to update profile:", err);
            return { success: false, error: err.message };
        }
    };

    // Update preferences (theme, language, notifications)
    const updatePreferences = async (preferences) => {
        try {
            const response = await updatePreferencesApi(preferences);
            const updatedPreferences = response?.data?.preferences;
            if (updatedPreferences) {
                setProfile((prev) => {
                    const mergedUser = { ...(prev || {}), preferences: updatedPreferences };
                    updateUser(mergedUser);
                    return mergedUser;
                });
            }
            return { success: true, data: response };
        } catch (err) {
            console.error("Failed to update preferences:", err);
            return { success: false, error: err.message };
        }
    };

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    return {
        profile,
        isLoading,
        error,
        refetch: fetchProfile,
        updateProfile,
        updatePreferences,
    };
}
