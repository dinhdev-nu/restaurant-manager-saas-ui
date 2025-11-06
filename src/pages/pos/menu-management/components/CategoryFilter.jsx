import React from 'react';

import Button from '../../../../components/ui/Button';

const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  itemCounts = {}
}) => {
  const allCount = Object.values(itemCounts)?.reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {/* All categories */}
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('all')}
        className="flex-shrink-0"
      >
        <span>Tất cả</span>
        {allCount > 0 && (
          <span className={`
            ml-2 px-2 py-0.5 rounded-full text-xs
            ${selectedCategory === 'all' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
            }
          `}>
            {allCount}
          </span>
        )}
      </Button>
      {/* Individual categories */}
      {categories?.map((category) => {
        const count = itemCounts?.[category?.id] || 0;
        const isSelected = selectedCategory === category?.id;

        return (
          <Button
            key={category?.id}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category?.id)}
            className="flex-shrink-0"
            iconName={category?.icon}
            iconPosition="left"
          >
            <span>{category?.name}</span>
            {count > 0 && (
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${isSelected
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
      {/* Add category button */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 text-muted-foreground border-dashed"
        iconName="Plus"
        iconPosition="left"
      >
        Thêm danh mục
      </Button>
    </div>
  );
};

export default CategoryFilter;