import React, { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { C } from '@deltachat/jsonrpc-client'

import useTranslationFunction from '../../hooks/useTranslationFunction'

import styles from './styles.module.scss'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

export interface AppInfo {
  app_id: string
  tag_name: string
  url: string
  date: string
  description: string
  short_description?: string
  source_code_url: string
  name: string
  category: string
  cache_relname: string
  size: number
  icon_relname: string
}

const enum AppCategoryEnum {
  all = 'all',
  tool = 'tool',
  game = 'game',
}

type Props = {
  className?: string
  onSelect?: (app: AppInfo) => void
  apps?: AppInfo[]
}

export function AppPicker({ className, onSelect, apps = [] }: Props) {
  const tx = useTranslationFunction()
  const [searchQuery, setSearchQuery] = useState('')
  const [isOffline, setIsOffline] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(AppCategoryEnum.all)
  const [icons, setIcons] = useState<{ [key: string]: string }>({})
  const categories = [AppCategoryEnum.tool, AppCategoryEnum.game]

  useEffect(() => {
    const loadIcons = async () => {
      if (!apps.length) {
        const connectivity =
          await BackendRemote.rpc.getConnectivity(selectedAccountId())
        if (connectivity !== C.DC_CONNECTIVITY_CONNECTED) {
          setIsOffline(true)
          return
        }
      }
      const newIcons: { [key: string]: string } = {}
      let count = 0
      for (const app of apps) {
        const response = (await BackendRemote.rpc.getHttpResponse(
          selectedAccountId(),
          'https://apps.testrun.org/' + app.icon_relname // TODO: make URL configurable in settings
        )) as { blob: string }
        if (response?.blob !== undefined) {
          newIcons[app.app_id] = `data:image/png;base64,${response.blob}`
        }
        app.short_description = app.description.split('\n')[0]
        count++
        if (count % 10 === 0) {
          setIcons({ ...newIcons })
        }
      }
      setIcons({ ...newIcons })
    }
    loadIcons()
  }, [apps, isOffline])

  const handleCategoryClick = useCallback(
    (category: AppCategoryEnum) => {
      setSelectedCategory(
        category === selectedCategory ? AppCategoryEnum.all : category
      )
    },
    [selectedCategory, setSelectedCategory]
  )

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = app.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === AppCategoryEnum.all ||
        app.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [apps, searchQuery, selectedCategory])

  return (
    <div className={classNames(styles.appPickerContainer, className)}>
      <input
        type='text'
        autoFocus
        placeholder={tx('search')}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.appPickerList}>
        {!isOffline && Object.keys(icons).length > 0 ? (
          <>
            {filteredApps.map(app => (
              <button
                key={app.app_id}
                className={styles.appItem}
                onClick={() => onSelect && onSelect(app)}
              >
                <img
                  src={icons[app.app_id] ?? ''}
                  alt={`${app.name} icon`}
                  className={styles.appIcon}
                />
                <div className={styles.appDetails}>
                  <div className={styles.appName}>{app.name}</div>
                  <div className={styles.appShortDescription}>
                    {app.short_description}
                  </div>
                </div>
              </button>
            ))}
          </>
        ) : (
          <div className={styles.offlineMessage}>{tx('offline')}</div>
        )}
      </div>
      <div className={styles.tabBar}>
        {categories.map(category => (
          <button
            key={category}
            className={classNames(styles.tab, {
              [styles.activeTab]: selectedCategory === category,
            })}
            onClick={() => handleCategoryClick(category)}
          >
            <div className={styles.category}>
              <img
                className={styles.categoryIcon}
                src={`./images/${category}.svg`}
                alt={category}
              />
              <div className={styles.categoryTitle}>{tx(category)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
