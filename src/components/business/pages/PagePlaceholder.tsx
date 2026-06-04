import React from 'react';

const PagePlaceholder: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{title || 'Business Page'}</h2>
      <div className="bg-white border rounded p-4">{children || <p>占位页面 · 正在实现中</p>}</div>
    </div>
  );
};

export default PagePlaceholder;
