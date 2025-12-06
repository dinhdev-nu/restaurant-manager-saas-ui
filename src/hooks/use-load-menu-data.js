import { useState, useEffect } from 'react';
import { getMenuItemsApi } from '../api/restaurant';
import { useMenuStore } from '../stores/menu.store';
import { toast } from './use-toast';

/**
 * Custom hook để load menu items
 * @param {string} restaurantId - ID của restaurant
 * @returns {Object} { isLoading, error, refetch }
 */
export const useLoadMenuData = (restaurantId, options = {}) => {
  const { skipIfHasData = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const menuItems = useMenuStore((state) => state.menuItems);
  const setMenuItems = useMenuStore((state) => state.setMenuItems);

  const loadData = async (force = false) => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    // Skip nếu đã có data và không force reload
    if (!force && skipIfHasData && menuItems.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMenuItemsApi(restaurantId);
      
      // Menu API returns {active: [], inactive: [], totalItems}
      if (data?.active && data?.inactive) {
        setMenuItems(data);
      }
    } catch (err) {
      setError(err);
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: err.message || 'Không thể tải menu items',
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
