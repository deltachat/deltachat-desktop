import React, { PropsWithChildren, useState, useEffect } from 'react'
import classNames from 'classnames'
import useTranslationFunction from '../../hooks/useTranslationFunction'

interface TabListProps {
  tabNames: string[]
  tabChangeCb: (newTab: string) => void
}

export default function TabList({
  tabNames,
  tabChangeCb,
  children,
}: PropsWithChildren<TabListProps>) {
  const [currentTab, setCurrentTab] = useState<number>(0)
  useEffect(
    () => tabChangeCb(tabNames[currentTab]),
    [currentTab, tabChangeCb, tabNames]
  )
  const [tabs, extra] = (function () {
    if (Array.isArray(children)) {
      if (children.length === 2) {
        return children
      } else if (children.length == 1) {
        return [children, null]
        // will it really happen? --Farooq
      } else {
        throw new Error('TabList must have exactly 1 or 2 children')
      }
    } else {
      return [children, null]
    }
  })()
  const childToRender = Array.isArray(tabs) ? tabs[currentTab] : tabs
  return (
    <>
      <TabListHeader
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        tabs={tabNames}
      >
        {extra}
      </TabListHeader>
      {childToRender}
    </>
  )
}

interface TabListHeaderProps {
  currentTab: number
  onChangeTab: (newTab: number) => void
  tabs: string[]
}

function TabListHeader({
  currentTab,
  onChangeTab,
  tabs,
  children,
}: PropsWithChildren<TabListHeaderProps>) {
  return (
    <div className='tablist-header'>
      <ul>
        {tabs.map((tab: string, index: number) => {
          if (index == currentTab) {
            return (
              <TabHeader
                name={tab}
                key={tab}
                isFocused
                onClick={onChangeTab.bind(null, index)}
              />
            )
          } else {
            return (
              <TabHeader
                name={tab}
                key={tab}
                onClick={onChangeTab.bind(null, index)}
              />
            )
          }
        })}
      </ul>
      {children}
    </div>
  )
}

interface TabHeaderProps {
  name: string
  isFocused?: boolean
  onClick: () => void
}

function TabHeader({ name, isFocused, onClick }: TabHeaderProps) {
  const tx = useTranslationFunction()

  return (
    <li
      key={name}
      className={classNames('tab-header', isFocused && 'focused')}
      onClick={onClick}
    >
      {tx(name)}
    </li>
  )
}
