import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Image from '../../../../components/AppImage';
import { formatCurrency, parseCurrency, digitsOnly } from '../../../../utils/formatters';
import { useToast } from '../../../../hooks/use-toast';

const MenuItemModal = ({
  isOpen,
  onClose,
  onSave,
  item = null,
  categories = []
}) => {
  const { toast } = useToast();
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
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price ? formatCurrency(item.price.toString()) : '',
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

    const priceValue = parseCurrency(formData?.price || '');
    if (!formData?.price || priceValue <= 0) {
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
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        price: parseCurrency(formData?.price),
        category: formData.category,
        image: formData.image || '',
        status: formData.status,
        stock_quantity: formData?.stock_quantity ? parseInt(formData?.stock_quantity) : 0,
        unit: formData.unit
      };

      if (onSave) {
        onSave(submitData);
      }

      onClose();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi lưu món ăn",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const value = e?.target?.value;
    setFormData(prev => ({ ...prev, image: value }));
    setImagePreview(value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center overflow-hidden">
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
                  type="text"
                  value={formData?.price}
                  onChange={(e) => {
                    const cleaned = digitsOnly(e?.target?.value);
                    const formatted = formatCurrency(cleaned);
                    setFormData(prev => ({ ...prev, price: formatted }));
                  }}
                  error={errors?.price}
                  required
                  placeholder="0"
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
              {/* Upload Method Tabs */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hình ảnh món ăn
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('upload')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMethod === 'upload'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Icon name="Upload" size={16} className="inline mr-2" />
                    Tải ảnh lên
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMethod === 'url'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Icon name="Link" size={16} className="inline mr-2" />
                    URL
                  </button>
                </div>
              </div>

              {/* Upload Area */}
              {uploadMethod === 'upload' ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="block w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center">
                            <Icon name="Upload" size={32} className="mx-auto mb-2" />
                            <p className="text-sm font-medium">Thay đổi ảnh</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Icon name="ImagePlus" size={48} className="mx-auto mb-3 text-primary/50 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-medium mb-1">Nhấn để chọn ảnh</p>
                        <p className="text-xs">PNG, JPG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      iconName="Trash2"
                      iconPosition="left"
                      className="w-full"
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <Input
                    label="URL hình ảnh"
                    type="url"
                    value={formData?.image}
                    onChange={handleImageChange}
                    placeholder="https://example.com/image.jpg"
                  />

                  {/* Image Preview */}
                  <div className="w-full h-40 flex-shrink-0 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Icon name="ImagePlus" size={24} className="mx-auto mb-2" />
                        <p className="text-xs">Nhập URL để xem trước</p>
                      </div>
                    )}
                  </div>

                  {/* Sample Images */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Hoặc chọn ảnh mẫu
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
              )}
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