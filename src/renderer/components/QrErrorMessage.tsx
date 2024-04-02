import React from 'react'

import useTranslationFunction from '../hooks/useTranslationFunction'

type Props = {
  url: string
}

export default function QrErrorMessage({ url }: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      {tx('qrscan_failed')}
      <br />
      <br />
      {url}
    </>
  )
}
