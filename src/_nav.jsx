import React from 'react';
import CIcon from '@coreui/icons-react';
import { 
  cilStar, cilContact, cilInfo, cilBook, cilUser, cilList, cilPen, 
  cilPlus, cilSettings, cilEducation, cilPeople, cilSchool, cilReportSlash,
  cilTask,
  cilSync,
  cilSpreadsheet,
  cilUserPlus,
  cilChartLine,
  cilGraph,
  cilLibrary,
  cilCloudDownload,
  cilCalculator,
  cilPhone,
  cilChatBubble,
  cilEnvelopeClosed,
  cilNotes
} from '@coreui/icons';
import { CNavGroup, CNavItem,} from '@coreui/react';

// Define navigation based on roles
export const getNavigation = (role) => {
  let navigation = [];


  // Admin Specific Pages
    if (role === 'admin') {
      navigation.push(
        { component: CNavItem, name: 'Profile', to: '/admin-dashboard/profile?role=admin', icon: <CIcon icon={cilUser} customClassName="nav-icon" />,},
        {
          component: CNavGroup,
          name: 'Courses',
          icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
          items: [
            { component: CNavItem, name: 'Add Course', to: '/add-course', icon: <CIcon icon={cilPlus} customClassName="nav-icon" />, className: 'ms-4' },
            { component: CNavItem, name: 'See Courses', to: '/see-courses', icon: <CIcon icon={cilList} customClassName="nav-icon" />, className: 'ms-4' },
            { component: CNavItem, name: 'Update Course', to: '/update-course-allotment', icon: <CIcon icon={cilPen} customClassName="nav-icon" />, className: 'ms-4' },
          
          ],
        },
        {
        component: CNavGroup,
        name: 'Course Allotment',
        icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'Allot Course', to: '/add-course-allotment', icon: <CIcon icon={cilPen} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'See Allotment', to: '/see-course-allotment', icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Update Allotment', to: '/see-course-coordinators', icon: <CIcon icon={cilSync} customClassName="nav-icon" />, className: 'ms-4' },
        ],
      },
      {
        component: CNavGroup,
        name: 'Course Coordinator',
        icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'Add Coordinator', to: '/add-course-allotment', icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'See Coordinators', to: '/see-course-allotment', icon: <CIcon icon={cilPeople} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Update Coordinator', to: '/see-course-coordinators', icon: <CIcon icon={cilSync} customClassName="nav-icon" />, className: 'ms-4' },
        ],
      },
      {
        component: CNavGroup,
        name: 'Faculty',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'See Faculty', to: '/see-faculty', icon: <CIcon icon={cilList} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Add Faculty', to: '/add-faculty', icon: <CIcon icon={cilPlus} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Update Faculty', to: '/update-faculty', icon: <CIcon icon={cilPen} customClassName="nav-icon" />, className: 'ms-4' },
        ],
      },
      {
        component: CNavGroup,
        name: 'Students',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'See Students', to: '/see-faculty', icon: <CIcon icon={cilList} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Add Students', to: '/add-faculty', icon: <CIcon icon={cilPlus} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Update Student', to: '/update-faculty', icon: <CIcon icon={cilPen} customClassName="nav-icon" />, className: 'ms-4' },
        ],
      },
      {
        component: CNavGroup,
        name: 'Attainment',
        icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'Attainment Overview', to: '/see-attainment-all-courses', icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Report and Analysis', to: '/see-attainment-selected-courses', icon: <CIcon icon={cilGraph} customClassName="nav-icon" />, className: 'ms-4' },
        ],
      }
    );
  }

  // Faculty Specific Pages
  if (role === 'faculty') {
    navigation.push(
      { component: CNavItem, name: 'Profile', to: '/faculty-dashboard/profile?role=faculty', icon: <CIcon icon={cilUser} customClassName="nav-icon" />,},
      { component: CNavItem, name: 'Add Marks', to: '/add-marks', icon: <CIcon icon={cilPen} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Update Marks', to: '/see-subjects-teaching', icon: <CIcon icon={cilList} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'My Courses', to: '/see-attainment', icon: <CIcon icon={cilList} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Download Attainment', to: '/see-attainment', icon: <CIcon icon={cilList} customClassName="nav-icon" /> }
    );
  }
  

  // Coordinator Specific Pages
  if (role === 'coordinator') {
    navigation.push(
      { component: CNavItem, name: 'Profile', to: '/coordinator-dashboard/profile?role=coordinator', icon: <CIcon icon={cilUser} customClassName="nav-icon" />,},
      { component: CNavItem, name: 'Add Marks', to: '/add-marks', icon: <CIcon icon={cilPen} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Update Marks', to: '/see-subjects-teaching', icon: <CIcon icon={cilSync} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'My Courses', to: '/see-attainment', icon: <CIcon icon={cilLibrary} customClassName="nav-icon" /> },
      {
        component: CNavGroup,
        name: 'Attainment',
        icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'Set Target', to: '/see-attainment-all-courses', icon: <CIcon icon={cilSettings} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Calculate Attainment', to: '/see-attainment-selected-courses', icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />, className: 'ms-4' },
          { component: CNavItem, name: 'Download Reports', to: '/see-attainment-selected-courses', icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />, className: 'ms-4' },
        ],
      }
    );
  }

  // Help & About Section moved to the end
  navigation.push(
    {
      component: CNavGroup,
      name: 'Help & About',
      icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Help',
          to: '/help',
          icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
          className: 'ms-4',
        },
        {
          component: CNavItem,
          name: 'Contact',
          to: '/contact',
          icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" />,
          className: 'ms-4',
        },
        {
          component: CNavItem,
          name: 'About Us',
          to: '/about-us',
          icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
          className: 'ms-4',
        },
      ],
    }
  );

  return navigation;
};

export default getNavigation;
