import React from 'react'

import useTranslationFunction from '../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

type Props = {
  txKey: string
  url: string
}

export default function UnsafeTranslationWithLink({ txKey, url }: Props) {
  const tx = useTranslationFunction()

  return (
    <span
      className={styles.unsafeTranslationWithLink}
      dangerouslySetInnerHTML={{
        __html: tx(txKey, [`<a href="${url}">`, '</a>']),
      }}
    />
  )
}
