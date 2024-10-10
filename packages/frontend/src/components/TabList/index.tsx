import React, { PropsWithChildren, useState, useEffect, ReactNode } from 'react'
import classNames from 'classnames'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import styles from './styles.module.scss'

type TabName = string

interface TabListProps {
  tabNames: TabName[]
  tabChangeCb?: (newTab: TabName) => void
  extra?: ReactNode
}

/**
 * TabList component can be used to render one element/component
 * at a time, called "current tab" which is switchable by a tab header. E.g.
 * Each time one of the "tabs" is shown and user can switch between them by clicking on the
 * tab names above in the header. TabList component also supports a secondary "extra"
 * child to be rendered at the right of tab header. An example is shown below:
 * ```js
 * <TabList tabs={["Tab one", "Tab two", "Tab 3"]}>
 *   <TabOneComponent />
 *   <TabTwoComponent />
 *   <TabThreeComponent />
 * </TabList>
 * ```
 * Another example using the "extra" child
 * ```js
 * <TabList tabs={["Tab uno", "Tab zwei"]} extra={<p>Extra child</p>}>
 *   <TabOne />
 *   <TabTwo />
 * </TabList>
 * ```
 */
export default function TabList({
  tabNames,
  tabChangeCb,
  children,
  extra,
}: PropsWithChildren<TabListProps>) {
  const [currentTab, setCurrentTab] = useState<number>(0)
  useEffect(
    () => tabChangeCb && tabChangeCb(tabNames[currentTab]),
    [currentTab, tabChangeCb, tabNames]
  )

  if (Array.isArray(children)) {
    if (children.length != tabNames.length) {
      throw new Error(
        'Number of tab components inequal to number of tabs specified in tabNames'
      )
    }
  } else {
    if (tabNames.length !== 1) {
      throw new Error(
        'You have provided one child but specified multiple tab names'
      )
    }
  }
  const childToRender = Array.isArray(children)
    ? children[currentTab]
    : children
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
  tabs: TabName[]
}

function TabListHeader({
  currentTab,
  onChangeTab,
  tabs,
  children,
}: PropsWithChildren<TabListHeaderProps>) {
  return (
    <div className={styles.tablistHeader}>
      <ul className={styles.tablistHeaderUl}>
        {tabs.map((tab: string, index: number) => {
          return (
            <TabHeader
              name={tab}
              key={tab}
              isFocused={index === currentTab}
              onClick={onChangeTab.bind(null, index)}
            />
          )
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
      className={classNames(styles.tabHeader, {
        [styles['focused']]: isFocused,
      })}
      onClick={onClick}
    >
      {tx(name)}
    </li>
  )
}
