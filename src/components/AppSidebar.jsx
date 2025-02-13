// src/components/AppSidebar.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSidebar, CSidebarBrand, CSidebarNav, CNavItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSpeedometer, cilUser, cilSettings } from '@coreui/icons';
import navigation from '../_nav';
import logo from '../assets/logo.png';
import sygnet from '../assets/backimg.jpg';

const AppSidebar = () => {
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);

  return (
    <CSidebar
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
    >
      <CSidebarBrand to="/">
        <img src={logo} alt="Logo" className="sidebar-brand-full" height={32} />
        <img src={sygnet} alt="Sygnet" className="sidebar-brand-narrow" height={32} />
      </CSidebarBrand>
      <CSidebarNav>
        {navigation.map((item, index) => (
          <CNavItem key={index} name={item.name} to={item.to}>
            <CIcon icon={item.icon} className="me-2" />
            {item.name}
          </CNavItem>
        ))}
      </CSidebarNav>
    </CSidebar>
  );
};

export default AppSidebar;
