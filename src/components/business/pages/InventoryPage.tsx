import React from 'react';
import PagePlaceholder from './PagePlaceholder';

const InventoryPage: React.FC = () => {
  return (
    <PagePlaceholder title="库存管理">
      <p>库存实时视图占位（稍后接入 `inventory` collection）。</p>
    </PagePlaceholder>
  );
};

export default InventoryPage;
