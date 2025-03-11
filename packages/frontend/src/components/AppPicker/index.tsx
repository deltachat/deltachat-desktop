import React, { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { filesize } from 'filesize'
import moment from 'moment'
import { C } from '@deltachat/jsonrpc-client'
import { getLogger } from '../../../../shared/logger'

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
import SearchInputButton from '../SearchInput/SearchInputButton'
import { ClickableLink } from '../helpers/ClickableLink'

const log = getLogger('renderer/components/AppPicker')

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
  home = 'home',
  tool = 'tool',
  game = 'game',
}

const getJsonFromBase64 = (base64: string): any => {
  try {
    const text = atob(base64)
    const length = text.length
    const bytes = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      bytes[i] = text.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    return JSON.parse(decoder.decode(bytes))
  } catch (error) {
    log.critical('String could not de decoded or parsed')
    return null
  }
}

type Props = {
  onAppSelected: (app: AppInfo) => void
}

export function AppPicker({ onAppSelected }: Props) {
  const tx = useTranslationFunction()
  const [apps, setApps] = useState<AppInfo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOffline, setIsOffline] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(AppCategoryEnum.home)
  const [selectedAppInfo, setSelectedAppInfo] = useState<AppInfo | null>(null)
  const [icons, setIcons] = useState<{ [key: string]: string }>({})
  const categories = [
    AppCategoryEnum.home,
    AppCategoryEnum.tool,
    AppCategoryEnum.game,
  ]

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await BackendRemote.rpc.getHttpResponse(
          selectedAccountId(),
          AppStoreUrl + 'xdcget-lock.json'
        )
        const apps = getJsonFromBase64(response.blob) as AppInfo[]
        if (apps === null) return
        apps.sort((a: AppInfo, b: AppInfo) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateB.getTime() - dateA.getTime() // Show newest first
        })
        for (const app of apps) {
          app.short_description = app.description.split('\n')[0]
          app.description = app.description.split('\n').slice(1).join('\n')
          const url = new URL(app.source_code_url)
          app.author = url.pathname.split('/')[1]
          app.date = moment(app.date).format('LL')
        }
        setApps(apps)
      } catch (error) {
        log.error('Failed to fetch apps:', error)
      }
    }
    fetchApps()
  }, [setApps])

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
      for (const app of apps) {
        newIcons[app.app_id] = `./images/icons/image_outline.svg`
      }
      setIcons(newIcons)
      let count = 0
      for (const app of apps) {
        BackendRemote.rpc
          .getHttpResponse(selectedAccountId(), AppStoreUrl + app.icon_relname)
          .then((response: { blob: string }) => {
            if (response?.blob !== undefined) {
              newIcons[app.app_id] = `data:image/png;base64,${response.blob}`
            }
            count++
            if (count === apps.length) {
              setIcons({ ...newIcons })
            } else if (count % 10 === 0) {
              setIcons({ ...newIcons })
            }
          })
      }
    }
    loadIcons()
  }, [apps, isOffline])

  const filteredApps = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase()
    const findByRelevance = (apps: AppInfo[]) => {
      const queryEqualsAuthor = apps.filter(
        app => app.author && app.author.toLowerCase() === lowerCaseQuery
      )

      const startsWithQuery = apps.filter(
        app =>
          !queryEqualsAuthor.includes(app) &&
          app.name.toLowerCase().startsWith(lowerCaseQuery)
      )

      const queryInTitle = apps.filter(
        app =>
          !queryEqualsAuthor.includes(app) &&
          !startsWithQuery.includes(app) &&
          app.name.toLowerCase().includes(lowerCaseQuery)
      )

      const queryInShortDescription = apps.filter(
        app =>
          !queryEqualsAuthor.includes(app) &&
          !startsWithQuery.includes(app) &&
          !queryInTitle.includes(app) &&
          app.short_description &&
          app.short_description.toLowerCase().includes(lowerCaseQuery)
      )

      return [
        ...queryEqualsAuthor,
        ...startsWithQuery,
        ...queryInTitle,
        ...queryInShortDescription,
      ]
    }
    return findByRelevance(apps).filter(
      app =>
        selectedCategory === AppCategoryEnum.home ||
        app.category === selectedCategory
    )
  }, [apps, searchQuery, selectedCategory])

  const AppInfoOverlay = (props: {
    app: AppInfo
    setSelectedAppInfo: (app: AppInfo | null) => void
    onSelect: (app: AppInfo) => void
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
        title={tx('webxdc_app')}
        className='app-info-dialog'
        onClose={onClose}
      >
        <DialogBody>
          <DialogContent>
            {renderAppInfo(app, setSearchQuery, setSelectedAppInfo)}
            <div className={styles.appDetails}>
              <div className={styles.appDescription}>{app.description}</div>
              <p>
                <span>{tx('app_date_published')}:</span> {app.date}
              </p>
              <p>
                <span>{tx('source_code')}:</span>{' '}
                <ClickableLink href={app.source_code_url}>
                  {app.source_code_url}
                </ClickableLink>
              </p>
              <p>
                <span>{tx('app_size')}:</span> {filesize(app.size)}
              </p>
            </div>
          </DialogContent>
          <DialogFooter>
            <FooterActions>
              <FooterActionButton
                data-testid='add-app-to-chat'
                onClick={() => onSelect(app)}
                styling='primary'
              >
                {tx('add_to_chat')}
              </FooterActionButton>
            </FooterActions>
          </DialogFooter>
        </DialogBody>
      </DialogWithHeader>
    )
  }

  const renderAppInfo = (
    app: AppInfo,
    setSearchQuery?: (query: string) => void,
    setSelectedAppInfo?: (app: AppInfo | null) => void
  ) => {
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
          {setSearchQuery && app.author && (
            <button
              onClick={() => {
                if (setSearchQuery && app.author) {
                  setSearchQuery(app.author)
                  if (setSelectedAppInfo) {
                    setSelectedAppInfo(null)
                  }
                }
              }}
            >
              {app.author}
            </button>
          )}
          {!setSearchQuery && app.author && <p>{app.author}</p>}
        </div>
      </div>
    )
  }

  const categoryTitle = (selectedCategory: AppCategoryEnum) => {
    return selectedCategory === AppCategoryEnum.home
      ? tx('home')
      : tx(selectedCategory + 's')
  }

  return (
    <div className={styles.appPickerContainer}>
      <div className={styles.appPicker}>
        <input
          type='text'
          autoFocus
          placeholder={tx('search')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <SearchInputButton
            className={styles.searchInputButton}
            aria-label={tx('delete')}
            icon='cross'
            onClick={() => setSearchQuery('')}
          />
        )}
        <div className={styles.appPickerList}>
          {!isOffline && Object.keys(icons).length > 0 ? (
            <>
              {selectedAppInfo && (
                <AppInfoOverlay
                  app={selectedAppInfo}
                  setSelectedAppInfo={setSelectedAppInfo}
                  onSelect={onAppSelected}
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
            <div className={styles.offlineMessage}>
              {tx(isOffline ? 'offline' : 'loading')}
            </div>
          )}
        </div>
        <div className={styles.tabBar}>
          {categories.map(category => (
            <button
              key={category}
              className={classNames(styles.tab, {
                [styles.activeTab]: selectedCategory === category,
              })}
              onClick={() => setSelectedCategory(category)}
            >
              <div className={styles.category}>
                <img
                  className={styles.categoryIcon}
                  src={`./images/${category}.svg`}
                  alt={category}
                />
                <div className={styles.categoryTitle}>
                  {categoryTitle(category)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
