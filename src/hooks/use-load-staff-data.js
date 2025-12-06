import { useState, useEffect } from 'react';
import { getStaffApi } from '../api/restaurant';
import { useStaffStore } from '../stores';
import { toast } from './use-toast';

/**
 * Custom hook để load staff
 * @param {string} restaurantId - ID của restaurant
 * @returns {Object} { isLoading, error, refetch }
 */
export const useLoadStaffData = (restaurantId, options = {}) => {
  const { skipIfHasData = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const staff = useStaffStore((state) => state.staff);
  const setStaff = useStaffStore((state) => state.setStaff);

  const loadData = async (force = false) => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    // Skip nếu đã có data và không force reload
    if (!force && skipIfHasData && staff.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getStaffApi(restaurantId);
      
      // Staff API returns array directly
      if (Array.isArray(data)) {
        setStaff(data);
      }
    } catch (err) {
      setError(err);
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: err.message || 'Không thể tải danh sách nhân viên',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  return {
    isLoading,
    error,
    refetch: () => loadData(true), // Force reload
  };
};
