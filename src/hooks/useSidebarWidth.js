import { useEffect, useState } from 'react';

export const useSidebarWidth = () => {
  const [sidebarWidth, setSidebarWidth] = useState(250);

  useEffect(() => {
    const updateWidth = () => {
      const sidebar = document.querySelector('.AppSidebar');
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return sidebarWidth;
};