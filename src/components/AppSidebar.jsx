// AppSidebar.jsx
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CSidebar, CSidebarBrand } from '@coreui/react'
import logo from '../assets/logo.png'

import getNavigation from '../_nav'
import { AppSidebarNav } from './AppSidebarNav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const storedUser = JSON.parse(localStorage.getItem("user")); // ✅ Moved here for reusability
  const role = storedUser?.user?.role; // ✅ Get role directly
  // Assume role is stored in Redux or context

  const navigation = getNavigation(role)

  return (
    <CSidebar visible={sidebarShow} onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}>
      <CSidebarBrand to="/">
        <img src={logo} alt="Logo" className="sidebar-brand-full" height={70} />
      </CSidebarBrand>

      <AppSidebarNav items={navigation} />
    </CSidebar>
  )
}

export default AppSidebar
