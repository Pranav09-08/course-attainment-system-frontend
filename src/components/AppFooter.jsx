import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://pict.edu/" target="_blank" rel="noopener noreferrer">
          PICT
        </a>
        <span className="ms-1">&copy; 2025 401 Authorized.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://pict.edu/IT-dept/" target="_blank" rel="noopener noreferrer">
          PICT IT department
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
