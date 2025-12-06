import { useState, useEffect } from 'react';
import { getTablesApi } from '../api/restaurant';
import { useTableStore } from '../stores/table.store';
import { toast } from './use-toast';

/**
 * Custom hook để load tables
 * @param {string} restaurantId - ID của restaurant
 * @returns {Object} { isLoading, error, refetch }
 */
export const useLoadTablesData = (restaurantId, options = {}) => {
  const { skipIfHasData = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const tables = useTableStore((state) => state.tables);
  const setTables = useTableStore((state) => state.setTables);

  const loadData = async (force = false) => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    // Skip nếu đã có data và không force reload
    if (!force && skipIfHasData && tables.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTablesApi(restaurantId);
      
      // Tables API returns array directly
      if (Array.isArray(data)) {
        setTables(data);
      }
    } catch (err) {
      setError(err);
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: err.message || 'Không thể tải danh sách bàn',
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
