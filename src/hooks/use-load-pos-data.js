import { useState, useEffect } from 'react';
import { getMenuItemsApi, getTablesApi, getStaffApi } from '../api/restaurant';
import { useMenuStore } from '../stores/menu.store';
import { useTableStore } from '../stores/table.store';
import { useStaffStore } from '../stores/staff.store';
import { toast } from './use-toast';

/**
 * Custom hook để load tất cả data cần thiết cho POS
 * @param {string} restaurantId - ID của restaurant cần load data
 * @param {Object} options - Cấu hình options
 * @param {boolean} options.loadMenu - Load menu items (default: true)
 * @param {boolean} options.loadTables - Load tables (default: true)
 * @param {boolean} options.loadStaff - Load staff (default: true)
 * @param {boolean} options.skipIfHasData - Skip nếu đã có data (default: true)
 * @returns {Object} { isLoading, error, refetch }
 */
export const useLoadPOSData = (restaurantId, options = {}) => {
  const {
    loadMenu = true,
    loadTables = true,
    loadStaff = true,
    skipIfHasData = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const menuItems = useMenuStore((state) => state.menuItems);
  const tables = useTableStore((state) => state.tables);
  const staff = useStaffStore((state) => state.staff);
  const setMenuItems = useMenuStore((state) => state.setMenuItems);
  const setTables = useTableStore((state) => state.setTables);
  const setStaff = useStaffStore((state) => state.setStaff);

  const loadData = async (force = false) => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    // Check if all data already loaded - skip fetch
    const hasMenuData = menuItems.length > 0;
    const hasTablesData = tables.length > 0;
    const hasStaffData = staff.length > 0;
    
    const allDataLoaded = 
      (!loadMenu || hasMenuData) && 
      (!loadTables || hasTablesData) && 
      (!loadStaff || hasStaffData);

    if (!force && skipIfHasData && allDataLoaded) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Tạo array promises chỉ với các API cần load
      const promises = [];
      const promiseTypes = [];

      // Chỉ load những data chưa có (hoặc force reload)
      if (loadMenu && (force || !hasMenuData)) {
        promises.push(getMenuItemsApi(restaurantId));
        promiseTypes.push('menu');
      }

      if (loadTables && (force || !hasTablesData)) {
        promises.push(getTablesApi(restaurantId));
        promiseTypes.push('tables');
      }

      if (loadStaff && (force || !hasStaffData)) {
        promises.push(getStaffApi(restaurantId));
        promiseTypes.push('staff');
      }

      // Nếu không có gì cần load
      if (promises.length === 0) {
        setIsLoading(false);
        return;
      }

      // Load tất cả song song
      const results = await Promise.allSettled(promises);

      // Xử lý kết quả từng API
      results.forEach((result, index) => {
        const type = promiseTypes[index];

        if (result.status === 'fulfilled') {
          const data = result.value;

          switch (type) {
            case 'menu':
              // Menu API returns {active: [], inactive: [], totalItems}
              if (data?.active && data?.inactive) {
                setMenuItems(data);
              }
              break;

            case 'tables':
              // Tables API returns array directly
              if (Array.isArray(data)) {
                setTables(data);
              }
              break;

            case 'staff':
              // Staff API returns array directly
              if (Array.isArray(data)) {
                setStaff(data);
              }
              break;

            default:
              break;
          }
        }
      });

      // Kiểm tra nếu tất cả đều fail
      const allFailed = results.every((r) => r.status === 'rejected');
      if (allFailed) {
        setError(new Error('Không thể load dữ liệu POS'));
        toast({
          variant: 'destructive',
          title: 'Lỗi tải dữ liệu',
          description: 'Không thể load dữ liệu POS. Vui lòng thử lại.',
        });
      }
    } catch (err) {
      setError(err);
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: err.message || 'Đã có lỗi xảy ra khi tải dữ liệu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(false); // Initial load - respect skipIfHasData
  }, [restaurantId]);

  return {
    isLoading,
    error,
    refetch: () => loadData(true), // Force refetch
  };
};
