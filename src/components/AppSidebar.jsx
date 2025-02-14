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
  <img src={logo} alt="Logo" className="sidebar-brand-full" height={100} />
  <span className="sidebar-brand-text" style={{ fontSize: "1.2rem", fontWeight: "bold", marginLeft: "10px" }}>
    AttainX
  </span>
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
