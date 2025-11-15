import React from 'react';
import Button from './Button';
import Icon from '../AppIcon';

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "default", // default, danger, success
    icon = "AlertCircle"
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconColor: 'text-error',
                    confirmVariant: 'error'
                };
            case 'success':
                return {
                    iconColor: 'text-success',
                    confirmVariant: 'success'
                };
            default:
                return {
                    iconColor: 'text-primary',
                    confirmVariant: 'default'
                };
        }
    };

    const styles = getVariantStyles();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[1500] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-surface rounded-lg shadow-modal max-w-md w-full animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 ${styles.iconColor}`}>
                            <Icon name={icon} size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 flex items-center justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="hover-scale"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={styles.confirmVariant}
                        onClick={handleConfirm}
                        className="hover-scale"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
