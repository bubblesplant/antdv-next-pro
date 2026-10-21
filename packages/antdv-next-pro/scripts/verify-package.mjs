import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDirectory, '..')
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'))
const require = createRequire(import.meta.url)

const expectedEntries = {
  main: './dist/index.cjs',
  module: './dist/index.js',
  style: './dist/style.css',
  types: './dist/index.d.ts',
}

for (const [field, expected] of Object.entries(expectedEntries)) {
  assert.equal(packageJson[field], expected, `${field} 应指向 ${expected}`)
  assert.ok(existsSync(resolve(packageRoot, expected)), `${expected} 不存在`)
}

for (const declaration of ['dist/index.d.ts', 'dist/index.d.cts']) {
  const declarationPath = resolve(packageRoot, declaration)
  const declarationContent = readFileSync(declarationPath, 'utf8')
  const sourceMap = declarationContent.match(/\/\/# sourceMappingURL=(.+)$/m)
  assert.ok(sourceMap?.[1], `${declaration} 缺少 sourceMappingURL`)
  assert.ok(
    existsSync(resolve(dirname(declarationPath), sourceMap[1])),
    `${declaration} 引用的 ${sourceMap[1]} 不存在`,
  )
}

assert.deepEqual(packageJson.exports['.'], {
  import: {
    types: './dist/index.d.ts',
    default: './dist/index.js',
  },
  require: {
    types: './dist/index.d.cts',
    default: './dist/index.cjs',
  },
})
assert.equal(packageJson.exports['./style.css'], './dist/style.css')

const esmEntry = fileURLToPath(import.meta.resolve(packageJson.name))
assert.equal(esmEntry, resolve(packageRoot, 'dist/index.js'))
assert.equal(require.resolve(packageJson.name), resolve(packageRoot, 'dist/index.cjs'))
assert.equal(
  require.resolve(`${packageJson.name}/style.css`),
  resolve(packageRoot, 'dist/style.css'),
)

const expectedRuntimeExports = [
  'AntdvNextPro',
  'DrawerForm',
  'EditableProTable',
  'Embed',
  'FieldControl',
  'Form',
  'LightFilter',
  'ModalForm',
  'ProCard',
  'ProFormCaptcha',
  'ProFormCheckbox',
  'ProFormDatePicker',
  'ProFormDateRangePicker',
  'ProFormDateTimePicker',
  'ProFormDateTimeRangePicker',
  'ProFormDigit',
  'ProFormField',
  'ProFormMoney',
  'ProFormRadio',
  'ProFormRadioGroup',
  'ProFormSegmented',
  'ProFormSelect',
  'ProFormSlider',
  'ProFormSwitch',
  'ProTable',
  'ProFormText',
  'ProFormTextArea',
  'ProFormTextPassword',
  'ProFormTreeSelect',
  'ProFormUploadButton',
  'ProFormUploadDragger',
  'QueryFilter',
  'ReadonlyField',
  'SchemaForm',
  'StepForm',
  'StepsForm',
  'ProConfigProvider',
  'ProProvider',
  'useProConfig',
  'useIntl',
  'createIntl',
  'intlMap',
  'ProField',
  'ProForm',
  'BetaSchemaForm',
  'ProFormGroup',
  'ProFormFieldSet',
  'ProFormList',
  'ProFormDependency',
  'ProFormItem',
  'ProFormErrorList',
  'ProFormProvider',
  'ProFormCascader',
  'ProFormColorPicker',
  'ProFormRate',
  'ProFormDigitRange',
  'ProFormTimePicker',
  'ProFormTimeRangePicker',
  'ProFormDateWeekPicker',
  'ProFormDateMonthPicker',
  'ProFormDateQuarterPicker',
  'ProFormDateYearPicker',
  'ProFormDateWeekRangePicker',
  'ProFormDateMonthRangePicker',
  'ProFormDateQuarterRangePicker',
  'ProFormDateYearRangePicker',
  'ProFormCheckboxGroup',
  'ProFormSearchSelect',
  'ProCardGroup',
  'ProCardDivider',
  'ProCardTabPane',
  'ProList',
  'BaseProList',
  'ProDescriptions',
  'ProDescriptionsItem',
  'DragSortTable',
  'RowEditorTable',
  'CellEditorTable',
  'ListToolBar',
  'TableDropdown',
  'TableDropdownButton',
  'Search',
  'LightWrapper',
  'ErrorBoundary',
  'DropdownFooter',
  'FieldLabel',
  'FilterDropdown',
  'InlineErrorFormItem',
  'LabelIconTip',
  'default',
  ...[
    'Text',
    'Cascader',
    'Checkbox',
    'Code',
    'ColorPicker',
    'DatePicker',
    'Digit',
    'DigitRange',
    'FromNow',
    'Image',
    'Money',
    'Options',
    'Password',
    'Percent',
    'Progress',
    'Radio',
    'RangePicker',
    'Rate',
    'Second',
    'Segmented',
    'Select',
    'Slider',
    'Switch',
    'TextArea',
    'TimePicker',
    'TimeRangePicker',
    'TreeSelect',
    'IndexColumn',
    'Status',
  ].map((name) => `Field${name}`),
  ...[
    'arEG',
    'caES',
    'csCZ',
    'deDE',
    'enGB',
    'enUS',
    'esES',
    'faIR',
    'frFR',
    'heIL',
    'hrHR',
    'idID',
    'itIT',
    'jaJP',
    'koKR',
    'mnMN',
    'msMY',
    'nlNL',
    'plPL',
    'ptBR',
    'roRO',
    'ruRU',
    'skSK',
    'srRS',
    'svSE',
    'thTH',
    'trTR',
    'ukUA',
    'urPK',
    'uzUZ',
    'viVN',
    'zhCN',
    'zhHK',
    'zhTW',
  ].map((name) => `${name}Intl`),
]

function parseBundle(file, format) {
  const source = readFileSync(resolve(packageRoot, file), 'utf8')
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  )
  assert.equal(
    sourceFile.parseDiagnostics.length,
    0,
    `${format} 产物存在语法错误：${sourceFile.parseDiagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      .join('; ')}`,
  )

  const exportBindings = new Map()
  for (const statement of sourceFile.statements) {
    if (format === 'ESM' && ts.isExportDeclaration(statement)) {
      const exportClause = statement.exportClause
      if (!exportClause || !ts.isNamedExports(exportClause)) continue
      for (const specifier of exportClause.elements) {
        exportBindings.set(specifier.name.text, (specifier.propertyName ?? specifier.name).text)
      }
      continue
    }

    if (
      format === 'CJS' &&
      ts.isExpressionStatement(statement) &&
      ts.isBinaryExpression(statement.expression) &&
      statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(statement.expression.left) &&
      ts.isIdentifier(statement.expression.left.expression) &&
      statement.expression.left.expression.text === 'exports' &&
      ts.isIdentifier(statement.expression.right)
    ) {
      exportBindings.set(statement.expression.left.name.text, statement.expression.right.text)
    }
    if (
      format === 'CJS' &&
      ts.isExpressionStatement(statement) &&
      isStaticMethodCall(statement.expression, 'Object', 'defineProperty')
    ) {
      const [target, name, descriptor] = statement.expression.arguments
      if (
        target &&
        ts.isIdentifier(target) &&
        target.text === 'exports' &&
        name &&
        ts.isStringLiteral(name) &&
        descriptor &&
        ts.isObjectLiteralExpression(descriptor)
      ) {
        const getter = descriptor.properties.find(
          (property) =>
            (ts.isMethodDeclaration(property) || ts.isPropertyAssignment(property)) &&
            property.name.getText(sourceFile) === 'get',
        )
        const body =
          getter && ts.isPropertyAssignment(getter) ? getter.initializer.body : getter?.body
        const returned = body?.statements?.find(ts.isReturnStatement)?.expression
        if (returned) exportBindings.set(name.text, returned.getText(sourceFile))
      }
    }
  }

  return { exportBindings, format, sourceFile }
}

function getTopLevelVariable(sourceFile, binding, format) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === binding) {
        assert.ok(
          statement.declarationList.flags & ts.NodeFlags.Const,
          `${format} 的 ${binding} 必须使用 const 声明`,
        )
        assert.ok(declaration.initializer, `${format} 的 ${binding} 缺少初始化表达式`)
        return declaration
      }
    }
  }
  assert.fail(`${format} 无法定位顶层绑定 ${binding}`)
}

function isStaticMethodCall(node, object, method) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === object &&
    node.expression.name.text === method
  )
}

function assertExactObjectAlias(objectLiteral, property, targetBinding, format, owner) {
  assert.ok(
    ts.isObjectLiteralExpression(objectLiteral),
    `${format} 的 ${owner} 别名参数必须是对象字面量`,
  )
  const aliasProperty = objectLiteral.properties.find(
    (node) => ts.isPropertyAssignment(node) && node.name.getText() === property,
  )
  assert.ok(
    aliasProperty &&
      ts.isPropertyAssignment(aliasProperty) &&
      aliasProperty.name.getText() === property &&
      ts.isIdentifier(aliasProperty.initializer) &&
      aliasProperty.initializer.text === targetBinding,
    `${format} 的 ${owner}.${property} 应直接指向 ${targetBinding}`,
  )
}

function isOwnerProperty(node, ownerBinding, property) {
  return (
    (ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === ownerBinding &&
      node.name.text === property) ||
    (ts.isElementAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === ownerBinding &&
      ts.isStringLiteralLike(node.argumentExpression) &&
      node.argumentExpression.text === property)
  )
}

function assertNoAliasOverwrite(sourceFile, declaration, format, ownerBinding, property) {
  const overwrites = []
  const visit = (node) => {
    if (node.getStart(sourceFile) > declaration.end) {
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
        node.operatorToken.kind <= ts.SyntaxKind.LastAssignment &&
        (isOwnerProperty(node.left, ownerBinding, property) ||
          (ts.isIdentifier(node.left) && node.left.text === ownerBinding))
      ) {
        overwrites.push(node.getText(sourceFile))
      } else if (
        (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
        (node.operator === ts.SyntaxKind.PlusPlusToken ||
          node.operator === ts.SyntaxKind.MinusMinusToken) &&
        isOwnerProperty(node.operand, ownerBinding, property)
      ) {
        overwrites.push(node.getText(sourceFile))
      } else if (
        ts.isDeleteExpression(node) &&
        isOwnerProperty(node.expression, ownerBinding, property)
      ) {
        overwrites.push(node.getText(sourceFile))
      } else if (
        ts.isCallExpression(node) &&
        node.arguments[0] &&
        ts.isIdentifier(node.arguments[0]) &&
        node.arguments[0].text === ownerBinding &&
        (isStaticMethodCall(node, 'Object', 'assign') ||
          isStaticMethodCall(node, 'Object', 'defineProperty') ||
          isStaticMethodCall(node, 'Object', 'defineProperties') ||
          isStaticMethodCall(node, 'Reflect', 'set'))
      ) {
        overwrites.push(node.getText(sourceFile))
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  assert.deepEqual(overwrites, [], `${format} 的 ${ownerBinding}.${property} 存在后续覆写`)
}

function assertBundledAlias(bundle, owner, property, target, factory) {
  const { exportBindings, format, sourceFile } = bundle
  const ownerBinding = exportBindings.get(owner)
  const targetBinding = exportBindings.get(target)
  assert.ok(ownerBinding, `${format} 无法定位导出 ${owner} 的绑定`)
  assert.ok(targetBinding, `${format} 无法定位导出 ${target} 的绑定`)

  const declaration = getTopLevelVariable(sourceFile, ownerBinding, format)
  const initializer = declaration.initializer
  assert.ok(
    isStaticMethodCall(initializer, 'Object', factory),
    `${format} 的 ${owner} 必须由 Object.${factory} 初始化`,
  )
  assert.equal(
    initializer.arguments.length,
    factory === 'assign' ? 2 : 1,
    `${format} 的 ${owner} 使用了非预期的 Object.${factory} 参数`,
  )
  const aliasObject = initializer.arguments[factory === 'assign' ? 1 : 0]
  assertExactObjectAlias(aliasObject, property, targetBinding, format, owner)
  assertNoAliasOverwrite(sourceFile, declaration, format, ownerBinding, property)
}

for (const bundle of [parseBundle('dist/index.js', 'ESM'), parseBundle('dist/index.cjs', 'CJS')]) {
  for (const name of expectedRuntimeExports) {
    assert.ok(bundle.exportBindings.has(name), `${bundle.format} 缺少导出 ${name}`)
  }
  assertBundledAlias(bundle, 'ProFormText', 'Password', 'ProFormTextPassword', 'assign')
  assertBundledAlias(bundle, 'ProFormRadio', 'Group', 'ProFormRadioGroup', 'assign')
  assertBundledAlias(bundle, 'ProFormCheckbox', 'Group', 'ProFormCheckboxGroup', 'assign')
}

// Real module loading also catches invalid external ESM paths that AST/type checks cannot find.
const esm = await import(pathToFileURL(resolve(packageRoot, 'dist/index.js')).href)
const cjs = require(resolve(packageRoot, 'dist/index.cjs'))
for (const [format, loaded] of [
  ['ESM', esm],
  ['CJS', cjs],
]) {
  for (const name of expectedRuntimeExports) assert.ok(loaded[name], `${format} 运行时缺少 ${name}`)
  for (const [owner, member, target] of [
    ['ProFormText', 'Password', 'ProFormTextPassword'],
    ['ProFormRadio', 'Group', 'ProFormRadioGroup'],
    ['ProFormCheckbox', 'Group', 'ProFormCheckboxGroup'],
    ['ProFormDatePicker', 'Week', 'ProFormDateWeekPicker'],
    ['ProFormDatePicker', 'Month', 'ProFormDateMonthPicker'],
    ['ProFormDatePicker', 'Quarter', 'ProFormDateQuarterPicker'],
    ['ProFormDatePicker', 'Year', 'ProFormDateYearPicker'],
    ['ProFormSelect', 'SearchSelect', 'ProFormSearchSelect'],
    ['ProCard', 'Group', 'ProCardGroup'],
    ['ProCard', 'Divider', 'ProCardDivider'],
    ['ProCard', 'TabPane', 'ProCardTabPane'],
    ['TableDropdown', 'Button', 'TableDropdownButton'],
    ['ProDescriptions', 'Item', 'ProDescriptionsItem'],
    ['StepsForm', 'StepForm', 'StepForm'],
  ])
    assert.equal(
      loaded[owner][member],
      loaded[target],
      `${format} 的 ${owner}.${member} 引用不正确`,
    )
  assert.equal(Object.keys(loaded.intlMap).length, 34, `${format} 内置语言数量不正确`)
  const registrations = new Map()
  loaded.default.install({
    component(name, component) {
      registrations.set(name, component)
    },
  })
  for (const name of [
    'ProForm',
    'BetaSchemaForm',
    'ProConfigProvider',
    'ProField',
    'BaseProList',
    'ProDescriptionsItem',
    'DragSortTable',
    'ProFormCascader',
    'FieldMoney',
    'DropdownFooter',
  ]) {
    assert.equal(registrations.get(name), loaded[name], `${format} 全局注册 ${name} 不正确`)
  }
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const packResult = spawnSync(npmCommand, ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  cwd: packageRoot,
  encoding: 'utf8',
  shell: process.platform === 'win32',
})

assert.equal(
  packResult.status,
  0,
  `npm pack --dry-run 失败：${packResult.stderr || packResult.stdout}`,
)

const packReport = JSON.parse(packResult.stdout)
const packedFiles = new Set(packReport[0]?.files?.map((file) => file.path) ?? [])
for (const file of [
  'LICENSE',
  'README.md',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.cts',
  'dist/index.d.cts.map',
  'dist/index.d.ts',
  'dist/index.d.ts.map',
  'dist/index.js',
  'dist/index.js.map',
  'dist/style.css',
  'package.json',
]) {
  assert.ok(packedFiles.has(file), `npm 包缺少 ${file}`)
}

console.log(`已验证 ${packageJson.name} 的 ESM、CJS、类型、样式和 npm pack 文件清单。`)
