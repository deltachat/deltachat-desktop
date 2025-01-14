import React, { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import moment from 'moment'
import { filesize } from 'filesize'
import { C } from '@deltachat/jsonrpc-client'

import useTranslationFunction from '../../hooks/useTranslationFunction'

import styles from './styles.module.scss'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogWithHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'

export interface AppInfo {
  app_id: string
  author?: string
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

export const AppStoreUrl = 'https://apps.testrun.org/'

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
  const [selectedAppInfo, setSelectedAppInfo] = useState<AppInfo | null>(null)
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
          AppStoreUrl + app.icon_relname
        )) as { blob: string }
        if (response?.blob !== undefined) {
          newIcons[app.app_id] = `data:image/png;base64,${response.blob}`
        }
        app.short_description = app.description.split('\n')[0]
        const url = new URL(app.source_code_url)
        app.author = url.pathname.split('/')[1]
        app.date = moment(app.date).format('LL')
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

  const AppInfoOverlay = (props: {
    app: AppInfo
    setSelectedAppInfo: (app: AppInfo | null) => void
    onSelect?: (app: AppInfo) => void
  }) => {
    const { app, setSelectedAppInfo, onSelect } = props
    const onClose = () => {
      setSelectedAppInfo(null)
    }
    if (!app) {
      return null
    }
    return (
      <DialogWithHeader
        title={tx('app_info')}
        className='app-info-dialog'
        onClose={onClose}
      >
        <DialogBody>
          <DialogContent>
            {renderAppInfo(app)}
            <div className={styles.appDetails}>
              <div className={styles.appDescription}>{app.description}</div>
              <p>
                <span>{tx('app_date_published')}:</span> {app.date}
              </p>
              <p>
                <span>{tx('app_size')}:</span> {filesize(app.size)}
              </p>
              <p>
                <span>{tx('app_source')}:</span>{' '}
                <a href='${app.source_code_url}' target='_blank'>
                  {app.source_code_url}
                </a>
              </p>
              <p>
                <span>{tx('app_author')}:</span> {app.author}
              </p>
            </div>
          </DialogContent>
          <DialogFooter>
            <FooterActions>
              <FooterActionButton
                data-testid='add-app-to-chat'
                onClick={() => onSelect && onSelect(app)}
              >
                {tx('add_to_chat')}
              </FooterActionButton>
            </FooterActions>
          </DialogFooter>
        </DialogBody>
      </DialogWithHeader>
    )
  }

  const renderAppInfo = (app: AppInfo) => {
    return (
      <div className={styles.appItem}>
        <img
          src={icons[app.app_id] ?? ''}
          alt={`${app.name} icon`}
          className={styles.appIcon}
        />
        <div className={styles.appInfo}>
          <div className={styles.appName}>{app.name}</div>
          <p>{app.short_description}</p>
          <p>{app.author}</p>
        </div>
      </div>
    )
  }

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
            {selectedAppInfo && (
              <AppInfoOverlay
                app={selectedAppInfo}
                setSelectedAppInfo={setSelectedAppInfo}
                onSelect={onSelect}
              />
            )}
            {filteredApps.map(app => (
              <button
                key={app.app_id}
                className={styles.appListItem}
                onClick={() => setSelectedAppInfo(app)}
              >
                {renderAppInfo(app)}
              </button>
            ))}
          </>
        ) : (
          <div className={styles.offlineMessage}>{tx('loading')}</div>
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
