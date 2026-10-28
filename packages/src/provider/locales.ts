import { createIntl } from './intl'
import type { IntlType } from './types'
import arEG from './locale/ar_EG'
import caES from './locale/ca_ES'
import csCZ from './locale/cs_CZ'
import deDE from './locale/de_DE'
import enGB from './locale/en_GB'
import enUS from './locale/en_US'
import esES from './locale/es_ES'
import faIR from './locale/fa_IR'
import frFR from './locale/fr_FR'
import heIL from './locale/he_IL'
import hrHR from './locale/hr_HR'
import idID from './locale/id_ID'
import itIT from './locale/it_IT'
import jaJP from './locale/ja_JP'
import koKR from './locale/ko_KR'
import mnMN from './locale/mn_MN'
import msMY from './locale/ms_MY'
import nlNL from './locale/nl_NL'
import plPL from './locale/pl_PL'
import ptBR from './locale/pt_BR'
import roRO from './locale/ro_RO'
import ruRU from './locale/ru_RU'
import skSK from './locale/sk_SK'
import srRS from './locale/sr_RS'
import svSE from './locale/sv_SE'
import thTH from './locale/th_TH'
import trTR from './locale/tr_TR'
import ukUA from './locale/uk_UA'
import urPK from './locale/ur_PK'
import uzUZ from './locale/uz_UZ'
import viVN from './locale/vi_VN'
import zhCN from './locale/zh_CN'
import zhHK from './locale/zh_HK'
import zhTW from './locale/zh_TW'
export const arEGIntl = createIntl('ar_EG', arEG)
export const caESIntl = createIntl('ca_ES', caES)
export const csCZIntl = createIntl('cs_CZ', csCZ)
export const deDEIntl = createIntl('de_DE', deDE)
export const enGBIntl = createIntl('en_GB', enGB)
export const enUSIntl = createIntl('en_US', enUS)
export const esESIntl = createIntl('es_ES', esES)
export const faIRIntl = createIntl('fa_IR', faIR)
export const frFRIntl = createIntl('fr_FR', frFR)
export const heILIntl = createIntl('he_IL', heIL)
export const hrHRIntl = createIntl('hr_HR', hrHR)
export const idIDIntl = createIntl('id_ID', idID)
export const itITIntl = createIntl('it_IT', itIT)
export const jaJPIntl = createIntl('ja_JP', jaJP)
export const koKRIntl = createIntl('ko_KR', koKR)
export const mnMNIntl = createIntl('mn_MN', mnMN)
export const msMYIntl = createIntl('ms_MY', msMY)
export const nlNLIntl = createIntl('nl_NL', nlNL)
export const plPLIntl = createIntl('pl_PL', plPL)
export const ptBRIntl = createIntl('pt_BR', ptBR)
export const roROIntl = createIntl('ro_RO', roRO)
export const ruRUIntl = createIntl('ru_RU', ruRU)
export const skSKIntl = createIntl('sk_SK', skSK)
export const srRSIntl = createIntl('sr_RS', srRS)
export const svSEIntl = createIntl('sv_SE', svSE)
export const thTHIntl = createIntl('th_TH', thTH)
export const trTRIntl = createIntl('tr_TR', trTR)
export const ukUAIntl = createIntl('uk_UA', ukUA)
export const urPKIntl = createIntl('ur_PK', urPK)
export const uzUZIntl = createIntl('uz_UZ', uzUZ)
export const viVNIntl = createIntl('vi_VN', viVN)
export const zhCNIntl = createIntl('zh_CN', zhCN)
export const zhHKIntl = createIntl('zh_HK', zhHK)
export const zhTWIntl = createIntl('zh_TW', zhTW)
export const intlMap: Record<string, IntlType> = {
  'ar-EG': arEGIntl,
  'ca-ES': caESIntl,
  'cs-CZ': csCZIntl,
  'de-DE': deDEIntl,
  'en-GB': enGBIntl,
  'en-US': enUSIntl,
  'es-ES': esESIntl,
  'fa-IR': faIRIntl,
  'fr-FR': frFRIntl,
  'he-IL': heILIntl,
  'hr-HR': hrHRIntl,
  'id-ID': idIDIntl,
  'it-IT': itITIntl,
  'ja-JP': jaJPIntl,
  'ko-KR': koKRIntl,
  'mn-MN': mnMNIntl,
  'ms-MY': msMYIntl,
  'nl-NL': nlNLIntl,
  'pl-PL': plPLIntl,
  'pt-BR': ptBRIntl,
  'ro-RO': roROIntl,
  'ru-RU': ruRUIntl,
  'sk-SK': skSKIntl,
  'sr-RS': srRSIntl,
  'sv-SE': svSEIntl,
  'th-TH': thTHIntl,
  'tr-TR': trTRIntl,
  'uk-UA': ukUAIntl,
  'ur-PK': urPKIntl,
  'uz-UZ': uzUZIntl,
  'vi-VN': viVNIntl,
  'zh-CN': zhCNIntl,
  'zh-HK': zhHKIntl,
  'zh-TW': zhTWIntl,
}
export const intlMapKeys = Object.keys(intlMap)
export function findIntlKeyByAntdLocaleKey(locale?: string): string {
  const normalized = locale?.replace(/_/g, '-').toLowerCase() ?? ''
  if (normalized === 'en') return 'en-US'
  if (normalized === 'zh') return 'zh-CN'
  return (
    intlMapKeys.find((key) => key.toLowerCase() === normalized) ??
    intlMapKeys.find((key) => key.split('-')[0] === normalized.split('-')[0]) ??
    'zh-CN'
  )
}
