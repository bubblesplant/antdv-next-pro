var e=`import type { ProFilter, ProRequest, ProSort } from '@bubblesjs/antdv-next-pro'

export type DemoStatus = 'running' | 'paused' | 'done'
export type DemoCategory = 'growth' | 'experience' | 'efficiency'

export type DemoDateQueryValue =
  | string
  | number
  | Date
  | {
      format?: (pattern: string) => string
      isValid?: () => boolean
      toDate?: () => Date
    }

export interface DemoRow extends Record<string, unknown> {
  id: number
  project: string
  owner: string
  department: string
  category: DemoCategory
  status: DemoStatus
  priority: 'high' | 'medium' | 'low'
  score: number
  progress: number
  budget: number
  visits: number
  enabled: boolean
  createdAt: string
  updatedAt: string
  time: string
  tags: string[]
  address: string
}

export type DemoQuery = Record<string, unknown> & {
  current?: number
  pageSize?: number
  project?: string
  owner?: string
  department?: string
  category?: DemoCategory
  status?: DemoStatus
  priority?: DemoRow['priority']
  keyword?: string
  keyWords?: string
  minVisits?: number
  enabled?: boolean
  updatedAt?: DemoDateQueryValue | null
}

export const demoRows: DemoRow[] = [
  {
    id: 1,
    project: '客户洞察面板',
    owner: '林默',
    department: '数据产品',
    category: 'growth',
    status: 'running',
    priority: 'high',
    score: 92,
    progress: 76,
    budget: 128000,
    visits: 3218,
    enabled: true,
    createdAt: '2026-07-02',
    updatedAt: '2026-08-23 09:18:00',
    time: '09:18:00',
    tags: ['分析', '增长'],
    address: '上海 · 徐汇',
  },
  {
    id: 2,
    project: '渠道归因升级',
    owner: '程一',
    department: '增长平台',
    category: 'growth',
    status: 'paused',
    priority: 'medium',
    score: 76,
    progress: 48,
    budget: 86000,
    visits: 2190,
    enabled: false,
    createdAt: '2026-07-08',
    updatedAt: '2026-08-22 16:42:00',
    time: '16:42:00',
    tags: ['渠道', '归因'],
    address: '杭州 · 余杭',
  },
  {
    id: 3,
    project: '会员分层策略',
    owner: '周芮',
    department: '用户运营',
    category: 'growth',
    status: 'done',
    priority: 'high',
    score: 88,
    progress: 100,
    budget: 152000,
    visits: 4821,
    enabled: true,
    createdAt: '2026-06-18',
    updatedAt: '2026-08-21 11:06:00',
    time: '11:06:00',
    tags: ['会员', '策略'],
    address: '北京 · 朝阳',
  },
  {
    id: 4,
    project: '移动端转化实验',
    owner: '唐可',
    department: '体验设计',
    category: 'experience',
    status: 'running',
    priority: 'high',
    score: 84,
    progress: 63,
    budget: 96000,
    visits: 3904,
    enabled: true,
    createdAt: '2026-07-12',
    updatedAt: '2026-08-20 14:35:00',
    time: '14:35:00',
    tags: ['移动端', '实验'],
    address: '深圳 · 南山',
  },
  {
    id: 5,
    project: '留存预警模型',
    owner: '孟晴',
    department: '数据产品',
    category: 'efficiency',
    status: 'running',
    priority: 'high',
    score: 95,
    progress: 82,
    budget: 186000,
    visits: 5570,
    enabled: true,
    createdAt: '2026-06-26',
    updatedAt: '2026-08-18 18:24:00',
    time: '18:24:00',
    tags: ['模型', '留存'],
    address: '上海 · 浦东',
  },
  {
    id: 6,
    project: '服务工单分析',
    owner: '庄言',
    department: '服务体验',
    category: 'efficiency',
    status: 'paused',
    priority: 'low',
    score: 71,
    progress: 35,
    budget: 58000,
    visits: 1120,
    enabled: false,
    createdAt: '2026-07-19',
    updatedAt: '2026-08-17 10:11:00',
    time: '10:11:00',
    tags: ['工单', '服务'],
    address: '成都 · 高新',
  },
  {
    id: 7,
    project: '新品首发追踪',
    owner: '沈知',
    department: '增长平台',
    category: 'growth',
    status: 'done',
    priority: 'medium',
    score: 90,
    progress: 100,
    budget: 117000,
    visits: 4606,
    enabled: true,
    createdAt: '2026-06-09',
    updatedAt: '2026-08-16 13:50:00',
    time: '13:50:00',
    tags: ['新品', '追踪'],
    address: '广州 · 天河',
  },
  {
    id: 8,
    project: '区域经营看板',
    owner: '方屿',
    department: '商业分析',
    category: 'efficiency',
    status: 'running',
    priority: 'medium',
    score: 87,
    progress: 69,
    budget: 143000,
    visits: 3517,
    enabled: true,
    createdAt: '2026-07-05',
    updatedAt: '2026-08-15 09:45:00',
    time: '09:45:00',
    tags: ['经营', '区域'],
    address: '南京 · 建邺',
  },
  {
    id: 9,
    project: '搜索体验重构',
    owner: '许南',
    department: '体验设计',
    category: 'experience',
    status: 'running',
    priority: 'high',
    score: 91,
    progress: 58,
    budget: 109000,
    visits: 4270,
    enabled: true,
    createdAt: '2026-07-14',
    updatedAt: '2026-08-14 17:20:00',
    time: '17:20:00',
    tags: ['搜索', '体验'],
    address: '武汉 · 光谷',
  },
  {
    id: 10,
    project: '供应链效能雷达',
    owner: '顾辰',
    department: '商业分析',
    category: 'efficiency',
    status: 'paused',
    priority: 'medium',
    score: 79,
    progress: 44,
    budget: 134000,
    visits: 1886,
    enabled: false,
    createdAt: '2026-07-20',
    updatedAt: '2026-08-13 12:12:00',
    time: '12:12:00',
    tags: ['供应链', '效能'],
    address: '苏州 · 工业园',
  },
  {
    id: 11,
    project: '内容推荐策略',
    owner: '陆遥',
    department: '用户运营',
    category: 'experience',
    status: 'done',
    priority: 'low',
    score: 83,
    progress: 100,
    budget: 73000,
    visits: 2980,
    enabled: true,
    createdAt: '2026-06-15',
    updatedAt: '2026-08-12 15:40:00',
    time: '15:40:00',
    tags: ['内容', '推荐'],
    address: '厦门 · 思明',
  },
  {
    id: 12,
    project: '结算流程自动化',
    owner: '韩冬',
    department: '财务科技',
    category: 'efficiency',
    status: 'running',
    priority: 'high',
    score: 89,
    progress: 72,
    budget: 168000,
    visits: 2644,
    enabled: true,
    createdAt: '2026-07-01',
    updatedAt: '2026-08-11 08:58:00',
    time: '08:58:00',
    tags: ['结算', '自动化'],
    address: '北京 · 海淀',
  },
]

function valueToText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  if (Array.isArray(value)) return value.map(valueToText).join(' ')
  if (value instanceof Date) return value.toISOString()

  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return ''
  }
}

const normalizedText = (value: unknown) => valueToText(value).trim().toLowerCase()

function formatLocalDate(value: Date): string {
  if (Number.isNaN(value.getTime())) return ''
  const year = String(value.getFullYear()).padStart(4, '0')
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return \`\${year}-\${month}-\${day}\`
}

function normalizeDateParts(year: number, month: number, day: number): string {
  const candidate = new Date(0)
  candidate.setHours(0, 0, 0, 0)
  candidate.setFullYear(year, month - 1, day)
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return ''
  }
  return formatLocalDate(candidate)
}

function normalizeDateString(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const datePrefix = /^(\\d{4})[-/](\\d{1,2})[-/](\\d{1,2})(?:\\D|$)/.exec(trimmed)
  if (datePrefix) {
    return normalizeDateParts(Number(datePrefix[1]), Number(datePrefix[2]), Number(datePrefix[3]))
  }
  return formatLocalDate(new Date(trimmed))
}

function normalizeDateQuery(value: unknown): string {
  if (value == null || value === '') return ''
  if (value instanceof Date) return formatLocalDate(value)
  if (typeof value === 'string') return normalizeDateString(value)
  if (typeof value === 'number') {
    return Number.isFinite(value) ? formatLocalDate(new Date(value)) : ''
  }
  if (typeof value !== 'object') return ''

  const dateLike = value as {
    $d?: unknown
    format?: (pattern: string) => unknown
    isValid?: () => boolean
    toDate?: () => unknown
  }
  try {
    if (dateLike.isValid?.() === false) return ''
    if (typeof dateLike.format === 'function') {
      const formatted = dateLike.format('YYYY-MM-DD')
      if (typeof formatted === 'string') return normalizeDateString(formatted)
    }
    if (typeof dateLike.toDate === 'function') {
      const date = dateLike.toDate()
      if (date instanceof Date) return formatLocalDate(date)
    }
    if (dateLike.$d instanceof Date) return formatLocalDate(dateLike.$d)
  } catch {
    return ''
  }
  return ''
}

function matchesText(row: DemoRow, value: unknown): boolean {
  const keyword = normalizedText(value)
  if (!keyword) return true
  return [row.project, row.owner, row.department, row.address, ...row.tags]
    .join(' ')
    .toLowerCase()
    .includes(keyword)
}

function compareRows(left: DemoRow, right: DemoRow, field: string): number {
  const leftValue = left[field]
  const rightValue = right[field]
  if (typeof leftValue === 'number' && typeof rightValue === 'number') return leftValue - rightValue
  return valueToText(leftValue).localeCompare(valueToText(rightValue), 'zh-CN', { numeric: true })
}

export function queryDemoRows(
  rows: readonly DemoRow[],
  params: DemoQuery,
  sort: ProSort,
  filter: ProFilter,
): { data: DemoRow[]; total: number } {
  const filterValues = (field: string): unknown[] => {
    const value = filter[field]
    return Array.isArray(value) ? value : []
  }

  let result = rows.filter((row) => {
    const project = normalizedText(params.project)
    const owner = normalizedText(params.owner)
    const department = normalizedText(params.department)
    const updatedAt = normalizeDateQuery(params.updatedAt)
    const keyword = params.keyword ?? params.keyWords
    const statusFilters = filterValues('status')
    const categoryFilters = filterValues('category')
    const enabled = params.enabled
    return (
      (!project || row.project.toLowerCase().includes(project)) &&
      (!owner || row.owner.toLowerCase().includes(owner)) &&
      (!department || row.department.toLowerCase().includes(department)) &&
      (!params.category || row.category === params.category) &&
      (!params.status || row.status === params.status) &&
      (!params.priority || row.priority === params.priority) &&
      (!updatedAt || row.updatedAt.startsWith(updatedAt)) &&
      (typeof enabled !== 'boolean' || row.enabled === enabled) &&
      (!params.minVisits || row.visits >= Number(params.minVisits)) &&
      matchesText(row, keyword) &&
      (statusFilters.length === 0 || statusFilters.includes(row.status)) &&
      (categoryFilters.length === 0 || categoryFilters.includes(row.category))
    )
  })

  const activeSort = Object.entries(sort).find(([, order]) => Boolean(order))
  if (activeSort) {
    const [field, order] = activeSort
    result = [...result].sort((left, right) => {
      const compared = compareRows(left, right, field)
      return order === 'descend' ? -compared : compared
    })
  }

  const total = result.length
  const current = Math.max(1, Number(params.current ?? 1))
  const pageSize = Math.max(1, Number(params.pageSize ?? (total || 1)))
  const start = (current - 1) * pageSize
  return { data: result.slice(start, start + pageSize), total }
}

export function createDemoRequest(
  onRequest?: (params: DemoQuery, sort: ProSort, filter: ProFilter) => void,
  rows: readonly DemoRow[] = demoRows,
): ProRequest<DemoRow, DemoQuery> {
  return async (params, sort, filter) => {
    onRequest?.(params, sort, filter)
    await new Promise((resolve) => setTimeout(resolve, 90))
    return { ...queryDemoRows(rows, params, sort, filter), success: true }
  }
}
`;export{e as default};