import React from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';

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
          className="whitespace-nowrap hover-scale flex items-center space-x-2"
        >
          {category?.icon && (
            <Icon
              name={category?.icon}
              size={16}
              className={activeCategory === category?.id ? 'text-primary-foreground' : ''}
            />
          )}
          <span>{category?.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default MenuCategory;