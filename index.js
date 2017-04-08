// @flow

import { AsyncStorage } from 'react-native'

import { logger } from 'react-native-logger'

type StorageValue = {
  type: 'string' | 'object',
  value: string
}

const toString = (value: any): string => {
  if (typeof value === 'string' || value instanceof String) {
    return JSON.stringify({ type: 'string', value })    
  } else {
    return JSON.stringify({ type: 'object', value: JSON.stringify(value) })
  }
}

const toValue = (value: ?string): (?string | Object) => {
  if (!value) {
    return null
  }

  const storageValue: StorageValue = JSON.parse(value)
  if (storageValue.type === 'object') {
    return JSON.parse(storageValue.value)
  } else if (storageValue.type === 'string') {
    return storageValue.value
  } 

  throw new Error(`value ${value} is neither object nor string type`)
}

export class Storage {
  name: string

  constructor(name: string) {
    this.name = name
  }

  getKey(key: string): string {
    return `${this.name}:${key}`
  }

  setKeyValue = async (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      logger.group('storage', `set to ${this.name}`, async (log) => {
        const strValue = toString(value)
        log('key', key)
        log('value', value)

        try {
          await AsyncStorage.setItem(this.getKey(key), strValue)
          resolve()
        } catch(e) {
          reject(e)
        }
      })
    })
  }

  get = async (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      return logger.group('storage', `get from ${this.name}`, async (log) => {
        log('key', key)
        let strValue: ?string
        let value: any

        try {
          strValue = await AsyncStorage.getItem(this.getKey(key))
          value = toValue(strValue)
          log('value', value)
          resolve(value)
        } catch(e) {
          reject(e)
        }
      })
    })
  }

  del = async (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      return logger.group('storage', `del from ${this.name}`, async (log) => {
        log('key', key)
        try {
          await AsyncStorage.removeItem(this.getKey(key))
          resolve()
        } catch(e) {
          reject(e)
        }
      })
    })
  }
}
