import React from 'react'
import styled from 'styled-components'
import { PseudoContactListItem } from '../helpers/ContactList-Styles'

export const CreateChatContactListWrapper = styled.div`
  margin: -20px;
  background-color: var(--bp3DialogBgPrimary);
`

export const CreateChatSearchInput = styled.input`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  margin: 0;
  line-height: inherit;
  border: 0px;
  font-size: 18px;
  background-color: transparent;
`
