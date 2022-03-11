import React from 'react'

export default function Sidebar({setShowSidebar} : {setShowSidebar: any}) { 
  return ( 
    <div className="sidebar-dropshadow" onClick={() => setShowSidebar(false)}>
      <div className="sidebar">
        hallo
      </div>
    </div>
  )
}
