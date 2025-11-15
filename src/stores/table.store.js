import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTableStore = create(
  persist(
    (set, get) => ({
      // State
      tables: [],
      floors: [
        { id: 1, name: 'Tầng 1', tables: [] }
      ],
      currentFloor: 1,
      selectedTable: null,

      // Actions
      addTable: (table) => {
        const state = get();
        
        // Validate table number length
        if (table.number && table.number.length >= 10) {
          throw new Error('Tên bàn phải ngắn hơn 10 ký tự');
        }
        
        // Check if table number already exists on the same floor
        const isDuplicate = state.tables.some(
          t => t.number === table.number && t.floor === table.floor
        );
        
        if (isDuplicate) {
          throw new Error(`Bàn ${table.number} đã tồn tại trên ${state.floors.find(f => f.id === table.floor)?.name || 'tầng này'}`);
        }

        const newTable = {
          ...table,
          id: table.id || `table_${Date.now()}`,
          status: table.status || 'available',
          currentOccupancy: table.currentOccupancy || 0,
          assignedServer: table.assignedServer || null,
          orderId: table.orderId || null,
          estimatedWaitTime: table.estimatedWaitTime || null
        };

        set((state) => ({
          tables: [...state.tables, newTable]
        }));

        return newTable;
      },

      updateTable: (tableId, updates) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, ...updates } : table
          ),
        }));
      },

      deleteTable: (tableId) => {
        set((state) => ({
          tables: state.tables.filter((table) => table.id !== tableId),
          selectedTable: state.selectedTable?.id === tableId ? null : state.selectedTable
        }));
      },

      updateTablePosition: (tableId, position) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId 
              ? { ...table, x: position.x, y: position.y } 
              : table
          ),
        }));
      },

      setTableStatus: (tableId, status) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, status } : table
          ),
        }));
      },

      assignOrder: (tableId, orderId, occupancy) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId 
              ? { 
                  ...table, 
                  orderId, 
                  status: 'occupied',
                  currentOccupancy: occupancy || table.currentOccupancy
                } 
              : table
          ),
        }));
      },

      clearOrder: (tableId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId 
              ? { 
                  ...table, 
                  orderId: null, 
                  status: 'available',
                  currentOccupancy: 0,
                  assignedServer: null
                } 
              : table
          ),
        }));
      },

      assignServer: (tableId, serverName) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, assignedServer: serverName } : table
          ),
        }));
      },

      setSelectedTable: (table) => {
        set({ selectedTable: table });
      },

      clearSelectedTable: () => {
        set({ selectedTable: null });
      },

      // Floor management
      addFloor: () => {
        set((state) => {
          const newFloorId = state.floors.length + 1;
          return {
            floors: [...state.floors, { id: newFloorId, name: `Tầng ${newFloorId}`, tables: [] }]
          };
        });
      },

      deleteFloor: (floorId) => {
        set((state) => {
          if (state.floors.length <= 1) return state; // Cannot delete last floor

          return {
            floors: state.floors.filter((f) => f.id !== floorId),
            tables: state.tables.filter((t) => t.floor !== floorId),
            currentFloor: state.currentFloor === floorId ? 1 : state.currentFloor
          };
        });
      },

      setCurrentFloor: (floorId) => {
        set({ currentFloor: floorId, selectedTable: null });
      },

      // Getters
      getTables: () => get().tables,

      getTableById: (tableId) => {
        return get().tables.find((table) => table.id === tableId);
      },

      getTableByNumber: (number) => {
        return get().tables.find((table) => table.number === number);
      },

      getAvailableTables: () => {
        return get().tables.filter((table) => table.status === 'available');
      },

      getOccupiedTables: () => {
        return get().tables.filter((table) => table.status === 'occupied');
      },

      getTablesByFloor: (floorId) => {
        return get().tables.filter((table) => table.floor === floorId);
      },

      getCurrentFloorTables: () => {
        return get().tables.filter((table) => table.floor === get().currentFloor);
      },

      getTableOptions: () => {
        const state = get();
        return state.tables
          .filter(table => table.status === 'available')
          .map(table => {
            const floor = state.floors.find(f => f.id === table.floor);
            const floorName = floor?.name || `Tầng ${table.floor}`;
            return {
              value: table.id,
              label: `${floorName} - Bàn ${table.number}`,
              capacity: table.capacity,
              floor: table.floor
            };
          });
      },

      getTableLabel: (tableId) => {
        const state = get();
        const table = state.tables.find(t => t.id === tableId);
        if (!table) return tableId;
        
        const floor = state.floors.find(f => f.id === table.floor);
        const floorName = floor?.name || `Tầng ${table.floor}`;
        return `${floorName} - Bàn ${table.number}`;
      },

      // Check if table number exists on a specific floor
      isTableNumberExists: (number, floorId) => {
        return get().tables.some(t => t.number === number && t.floor === floorId);
      },

      // Get table by order ID
      getTableByOrderId: (orderId) => {
        return get().tables.find(t => t.orderId === orderId);
      }
    }),
    {
      name: "table-storage", // localStorage key
      partialize: (state) => ({
        tables: state.tables,
        floors: state.floors,
        currentFloor: state.currentFloor
      }),
    }
  )
);
