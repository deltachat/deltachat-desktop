import classNames from 'classnames'
import React, {useEffect, useState} from 'react'

export type SidebarState = 'init' | 'visible' | 'invisible'

const Sidebar = React.memo(({sidebarState, setSidebarState} : {sidebarState: SidebarState, setSidebarState: any})  => { 
  return ( 
    <>
      {sidebarState === 'visible' && <div className="backdrop" onClick={() => setSidebarState('invisible')}/>}
      <div className={classNames("sidebar", sidebarState === 'init' ? {} : {visible: sidebarState === 'visible', invisible: sidebarState === 'invisible'})} >
        hallo
      </div>
    </>
  )
})

export default Sidebar
