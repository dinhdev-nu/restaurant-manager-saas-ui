import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStaffStore = create(
  persist(
    (set, get) => ({
      // State
      staff: [],
      
      // Actions - Staff Management
      addStaff: (staffData) => {
        const state = get();

        // Validation
        if (!staffData.name || staffData.name.trim().length === 0) {
          throw new Error('Tên nhân viên không được để trống');
        }

        if (staffData.name.length > 100) {
          throw new Error('Tên nhân viên phải ngắn hơn 100 ký tự');
        }

        if (!staffData.phone || staffData.phone.trim().length === 0) {
          throw new Error('Số điện thoại không được để trống');
        }

        if (!/^[0-9]{10,11}$/.test(staffData.phone.replace(/\s/g, ''))) {
          throw new Error('Số điện thoại không hợp lệ');
        }

        if (!staffData.email || staffData.email.trim().length === 0) {
          throw new Error('Email không được để trống');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
          throw new Error('Email không hợp lệ');
        }

        // Check duplicate phone
        const isDuplicatePhone = state.staff.some(
          s => s.phone.replace(/\s/g, '') === staffData.phone.replace(/\s/g, '')
        );

        if (isDuplicatePhone) {
          throw new Error(`Số điện thoại "${staffData.phone}" đã được sử dụng`);
        }

        // Check duplicate email
        const isDuplicateEmail = state.staff.some(
          s => s.email.toLowerCase() === staffData.email.toLowerCase()
        );

        if (isDuplicateEmail) {
          throw new Error(`Email "${staffData.email}" đã được sử dụng`);
        }

        if (!staffData.role) {
          throw new Error('Vui lòng chọn vai trò');
        }

        const newStaff = {
          ...staffData,
          id: staffData.id || `staff_${Date.now()}`,
          employeeId: staffData.employeeId || `NV${String(Date.now()).slice(-4)}`,
          status: staffData.status || 'active',
          // Time tracking fields
          workStartedAt: staffData.workStartedAt || null, // ISO time when (re)activated
          accumulatedMinutes: staffData.accumulatedMinutes || 0, // total minutes over sessions
          lastWorkDate: staffData.lastWorkDate || new Date().toISOString().split('T')[0], // Track work date for daily reset
          joinDate: staffData.joinDate || new Date().toISOString().split('T')[0]
        };

        set((state) => ({
          staff: [...state.staff, newStaff]
        }));

        return newStaff;
      },

      updateStaff: (staffId, updates) => {
        const state = get();

        // Validate if updating name
        if (updates.name !== undefined) {
          if (updates.name.trim().length === 0) {
            throw new Error('Tên nhân viên không được để trống');
          }

          if (updates.name.length > 100) {
            throw new Error('Tên nhân viên phải ngắn hơn 100 ký tự');
          }
        }

        // Validate phone
        if (updates.phone !== undefined) {
          if (updates.phone.trim().length === 0) {
            throw new Error('Số điện thoại không được để trống');
          }

          if (!/^[0-9]{10,11}$/.test(updates.phone.replace(/\s/g, ''))) {
            throw new Error('Số điện thoại không hợp lệ');
          }

          // Check duplicate phone (exclude current staff)
          const isDuplicatePhone = state.staff.some(
            s => s.id !== staffId && s.phone.replace(/\s/g, '') === updates.phone.replace(/\s/g, '')
          );

          if (isDuplicatePhone) {
            throw new Error(`Số điện thoại "${updates.phone}" đã được sử dụng`);
          }
        }

        // Validate email
        if (updates.email !== undefined) {
          if (updates.email.trim().length === 0) {
            throw new Error('Email không được để trống');
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
            throw new Error('Email không hợp lệ');
          }

          // Check duplicate email (exclude current staff)
          const isDuplicateEmail = state.staff.some(
            s => s.id !== staffId && s.email.toLowerCase() === updates.email.toLowerCase()
          );

          if (isDuplicateEmail) {
            throw new Error(`Email "${updates.email}" đã được sử dụng`);
          }
        }

        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === staffId 
              ? { ...s, ...updates } 
              : s
          ),
        }));
      },

      deleteStaff: (staffId) => {
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== staffId)
        }));
      },

      toggleStaffStatus: (staffId) => {
        set((state) => ({
          staff: state.staff.map((s) => {
            if (s.id !== staffId) return s;

            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const lastDate = s.lastWorkDate || today;
            
            // Check if it's a new day - reset accumulated minutes
            const isNewDay = today !== lastDate;
            
            // Switching from active to on-break: accumulate and log time
            if (s.status === 'active') {
              let accumulated = isNewDay ? 0 : (s.accumulatedMinutes || 0);
              if (s.workStartedAt && !isNewDay) {
                const start = new Date(s.workStartedAt);
                const deltaMin = Math.max(0, Math.floor((now - start) / 60000));
                accumulated += deltaMin;
              }
              const h = Math.floor(accumulated / 60);
              const m = accumulated % 60;
              // Console log total worked time when pausing
              try { console.log(`[Staff] ${s.name} đã làm: ${h}h ${m}p`); } catch (_) {}
              return {
                ...s,
                status: 'on-break',
                statusDisplay: 'Đang nghỉ',
                accumulatedMinutes: accumulated,
                workStartedAt: null,
                lastWorkDate: today
              };
            }

            // Switching from non-active to active: start (or resume) counting
            return {
              ...s,
              status: 'active',
              statusDisplay: 'Đang làm việc',
              workStartedAt: isNewDay ? now.toISOString() : (s.workStartedAt || now.toISOString()),
              accumulatedMinutes: isNewDay ? 0 : (s.accumulatedMinutes || 0),
              lastWorkDate: today
            };
          }),
        }));
      },

      setStaffStatus: (staffId, status, statusDisplay) => {
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === staffId 
              ? { ...s, status, statusDisplay } 
              : s
          ),
        }));
      },

      // Bulk Actions
      bulkDeleteStaff: (staffIds) => {
        set((state) => ({
          staff: state.staff.filter((s) => !staffIds.includes(s.id))
        }));
      },

      bulkUpdateRole: (staffIds, role, roleDisplay) => {
        set((state) => ({
          staff: state.staff.map((s) =>
            staffIds.includes(s.id)
              ? { ...s, role, roleDisplay }
              : s
          ),
        }));
      },

      bulkUpdateStatus: (staffIds, status, statusDisplay) => {
        set((state) => ({
          staff: state.staff.map((s) =>
            staffIds.includes(s.id)
              ? { ...s, status, statusDisplay }
              : s
          ),
        }));
      },

      // Getters
      getAllStaff: () => get().staff,

      getStaffById: (staffId) => {
        return get().staff.find((s) => s.id === staffId);
      },

      getStaffByRole: (role) => {
        return get().staff.filter((s) => s.role === role);
      },

      getActiveStaff: () => {
        return get().staff.filter((s) => s.status === 'active');
      },

      getInactiveStaff: () => {
        return get().staff.filter((s) => s.status === 'inactive');
      },

      getOnBreakStaff: () => {
        return get().staff.filter((s) => s.status === 'on-break');
      },

      getStaffCount: () => {
        return get().staff.length;
      },

      getActiveStaffCount: () => {
        return get().staff.filter((s) => s.status === 'active').length;
      },

      getStaffByStatus: (status) => {
        return get().staff.filter((s) => s.status === status);
      },

      // Search and Filter
      searchStaff: (query) => {
        const searchLower = query.toLowerCase().trim();
        return get().staff.filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.employeeId.toLowerCase().includes(searchLower) ||
          s.phone.includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
        );
      },

      filterStaff: (filters) => {
        let staffList = get().staff;

        if (filters.role && filters.role !== '') {
          staffList = staffList.filter(s => s.role === filters.role);
        }

        if (filters.status && filters.status !== '') {
          staffList = staffList.filter(s => s.status === filters.status);
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase().trim();
          staffList = staffList.filter(s =>
            s.name.toLowerCase().includes(searchLower) ||
            s.employeeId.toLowerCase().includes(searchLower) ||
            s.phone.includes(searchLower) ||
            s.email.toLowerCase().includes(searchLower)
          );
        }

        return staffList;
      },

      // Statistics
      getStaffStats: () => {
        const state = get();
        
        return {
          total: state.staff.length,
          active: state.staff.filter(s => s.status === 'active').length,
          onBreak: state.staff.filter(s => s.status === 'on-break').length,
          inactive: state.staff.filter(s => s.status === 'inactive').length,
          averageOrders: 0, // Calculated dynamically in components
          totalOrders: 0, // Calculated dynamically in components
          totalHours: 0 // Calculated dynamically in components
        };
      },

      // Helper: Total worked minutes based on activation/pause events
      getWorkedMinutes: (staff) => {
        if (!staff) return 0;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastDate = staff.lastWorkDate || today;
        
        // If it's a new day, reset to 0
        if (today !== lastDate) {
          return 0;
        }
        
        let total = staff.accumulatedMinutes || 0;
        if (staff.status === 'active' && staff.workStartedAt) {
          const start = new Date(staff.workStartedAt);
          total += Math.max(0, Math.floor((now - start) / 60000));
        }
        return total;
      },

      // Helper: Calculate hours worked (decimal hours) from minutes for stats
      calculateHoursWorked: (staff) => {
        const minutes = get().getWorkedMinutes(staff);
        return Math.round((minutes / 60) * 10) / 10; // Round to 1 decimal hour
      },

      // Helper: Get orders today count for a staff member
      // This will be called from components that have access to order store
      getOrdersTodayForStaff: (staffId) => {
        // This is a placeholder - will be calculated in the component
        // where we have access to both stores
        return 0;
      },

      getRoleStats: () => {
        const state = get();
        const roleCount = {};
        
        state.staff.forEach(s => {
          if (roleCount[s.role]) {
            roleCount[s.role]++;
          } else {
            roleCount[s.role] = 1;
          }
        });

        return roleCount;
      }
    }),
    {
      name: "staff-storage", // localStorage key
      partialize: (state) => ({
        staff: state.staff
      }),
    }
  )
);
