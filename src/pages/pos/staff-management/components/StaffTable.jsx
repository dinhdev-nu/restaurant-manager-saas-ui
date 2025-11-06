import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';

const StaffTable = ({
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
      <div className="overflow-x-auto">
        <table className="w-full">
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
            {staff?.map((member, index) => (
              <tr
                key={member?.id}
                className={`
                  border-b border-border hover:bg-muted/20 transition-smooth
                  ${index % 2 === 0 ? 'bg-background' : 'bg-muted/5'}
                `}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedStaff?.includes(member?.id)}
                    onChange={() => onSelectStaff(member?.id)}
                    className="rounded border-border"
                  />
                </td>

                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={member?.avatar}
                          alt={member?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`
                        absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-card
                        ${member?.status === 'active' ? 'bg-success' : member?.status === 'on-break' ? 'bg-warning' : 'bg-error'}
                      `} />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{member?.name}</p>
                      <p className="text-sm text-muted-foreground">{member?.employeeId}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${getRoleColor(member?.role)}
                  `}>
                    {member?.roleDisplay}
                  </span>
                </td>

                <td className="p-4">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${getStatusBg(member?.status)} ${getStatusColor(member?.status)}
                  `}>
                    {member?.statusDisplay}
                  </span>
                </td>

                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Phone" size={12} />
                      <span>{member?.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Mail" size={12} />
                      <span className="truncate max-w-32">{member?.email}</span>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="text-sm">
                    <p className="text-card-foreground font-medium">{member?.shift}</p>
                    <p className="text-muted-foreground">{member?.workingHours}</p>
                  </div>
                </td>

                <td className="p-4">
                  <div className="text-sm">
                    <p className="text-card-foreground font-medium">{member?.ordersToday} đơn</p>
                    <p className="text-muted-foreground">{member?.hoursWorked}h làm việc</p>
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
                      <Icon name={member?.status === 'active' ? 'Pause' : 'Play'} size={14} />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;