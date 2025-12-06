import React, { memo, useMemo, useEffect, useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';
import { useStaffStore } from '../../../../stores';
import { useOrderStore } from '../../../../stores/order.store';

const StaffTable = memo(({
  staff,
  onEdit,
  onToggleStatus,
  onViewDetails,
  onDelete,
  selectedStaff,
  onSelectStaff,
  onSelectAll,
  isAllSelected
}) => {
  const getWorkedMinutes = useStaffStore((state) => state.getWorkedMinutes);
  const orders = useOrderStore((state) => state.orders);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Re-render each minute to update worked time
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(i);
  }, []);

  // Memoize dynamic data for all staff to avoid recalculating on each row render
  const staffDynamicDataMap = useMemo(() => {
    const dataMap = new Map();
    staff.forEach(member => {
      const ordersToday = orders.filter(order => {
        const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
        return orderDate === today && order.staffId === member._id;
      }).length;

      const minutes = getWorkedMinutes(member);
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const workedDisplay = `${h}h ${m}p`;

      dataMap.set(member._id, { ordersToday, workedDisplay });
    });
    return dataMap;
  }, [staff, orders, today, getWorkedMinutes, tick]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'on-break': return 'text-warning';
      case 'inactive': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10';
      case 'on-break': return 'bg-warning/10';
      case 'inactive': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-primary text-primary-foreground';
      case 'manager': return 'bg-accent text-accent-foreground';
      case 'cashier': return 'bg-secondary text-secondary-foreground';
      case 'kitchen': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Mobile warning */}
      <div className="md:hidden bg-warning/10 border-b border-warning/20 p-3 flex items-center space-x-2">
        <Icon name="Info" size={16} className="text-warning" />
        <p className="text-sm text-warning">Cuộn sang ngang để xem đầy đủ thông tin</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Nhân viên</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Vai trò</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Trạng thái</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Liên hệ</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Ca làm</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Hiệu suất</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member, index) => {
              const dynamicData = staffDynamicDataMap.get(member._id) || { ordersToday: 0, workedDisplay: '0h 0p' };

              return (
                <tr
                  key={member._id}
                  className={`
                  border-b border-border hover:bg-muted/20 transition-colors duration-200
                  ${index % 2 === 0 ? 'bg-background' : 'bg-muted/5'}
                `}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(member._id)}
                      onChange={() => onSelectStaff(member._id)}
                      className="rounded border-border"
                    />
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`
                        absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-card
                        ${member.status === 'active' ? 'bg-success' : member.status === 'on-break' ? 'bg-warning' : 'bg-error'}
                      `} />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.employeeId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${getRoleColor(member.role)}
                  `}>
                      {member.roleDisplay}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${getStatusBg(member.status)} ${getStatusColor(member.status)}
                  `}>
                      {member.statusDisplay}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Icon name="Phone" size={12} />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Icon name="Mail" size={12} />
                        <span className="truncate max-w-32">{member.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-card-foreground font-medium">{member.shift}</p>
                      <p className="text-muted-foreground">{member.workingHours}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-card-foreground font-medium">{dynamicData.ordersToday} đơn</p>
                      <p className="text-muted-foreground">{dynamicData.workedDisplay} làm việc</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(member)}
                        className="hover-scale"
                      >
                        <Icon name="Eye" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(member)}
                        className="hover-scale"
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStatus(member)}
                        className="hover-scale"
                      >
                        <Icon name={member.status === 'active' ? 'Pause' : 'Play'} size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(member)}
                        className="hover-scale text-error hover:text-error"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

StaffTable.displayName = 'StaffTable';

export default StaffTable;