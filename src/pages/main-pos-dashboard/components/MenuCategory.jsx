import React from 'react';
import Button from '../../../components/ui/Button';

const MenuCategory = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto">
      {categories?.map((category) => (
        <Button
          key={category?.id}
          variant={activeCategory === category?.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category?.id)}
          className="whitespace-nowrap hover-scale"
        >
          {category?.name}
        </Button>
      ))}
    </div>
  );
};

export default MenuCategory;