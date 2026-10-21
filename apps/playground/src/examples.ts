import type { Component } from 'vue'

export interface SourceFile {
  name: string
  code: string
}

interface ExampleDefinition {
  path: string
  title: string
  description: string
  componentId: string
  section: string
  checks: readonly string[]
  file: string
}

export interface PlaygroundExample extends ExampleDefinition {
  loadComponent: () => Promise<Component>
  sources: () => Promise<SourceFile[]>
}

const componentModules = import.meta.glob<Component>(
  ['./demos/**/*.vue', '!./demos/pro-table/ScenarioErrorBoundary.vue'],
  { import: 'default' },
)
const sourceModules = import.meta.glob<string>('./demos/**/*.{vue,ts}', {
  query: '?raw',
  import: 'default',
})

export const exampleComponents = [
  { id: 'pro-table', name: 'ProTable', label: '高级表格' },
  { id: 'editable-pro-table', name: 'EditableProTable', label: '可编辑表格' },
  { id: 'schema-form', name: 'SchemaForm', label: 'Schema 表单' },
  { id: 'pro-card', name: 'ProCard', label: '高级卡片' },
  { id: 'pro-list', name: 'ProList', label: '高级列表' },
  { id: 'pro-descriptions', name: 'ProDescriptions', label: '高级详情' },
  { id: 'table-enhancements', name: 'Table Enhancements', label: '表格增强' },
  { id: 'shared-components', name: 'Shared Components', label: '辅助组件' },
] as const

function resolveDependency(importer: string, dependency: string): string {
  const segments = importer.split('/').slice(0, -1)
  for (const segment of dependency.split('/')) {
    if (segment === '..') segments.pop()
    else if (segment !== '.') segments.push(segment)
  }
  const base = segments.join('/')
  const resolved = [base, `${base}.ts`, `${base}.vue`].find((path) => sourceModules[path])
  if (!resolved) throw new Error(`示例依赖不存在：${dependency}`)
  return resolved
}

async function loadSources(file: string): Promise<SourceFile[]> {
  const files: SourceFile[] = []
  const visited = new Set<string>()
  async function visit(path: string) {
    if (visited.has(path)) return
    visited.add(path)
    const code = await sourceModules[path]!()
    files.push({ name: path.replace('./demos/', ''), code })
    // 同时提供本地依赖，复制和下载使用实际运行的源码。
    const dependencies = code.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)
    for (const match of dependencies) await visit(resolveDependency(path, match[1]!))
  }
  await visit(`./demos/${file}`)
  return files
}

function defineExample(definition: ExampleDefinition): PlaygroundExample {
  const loadComponent = componentModules[`./demos/${definition.file}`]
  if (!loadComponent) throw new Error(`示例组件不存在：${definition.file}`)
  return { ...definition, loadComponent, sources: () => loadSources(definition.file) }
}

const definitions: ExampleDefinition[] = [
  {
    path: '/pro-list/projects',
    title: '项目列表与受控选择',
    description: '通过 metas 展示项目，组合请求分页、受控选择、展开内容与 BaseProList。',
    componentId: 'pro-list',
    section: '列表展示',
    checks: ['请求分页与刷新', '受控勾选与清空', '展开详情和执行操作'],
    file: 'pro-list/ProjectList.vue',
  },
  {
    path: '/pro-descriptions/editable',
    title: '可编辑项目详情',
    description: '请求详情数据，逐字段编辑，并在校验通过后保存。',
    componentId: 'pro-descriptions',
    section: '详情展示',
    checks: ['加载与重新请求', '字段必填校验', '保存和取消字段编辑'],
    file: 'pro-descriptions/EditableDescriptions.vue',
  },
  {
    path: '/table-enhancements/edit-and-sort',
    title: '表格拖拽与编辑',
    description: '使用 DragSortTable、RowEditorTable 和 CellEditorTable 完成排序与编辑。',
    componentId: 'table-enhancements',
    section: '交互增强',
    checks: ['拖动或用方向键调整顺序', '双击行或单元格进入编辑', '校验与失焦保存'],
    file: 'table-enhancements/EnhancedTables.vue',
  },
  {
    path: '/shared-components/interactions',
    title: '工具栏与辅助交互',
    description: '组合工具栏、筛选浮层、下拉操作、字段提示与错误恢复。',
    componentId: 'shared-components',
    section: '辅助组件',
    checks: ['工具栏搜索与标签切换', '筛选确认和清空', '下拉操作与错误恢复'],
    file: 'shared-components/SharedComponents.vue',
  },
  {
    path: '/schema-form/composition',
    title: '组合表单与动态列表',
    description: '直接组合字段、分组、依赖与动态列表，复用校验、值转换和独立分步提交。',
    componentId: 'schema-form',
    section: '组合表单',
    checks: ['动态列表增加、复制和移动', '依赖字段随值更新', '转换后的结果与分步提交'],
    file: 'schema-form/CompositionForm.vue',
  },
  {
    path: '/pro-table/basic-query-table',
    title: '查询表格',
    description: '用远程 request 串联查询、分页、排序和筛选的标准 ProTable。',
    componentId: 'pro-table',
    section: '基础用法',
    checks: ['首次进入自动请求数据', '查询后回到第一页', '分页、排序和筛选参数正确传入 request'],
    file: 'pro-table/BasicQueryTable.vue',
  },
  {
    path: '/pro-table/basic-no-query-form',
    title: '无查询表单',
    description: '关闭查询区域，仅保留远程数据、表格操作和分页。',
    componentId: 'pro-table',
    section: '基础用法',
    checks: ['页面不渲染查询表单', '表格仍能正常请求和翻页'],
    file: 'pro-table/BasicNoQueryForm.vue',
  },
  {
    path: '/pro-table/basic-card-bordered',
    title: '卡片边框',
    description: '通过 cardBordered 配置搜索区与表格区的卡片边框。',
    componentId: 'pro-table',
    section: '基础用法',
    checks: ['搜索区与表格区使用真实卡片边框', '切换边框展示不影响查询和分页'],
    file: 'pro-table/BasicCardBordered.vue',
  },
  {
    path: '/pro-table/basic-data-source',
    title: '使用 DataSource',
    description: '直接绑定本地 dataSource，展示受控数据的更新。',
    componentId: 'pro-table',
    section: '基础用法',
    checks: ['不调用远程 request 即可展示数据', '更新受控 dataSource 后表格同步刷新'],
    file: 'pro-table/BasicDataSource.vue',
  },
  {
    path: '/pro-table/basic-no-toolbar',
    title: '无 ToolBar 的表格',
    description: '关闭顶部工具栏，只展示需要的搜索、表格和分页区域。',
    componentId: 'pro-table',
    section: '基础用法',
    checks: ['顶部工具栏完全隐藏', '搜索、表格和分页功能保持可用'],
    file: 'pro-table/BasicNoToolbar.vue',
  },
  {
    path: '/pro-table/tree-data',
    title: '树形数据',
    description:
      '用 children 描述任务层级，在同一张表中展开三级数据，并通过唯一 rowKey 独立选择每个节点。',
    componentId: 'pro-table',
    section: '树形与层级',
    checks: ['展开与收起父任务', '展开三级嵌套数据', '独立选择父节点与子节点'],
    file: 'pro-table/TreeTable.vue',
  },
  {
    path: '/pro-table/search-bar-type-switch',
    title: '搜索栏类型切换',
    description: '通过 search.filterType 切换内建 QueryFilter 与 LightFilter。',
    componentId: 'pro-table',
    section: '搜索栏类型切换',
    checks: ['切换后搜索字段值按预期保留或重置', '两种形态提交相同的业务查询参数'],
    file: 'pro-table/SearchBarTypeSwitch.vue',
  },
  {
    path: '/pro-table/search-no-options',
    title: '查询（无按钮）表格',
    description: '隐藏默认查询操作按钮，由字段变化或外部控件触发查询。',
    componentId: 'pro-table',
    section: '搜索与筛选',
    checks: ['查询区不显示默认查询和重置按钮', '外部触发后 request 收到最新条件'],
    file: 'pro-table/SearchNoOptions.vue',
  },
  {
    path: '/pro-table/search-light-filter',
    title: '轻量筛选替换查询表单',
    description: '通过 search.filterType 使用内建 LightFilter，确认和清除筛选后刷新表格。',
    componentId: 'pro-table',
    section: '搜索与筛选',
    checks: ['轻量筛选值可添加和清除', '筛选条件变化后表格数据同步更新'],
    file: 'pro-table/SearchLightFilter.vue',
  },
  {
    path: '/pro-table/search-keywords',
    title: '使用自带 keyWords 搜索的 table',
    description: '通过 Vue 工具栏搜索框映射 keyWords 搜索，并合并进 request 参数。',
    componentId: 'pro-table',
    section: '搜索与筛选',
    checks: ['输入关键词能够筛选结果', '清空关键词恢复完整数据', '关键词与分页参数可同时提交'],
    file: 'pro-table/SearchKeywords.vue',
  },
  {
    path: '/pro-table/search-custom-options',
    title: '搜索选项自定义',
    description: '用 Vue 模板定制搜索操作区的按钮、文案和附加行为。',
    componentId: 'pro-table',
    section: '搜索与筛选',
    checks: ['自定义按钮按指定顺序展示', '查询和重置仍分别执行正确动作'],
    file: 'pro-table/SearchCustomOptions.vue',
  },
  {
    path: '/pro-table/search-required-fields',
    title: '必填的查询表单',
    description: '通过列 formItemProps 配置内建搜索校验，必填项通过后才请求数据。',
    componentId: 'pro-table',
    section: '搜索与筛选',
    checks: ['空值提交时显示必填提示', '校验失败时不发起数据请求', '填写必填项后可以正常查询'],
    file: 'pro-table/SearchRequiredFields.vue',
  },
  {
    path: '/pro-table/custom-search-linkage',
    title: '动态联动搜索栏',
    description: '根据其它查询字段动态改变选项、可见性或可用状态。',
    componentId: 'pro-table',
    section: '搜索表单自定义',
    checks: ['上游字段变化会更新依赖字段', '失效的依赖值会被清理', '联动后的参数与界面一致'],
    file: 'pro-table/CustomSearchLinkage.vue',
  },
  {
    path: '/pro-table/custom-search-form-ref',
    title: '通过 formRef 来操作查询表单',
    description: '通过 formRef 读写、提交和重置表格内建查询表单。',
    componentId: 'pro-table',
    section: '搜索表单自定义',
    checks: [
      '外部操作可以设置和读取查询字段值',
      '外部提交会触发表格请求',
      '外部重置恢复查询字段初值',
    ],
    file: 'pro-table/CustomSearchFormRef.vue',
  },
  {
    path: '/pro-table/feature-batch-actions',
    title: '表格批量操作',
    description: '通过内建 tableAlert 展示选择数量、批量操作与清空选择入口。',
    componentId: 'pro-table',
    section: '表格功能',
    checks: ['勾选行后显示选中数量', '批量操作接收正确的行 key 和记录', '清空选择后批量区恢复'],
    file: 'pro-table/FeatureBatchActions.vue',
  },
  {
    path: '/pro-table/feature-nested-table',
    title: '嵌套表格',
    description: '在展开内容中组合子级 ProTable，映射官方嵌套表格结构。',
    componentId: 'pro-table',
    section: '表格功能',
    checks: ['父行可以展开和收起', '子表数据与父行正确关联', '父子表交互状态互不干扰'],
    file: 'pro-table/FeatureNestedTable.vue',
  },
  {
    path: '/pro-table/feature-split-layout',
    title: '左右结构',
    description: '以 Vue 布局组合左侧分类导航和右侧 ProTable。',
    componentId: 'pro-table',
    section: '表格功能',
    checks: ['左右区域在桌面端稳定排列', '选择左侧分类会刷新右侧参数', '窄屏下布局可以正常收缩'],
    file: 'pro-table/FeatureSplitLayout.vue',
  },
  {
    path: '/pro-table/feature-polling',
    title: '表格轮询',
    description: '使用 polling 周期性重新请求，并在页面隐藏时暂停提交。',
    componentId: 'pro-table',
    section: '表格功能',
    checks: ['启用后按间隔重复请求', '停止轮询后不再自动请求', '页面恢复可见后继续更新'],
    file: 'pro-table/FeaturePolling.vue',
  },
  {
    path: '/pro-table/feature-date-formatter',
    title: 'dateFormatter - 日期格式化',
    description: '切换 dateFormatter，将日期搜索值按字符串或时间戳提交给 request。',
    componentId: 'pro-table',
    section: '表格功能',
    checks: [
      '日期控件保留可编辑值',
      '切换格式规则后 request 收到约定参数',
      '格式化不会改写原始表单值',
    ],
    file: 'pro-table/FeatureDateFormatter.vue',
  },
  {
    path: '/pro-table/toolbar-custom',
    title: 'Toolbar 自定义',
    description: '使用 toolbar.title 和 toolbar.actions 的 Vue VNode 配置映射自定义工具栏。',
    componentId: 'pro-table',
    section: 'Toolbar 自定义',
    checks: [
      '自定义标题与操作区同时展示',
      '工具栏按钮可以调用表格 ref',
      '内建选项与自定义操作同时展示',
    ],
    file: 'pro-table/ToolbarCustom.vue',
  },
  {
    path: '/pro-table/toolbar-custom-table-body',
    title: '表格主体自定义',
    description: '通过 tableViewRender 定制表格主体，保留内建工具栏、搜索与分页。',
    componentId: 'pro-table',
    section: 'Toolbar 自定义',
    checks: [
      '自定义主体包裹结构正确渲染',
      '加载态、空态和数据态均可辨识',
      '分页与表格主体保持联动',
    ],
    file: 'pro-table/ToolbarCustomTableBody.vue',
  },
  {
    path: '/pro-table/card-table',
    title: '卡片表格',
    description: '把标题、附加操作和 ProTable 组合在卡片容器中。',
    componentId: 'pro-table',
    section: '卡片表格',
    checks: ['卡片标题和附加操作正确展示', '表格宽度适配卡片容器', '卡片操作不会破坏表格状态'],
    file: 'pro-table/CardTable.vue',
  },
  {
    path: '/pro-table/no-search-table',
    title: '无搜索表格',
    description: '使用 search=false 关闭搜索区，保留表格和所需工具选项。',
    componentId: 'pro-table',
    section: '无搜索表格',
    checks: ['搜索区不渲染', '表格请求、刷新和分页仍正常'],
    file: 'pro-table/NoSearchTable.vue',
  },
  {
    path: '/pro-table/value-type-date',
    title: 'valueType - 日期类',
    description: '集中展示日期、日期时间、日期范围、时间和时间范围值类型。',
    componentId: 'pro-table',
    section: '值类型示例',
    checks: ['各日期类只读值格式正确', '查询控件与列 valueType 对应', '范围值可以完整输入和清除'],
    file: 'pro-table/ValueTypeDate.vue',
  },
  {
    path: '/pro-table/value-type-number',
    title: 'valueType - 数字类',
    description: '集中展示 digit、money 和 percent 的输入与只读格式。',
    componentId: 'pro-table',
    section: '值类型示例',
    checks: ['数字输入保持数值语义', '金额前缀和百分比后缀正确', '排序与查询使用未格式化的原始值'],
    file: 'pro-table/ValueTypeNumber.vue',
  },
  {
    path: '/pro-table/value-type-style',
    title: 'valueType - 样式类',
    description: '展示序号、状态枚举、复制和省略效果，并用 render 定制业务标签。',
    componentId: 'pro-table',
    section: '值类型示例',
    checks: [
      '支持的基础值类型逐项可见',
      '状态文本和颜色语义一致',
      '业务标签使用 v3 render 参数渲染',
    ],
    file: 'pro-table/ValueTypeStyle.vue',
  },
  {
    path: '/pro-table/value-type-select',
    title: 'valueType - 选择类',
    description: '展示 select、radio、checkbox、switch 与异步选项。',
    componentId: 'pro-table',
    section: '值类型示例',
    checks: ['valueEnum 文本正确映射', '选择控件更新正确值', '异步选项加载完成后可选择'],
    file: 'pro-table/ValueTypeSelect.vue',
  },
  {
    path: '/pro-table/value-type-custom',
    title: '自定义 valueType',
    description: '通过 ProConfigProvider.valueTypeMap 注册自定义类型，共享展示、搜索与编辑行为。',
    componentId: 'pro-table',
    section: '值类型示例',
    checks: [
      '自定义只读内容正确渲染',
      '编辑控件通过 update 写回值',
      '查询、展示和编辑的转换边界清晰',
    ],
    file: 'pro-table/ValueTypeCustom.vue',
  },
  {
    path: '/pro-table/internationalization',
    title: '国际化相关的配置',
    description: '通过 ConfigProvider.locale 统一切换内置文案，并翻译业务表头和数据。',
    componentId: 'pro-table',
    section: '国际化相关的配置',
    checks: [
      '表头、状态与查询文案按语言切换',
      '日期和分页控件使用对应语言',
      '切换语言不丢失表格状态',
    ],
    file: 'pro-table/Internationalization.vue',
  },
  {
    path: '/pro-table/rtl-arabic',
    title: 'RTL (النسخة العربية)',
    description: '使用 ConfigProvider 的 RTL 方向与阿拉伯语文案映射参考布局。',
    componentId: 'pro-table',
    section: 'RTL (النسخة العربية)',
    checks: ['表格和操作区按 RTL 排列', '分页及方向性图标显示正确', '阿拉伯语内容不会溢出'],
    file: 'pro-table/RtlArabic.vue',
  },
  {
    path: '/pro-table/theme-dark-compact',
    title: '黑色主题 / 紧凑主题',
    description: '通过 Antdv Next 主题令牌、密度和容器样式映射黑色与紧凑主题。',
    componentId: 'pro-table',
    section: '主题',
    checks: ['深色主题下文本与边框对比可读', '紧凑模式会减小表格密度', '主题切换不重置查询和分页'],
    file: 'pro-table/ThemeDarkCompact.vue',
  },
  {
    path: '/pro-table/custom-error-boundary',
    title: '自定义错误边界',
    description: '通过 ProTable 的 ErrorBoundary 配置捕获单元格异常并定制降级界面。',
    componentId: 'pro-table',
    section: '自定义错误边界',
    checks: ['渲染异常被局部边界捕获', '显示可理解的降级内容', '其它 demo 和页面导航保持可用'],
    file: 'pro-table/CustomErrorBoundary.vue',
  },
  {
    path: '/pro-table/disabled-error-boundary',
    title: '取消自定义错误边界',
    description: '展示未启用自定义降级层时的 Vue 错误传播行为，并限制影响范围。',
    componentId: 'pro-table',
    section: '自定义错误边界',
    checks: [
      '示例明确显示边界关闭状态',
      '错误行为与自定义边界示例可对比',
      '测试容器隔离错误避免破坏整个 playground',
    ],
    file: 'pro-table/DisabledErrorBoundary.vue',
  },
  {
    path: '/pro-table/other-columns-state',
    title: '列状态 columnsState',
    description: '演示列显隐、顺序、固定位置以及浏览器存储持久化。',
    componentId: 'pro-table',
    section: '其它示例',
    checks: ['切换列显隐后表头即时更新', 'order 和 fixed 配置正确生效', '刷新页面后持久化状态恢复'],
    file: 'pro-table/OtherColumnsState.vue',
  },
  {
    path: '/pro-table/other-custom-setting-icon',
    title: '自定义列设置图标',
    description: '通过 options.setting 定制列设置图标与浮层，复用列状态逻辑。',
    componentId: 'pro-table',
    section: '其它示例',
    checks: ['自定义图标替代默认入口', '点击后可以控制列显隐', '图标具备可访问名称'],
    file: 'pro-table/OtherCustomSettingIcon.vue',
  },
  {
    path: '/pro-table/other-content-query-item',
    title: '内容类查询项',
    description: '通过 Vue 自定义查询控件映射非标准输入型查询项。',
    componentId: 'pro-table',
    section: '其它示例',
    checks: ['内容型查询项可以正常渲染', '交互结果能转换为请求参数', '重置后自定义控件同步清空'],
    file: 'pro-table/OtherContentQueryItem.vue',
  },
  {
    path: '/pro-table/list-toolbar-basic',
    title: '列表工具栏-基本使用',
    description: '用 toolbar.title 和 toolbar.actions 的 Vue VNode 组合标题、描述和操作按钮。',
    componentId: 'pro-table',
    section: '列表工具栏 / 代码演示',
    checks: ['标题和描述层级清晰', '主次操作按顺序展示', '工具栏宽度变化时能够换行'],
    file: 'pro-table/ListToolbarBasic.vue',
  },
  {
    path: '/pro-table/list-toolbar-no-title',
    title: '无标题',
    description: '省略标题，仅保留列表工具栏操作区。',
    componentId: 'pro-table',
    section: '列表工具栏 / 代码演示',
    checks: ['标题区域不显示可见内容', '操作区保持正确对齐'],
    file: 'pro-table/ListToolbarNoTitle.vue',
  },
  {
    path: '/pro-table/list-toolbar-multiple-line',
    title: '双行布局',
    description: '通过 toolbar.multipleLine 与 filter 使用工具栏双行布局。',
    componentId: 'pro-table',
    section: '列表工具栏 / 代码演示',
    checks: ['两行内容顺序符合参考结构', '长标题不会挤压主要操作', '窄屏下布局仍可读'],
    file: 'pro-table/ListToolbarMultipleLine.vue',
  },
  {
    path: '/pro-table/list-toolbar-tabs',
    title: '带标签',
    description: '通过 toolbar.tabs 配置受控标签，并用当前标签驱动数据。',
    componentId: 'pro-table',
    section: '列表工具栏 / 代码演示',
    checks: ['标签切换状态受控', '切换标签后表格参数同步变化', '工具栏其它操作仍可使用'],
    file: 'pro-table/ListToolbarTabs.vue',
  },
  {
    path: '/pro-table/list-toolbar-title-menu',
    title: '列表工具栏-标题下拉菜单',
    description: '通过 toolbar.menu 配置标题菜单，切换后更新请求参数。',
    componentId: 'pro-table',
    section: '列表工具栏 / 代码演示',
    checks: [
      '标题区域提供可访问的受控选择菜单',
      '选择菜单项后标题或数据更新',
      '键盘可以访问菜单项',
    ],
    file: 'pro-table/ListToolbarTitleMenu.vue',
  },
  {
    path: '/pro-table/editable-pro-form-validation',
    title: 'ProForm 内 EditableProTable（列校验）',
    description: '在表单中组合 EditableProTable，验证受控表格值、行校验与外层提交。',
    componentId: 'pro-table',
    section: '列表工具栏 / 代码演示',
    checks: [
      '可编辑表格作为外层表单字段同步值',
      '列校验失败时阻止保存和表单提交',
      '修正数据后行保存与外层提交均成功',
      '新增和删除行保持完整模型一致',
    ],
    file: 'pro-table/EditableProFormValidation.vue',
  },
  {
    path: '/editable-pro-table/multiple-row',
    title: '多行编辑与新增',
    description: '同时编辑多位成员，验证字段校验、异步保存、取消、新增与删除。',
    componentId: 'editable-pro-table',
    section: '行编辑',
    checks: ['必填字段校验', '保存与取消编辑', '新增和删除记录'],
    file: 'editable-table/MultipleRowEditing.vue',
  },
  {
    path: '/editable-pro-table/single-row',
    title: '单行编辑',
    description: '每次编辑一行记录，验证切换编辑行时的状态与字段校验。',
    componentId: 'editable-pro-table',
    section: '行编辑',
    checks: ['必填字段校验', '保存与取消编辑', '新增和删除记录'],
    file: 'editable-table/SingleRowEditing.vue',
  },
  {
    path: '/editable-pro-table/tree-data',
    title: '树形编辑与子节点新增',
    description: '编辑树形任务，通过 parentKey 向指定父节点新增子任务，也可以新增根任务。',
    componentId: 'editable-pro-table',
    section: '树形与层级',
    checks: ['编辑并保存子节点', '向父节点新增子任务', '取消新增与删除节点'],
    file: 'editable-table/EditableTree.vue',
  },
  {
    path: '/schema-form/basic',
    title: '基础表单',
    description: '通过 columns 定义字段、校验规则与提交行为，使用 v-model 管理表单值。',
    componentId: 'schema-form',
    section: '表单布局',
    checks: ['必填字段校验', '修改字段与重置', '查看提交后的表单值'],
    file: 'schema-form/BasicForm.vue',
  },
  {
    path: '/schema-form/query-filter',
    title: '查询筛选',
    description: '将字段定义用于查询面板，验证查询、重置和折叠行为。',
    componentId: 'schema-form',
    section: '表单布局',
    checks: ['必填字段校验', '修改字段与重置', '查看提交后的表单值'],
    file: 'schema-form/QueryFilterForm.vue',
  },
  {
    path: '/schema-form/light-filter',
    title: '轻量筛选',
    description: '使用标签与筛选弹层，在有限空间内完成确认、取消和清除。',
    componentId: 'schema-form',
    section: '表单布局',
    checks: ['必填字段校验', '修改字段与重置', '查看提交后的表单值'],
    file: 'schema-form/LightFilterForm.vue',
  },
  {
    path: '/schema-form/modal-form',
    title: '弹窗表单',
    description: '点击按钮打开弹窗，填写并提交发布计划。',
    componentId: 'schema-form',
    section: '表单布局',
    checks: ['必填字段校验', '修改字段与重置', '查看提交后的表单值'],
    file: 'schema-form/ModalForm.vue',
  },
  {
    path: '/schema-form/drawer-form',
    title: '抽屉表单',
    description: '在侧边抽屉中填写表单，验证打开、关闭、校验与提交。',
    componentId: 'schema-form',
    section: '表单布局',
    checks: ['必填字段校验', '修改字段与重置', '查看提交后的表单值'],
    file: 'schema-form/DrawerForm.vue',
  },
  {
    path: '/schema-form/steps-form',
    title: '分步表单',
    description: '将基本信息与发布设置分为两个步骤，验证步骤校验与最终提交。',
    componentId: 'schema-form',
    section: '表单布局',
    checks: ['必填字段校验', '修改字段与重置', '查看提交后的表单值'],
    file: 'schema-form/StepsForm.vue',
  },
  {
    path: '/schema-form/embed',
    title: '嵌入式表单',
    description: '将 Schema 字段嵌入现有内容，通过统一的模型与提交协议管理数据。',
    componentId: 'schema-form',
    section: '表单布局',
    checks: ['必填字段校验', '修改字段与重置', '查看提交后的表单值'],
    file: 'schema-form/EmbedForm.vue',
  },
  {
    path: '/schema-form/tree-select',
    title: '树选择字段',
    description: '使用 treeSelect 展示部门层级，验证树节点选择、清空、必填校验与提交值。',
    componentId: 'schema-form',
    section: '字段类型',
    checks: ['展开部门树并选择节点', '清空后触发必填校验', '提交值为选中节点的 value'],
    file: 'schema-form/TreeSelectForm.vue',
  },
  {
    path: '/pro-card/basic',
    title: '基础卡片',
    description: '组合标题、副标题、额外操作和内容，展示有层次的项目信息。',
    componentId: 'pro-card',
    section: '基础用法',
    checks: ['标题与副标题展示', '项目内容展示', '点击额外操作刷新信息'],
    file: 'pro-card/BasicCard.vue',
  },
  {
    path: '/pro-card/collapsible',
    title: '折叠卡片',
    description: '通过 v-model:collapsed 控制卡片展开与收起，验证标题与内容区域的交互。',
    componentId: 'pro-card',
    section: '基础用法',
    checks: ['标题与副标题展示', '额外操作插槽', '卡片内容展开与收起'],
    file: 'pro-card/CollapsibleCard.vue',
  },
]

export const examples = definitions.map(defineExample)
export const defaultExamplePath = '/pro-table/basic-query-table'
