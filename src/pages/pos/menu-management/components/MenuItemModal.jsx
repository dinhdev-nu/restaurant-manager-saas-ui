import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Image from '../../../../components/AppImage';

const MenuItemModal = ({
  isOpen,
  onClose,
  onSave,
  item = null,
  categories = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    status: 'available',
    stock_quantity: '',
    unit: 'phần'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price?.toString() || '',
        category: item?.category || '',
        image: item?.image || '',
        status: item?.status || 'available',
        stock_quantity: item?.stock_quantity?.toString() || '',
        unit: item?.unit || 'phần'
      });
      setImagePreview(item?.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        status: 'available',
        stock_quantity: '',
        unit: 'phần'
      });
      setImagePreview('');
    }
    setErrors({});
  }, [item, isOpen]);

  const categoryOptions = categories?.map(cat => ({
    value: cat?.id,
    label: cat?.name
  }));

  const statusOptions = [
    { value: 'available', label: 'Có sẵn' },
    { value: 'unavailable', label: 'Hết hàng' }
  ];

  const unitOptions = [
    { value: 'phần', label: 'Phần' },
    { value: 'ly', label: 'Ly' },
    { value: 'chai', label: 'Chai' },
    { value: 'kg', label: 'Kg' },
    { value: 'gram', label: 'Gram' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Tên món ăn là bắt buộc';
    }

    if (!formData?.category) {
      newErrors.category = 'Danh mục là bắt buộc';
    }

    if (!formData?.price || isNaN(formData?.price) || parseFloat(formData?.price) <= 0) {
      newErrors.price = 'Giá phải là số dương';
    }

    if (formData?.stock_quantity && (isNaN(formData?.stock_quantity) || parseInt(formData?.stock_quantity) < 0)) {
      newErrors.stock_quantity = 'Số lượng tồn kho phải là số không âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData?.price),
        stock_quantity: formData?.stock_quantity ? parseInt(formData?.stock_quantity) : null,
        id: item?.id || Date.now(),
        updated_at: new Date()?.toISOString()
      };

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const value = e?.target?.value;
    setFormData(prev => ({ ...prev, image: value }));
    setImagePreview(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {item ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <Input
                label="Tên món ăn"
                type="text"
                value={formData?.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e?.target?.value }))}
                error={errors?.name}
                required
                placeholder="Nhập tên món ăn"
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData?.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e?.target?.value }))}
                  placeholder="Mô tả chi tiết về món ăn"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Giá (VND)"
                  type="number"
                  value={formData?.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e?.target?.value }))}
                  error={errors?.price}
                  required
                  placeholder="0"
                  min="0"
                  step="1000"
                />

                <Select
                  label="Danh mục"
                  options={categoryOptions}
                  value={formData?.category}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  error={errors?.category}
                  required
                  placeholder="Chọn danh mục"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tồn kho"
                  type="number"
                  value={formData?.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e?.target?.value }))}
                  error={errors?.stock_quantity}
                  placeholder="Số lượng"
                  min="0"
                />

                <Select
                  label="Đơn vị"
                  options={unitOptions}
                  value={formData?.unit}
                  onChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  placeholder="Chọn đơn vị"
                />
              </div>

              <Select
                label="Trạng thái"
                options={statusOptions}
                value={formData?.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                placeholder="Chọn trạng thái"
              />
            </div>

            {/* Right Column - Image */}
            <div className="space-y-4">
              <Input
                label="URL hình ảnh"
                type="url"
                value={formData?.image}
                onChange={handleImageChange}
                placeholder="https://example.com/image.jpg"
              />

              {/* Image Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Xem trước
                </label>
                <div className="w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Icon name="ImagePlus" size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Chưa có hình ảnh</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Images */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Hình ảnh mẫu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200',
                    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=200',
                    'https://images.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg'
                  ]?.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: url }));
                        setImagePreview(url);
                      }}
                      className="w-full h-16 rounded border border-border overflow-hidden hover:ring-2 hover:ring-primary transition-smooth"
                    >
                      <Image
                        src={url}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            loading={isLoading}
            iconName="Save"
            iconPosition="left"
          >
            {item ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;