<script setup lang="ts">
import { Avatar, Badge, ColorPicker, Image, Progress, Rate, TypographyText } from 'antdv-next'
import {
  computed,
  getCurrentInstance,
  h,
  isVNode,
  normalizeClass,
  normalizeStyle,
  ref,
  useAttrs,
  type CSSProperties,
  type VNodeChild,
  type VNode,
} from 'vue'
import { useProConfig, useProPrefix } from '../provider/context'
import type { ProFieldRenderContext } from '../provider/types'
import { mergeStyle, useSemanticStyles } from '../shared/semantic'
import FieldControl from '../pro-form-fields/FieldControl.vue'
import { findFieldOption, formatReadonlyValue } from '../pro-form-fields/readonly'
import { useFieldOptions } from '../pro-form-fields/useFieldOptions'
import { hasExplicitProp } from '../pro-form-fields/fieldRegistry'
import {
  normalizeBadgeStatus,
  PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES,
  resolveProFieldValueType,
} from './valueType'

import VNodeContent from '../shared/VNodeContent'
import type { ProFieldProps } from './types'

defineOptions({ name: 'ProField', inheritAttrs: false })
const {
  text: textProp,
  modelValue: modelValueProp,
  value: valueProp,
  readonly: readonlyProp,
  valueType: valueTypeProp = 'text',
  mode: modeProp = 'read',
  formItemRender: formItemRenderProp,
  fieldProps: fieldPropsProp,
  valueEnum: valueEnumProp,
  options: optionsProp,
  request: requestProp,
  params: paramsProp,
  debounceTime: debounceTimeProp,
  proFieldKey: proFieldKeyProp,
  cacheForSwr: cacheForSwrProp = undefined,
  onRequestError: onRequestErrorProp,
  emptyText: emptyTextProp,
  render: renderProp,
  renderFormItem: renderFormItemProp,
  copyable: copyableProp,
  ellipsis: ellipsisProp,
  prefixCls: prefixClsProp,
  classes: classesProp,
  classNames: classNamesProp,
  styles: stylesProp,
} = defineProps<ProFieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
  requestError: [error: unknown]
}>()
const slots = defineSlots<{ default?: (context: ProFieldRenderContext) => VNode[] }>()
const attrs = useAttrs()
const semanticProps = computed<ProFieldProps>(() => ({
  text: textProp,
  modelValue: modelValueProp,
  value: valueProp,
  readonly: readonlyProp,
  valueType: valueTypeProp,
  mode: modeProp,
  formItemRender: formItemRenderProp,
  fieldProps: fieldPropsProp,
  valueEnum: valueEnumProp,
  options: optionsProp,
  request: requestProp,
  params: paramsProp,
  debounceTime: debounceTimeProp,
  proFieldKey: proFieldKeyProp,
  cacheForSwr: cacheForSwrProp,
  onRequestError: onRequestErrorProp,
  emptyText: emptyTextProp,
  render: renderProp,
  renderFormItem: renderFormItemProp,
  copyable: copyableProp,
  ellipsis: ellipsisProp,
  prefixCls: prefixClsProp,
  classes: classesProp,
  classNames: classNamesProp,
  styles: stylesProp,
}))
const config = useProConfig()
const instance = getCurrentInstance()
const controlRef = ref<{ refresh: () => Promise<void> }>()
const prefix = useProPrefix('field', () => prefixClsProp)
const { classes, styles } = useSemanticStyles(semanticProps, {
  classes: () => classesProp,
  classNames: () => classNamesProp,
  styles: () => stylesProp,
})
const definition = computed(() =>
  resolveProFieldValueType(
    !hasExplicitProp(instance?.vnode.props, 'valueType') &&
      (valueEnumProp || requestProp || optionsProp)
      ? 'select'
      : valueTypeProp,
  ),
)
const effectiveFieldProps = computed(() => {
  const { type: _type, ...typeConfig } = definition.value
  return { ...typeConfig, ...fieldPropsProp }
})
const optionState = useFieldOptions({
  options: computed(() => optionsProp),
  fieldOptions: computed(() => {
    const fieldProps = effectiveFieldProps.value
    const options =
      definition.value.type === 'treeSelect' ? fieldProps.treeData : fieldProps.options
    return Array.isArray(options) ? options : undefined
  }),
  valueEnum: computed(() => valueEnumProp),
  // The editable FieldControl owns its request. Read fields need their own labels without a second request.
  request: computed(() => (readonlyProp || modeProp === 'read' ? requestProp : undefined)),
  params: computed(() => paramsProp),
  debounceTime: computed(() => debounceTimeProp),
  proFieldKey: computed(() => proFieldKeyProp),
  cacheForSwr: computed(() => cacheForSwrProp),
  onRequestError: (error) => emit('requestError', error),
})
defineExpose({
  refresh: () =>
    readonlyProp || modeProp === 'read'
      ? optionState.refresh()
      : (controlRef.value?.refresh() ?? Promise.resolve()),
})
const onChange = (value: unknown) => {
  emit('update:modelValue', value)
  emit('change', value)
}

function normalizeOptionContent(value: unknown): VNodeChild {
  if (Array.isArray(value)) return value.map(normalizeOptionContent)
  if (
    value == null ||
    isVNode(value) ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return value
  return null
}

function renderContent() {
  const mode = readonlyProp ? 'read' : modeProp
  const value = hasExplicitProp(instance?.vnode.props, 'modelValue')
    ? modelValueProp
    : hasExplicitProp(instance?.vnode.props, 'value')
      ? valueProp
      : modeProp !== 'read' && Object.hasOwn(fieldPropsProp ?? {}, 'value')
        ? fieldPropsProp?.value
        : textProp
  const { type } = definition.value
  const fieldProps = effectiveFieldProps.value
  const readControlProps: Record<string, unknown> & { class: string; style: CSSProperties } = {
    ...fieldProps,
    class: normalizeClass([fieldProps.class, classes.value.control]),
    style: mergeStyle(normalizeStyle([fieldProps.style]) as CSSProperties, styles.value.control),
  }
  const renderReadonlyText = (content: VNodeChild) =>
    classes.value.control || styles.value.control
      ? h('span', { class: classes.value.control, style: styles.value.control }, [content])
      : content
  const options = optionState.options.value
  const renderDefault = (): VNodeChild => {
    if ((PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES as readonly string[]).includes(type)) return null
    // Index, actions and avatar are display fields in every mode, matching the fixed baseline.
    if (type === 'index' || type === 'indexBorder')
      return h(
        'span',
        {
          class: [
            `${prefix.value}-index-column`,
            type === 'indexBorder' && `${prefix.value}-index-column-border`,
            Number(value) + 1 > 3 && 'top-three',
          ],
          style:
            type === 'indexBorder'
              ? {
                  display: 'inline-flex',
                  width: '18px',
                  height: '18px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9px',
                  background: Number(value) + 1 > 3 ? '#979797' : '#314659',
                  color: '#fff',
                  fontSize: '12px',
                }
              : undefined,
        },
        value == null ? (emptyTextProp ?? '-') : String(Number(value) + 1),
      )
    if (type === 'option')
      return h(
        'span',
        {
          class: `${prefix.value}-option`,
          style: {
            display: 'inline-flex',
            gap: `${config.token.value.margin}px`,
            alignItems: 'center',
          },
        },
        [normalizeOptionContent(value)],
      )
    if (type === 'avatar')
      return value == null || value === ''
        ? (emptyTextProp ?? '-')
        : h(Avatar, { size: 22, shape: 'circle', ...readControlProps, src: String(value) })
    if (mode !== 'read')
      return h(
        FieldControl,
        {
          ...attrs,
          ref: controlRef,
          fieldType: type,
          modelValue: value,
          fieldProps,
          prefixCls: prefix.value,
          classes: classes.value,
          styles: styles.value,
          options: optionsProp,
          valueEnum: valueEnumProp,
          request: requestProp,
          params: paramsProp,
          debounceTime: debounceTimeProp,
          proFieldKey: proFieldKeyProp,
          cacheForSwr: cacheForSwrProp,
          onRequestError: (error: unknown) => emit('requestError', error),
          'onUpdate:modelValue': onChange,
        },
        slots,
      )
    if (value === undefined || value === null || value === '')
      return renderReadonlyText(emptyTextProp ?? '-')
    if (isVNode(value) || type === 'option') return value as VNodeChild
    if (type === 'fromNow') {
      const date = value instanceof Date ? value : new Date(value as string | number)
      if (!Number.isNaN(date.getTime())) {
        const seconds = Math.round((date.getTime() - Date.now()) / 1000)
        const [divisor, unit] =
          Math.abs(seconds) >= 86400
            ? ([86400, 'day'] as const)
            : Math.abs(seconds) >= 3600
              ? ([3600, 'hour'] as const)
              : Math.abs(seconds) >= 60
                ? ([60, 'minute'] as const)
                : ([1, 'second'] as const)
        return renderReadonlyText(
          new Intl.RelativeTimeFormat(config.intl.value.locale.replace('_', '-'), {
            numeric: 'auto',
          }).format(Math.round(seconds / divisor), unit),
        )
      }
    }
    const option = findFieldOption(value, options)
    if (option?.status || option?.color)
      return h(Badge, {
        ...readControlProps,
        status: normalizeBadgeStatus(option.status),
        color: typeof option.color === 'string' ? option.color : undefined,
        text: h('span', [option.label]),
      })
    if (!option && typeof value === 'boolean')
      return renderReadonlyText(
        config.intl.value.getMessage(value ? 'switch.open' : 'switch.close', value ? '是' : '否'),
      )
    if (type === 'progress') return h(Progress, { ...readControlProps, percent: Number(value) })
    if (type === 'image') return h(Image, { width: 32, ...readControlProps, src: String(value) })
    if (type === 'rate')
      return h(Rate, { ...readControlProps, value: Number(value), disabled: true })
    if (type === 'color' || type === 'colorPicker')
      return h(ColorPicker, {
        ...readControlProps,
        value: String(value),
        class: normalizeClass([`${prefix.value}-color-picker`, readControlProps.class]),
        open: false,
      })
    if (type === 'code' || type === 'jsonCode') {
      let text = String(value)
      if (type === 'jsonCode') {
        try {
          text = JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value, null, 2)
        } catch {
          /* preserve invalid input for inspection */
        }
      }
      return h(
        'pre',
        {
          ...readControlProps,
          style: mergeStyle(
            {
              padding: '16px',
              overflow: 'auto',
              fontSize: '85%',
              lineHeight: 1.45,
              color: config.token.value.colorTextSecondary,
              fontFamily: config.token.value.fontFamilyCode,
              backgroundColor: 'rgba(150, 150, 150, 0.1)',
              borderRadius: '3px',
              width: 'min-content',
            },
            readControlProps.style,
          ),
        },
        h('code', text),
      )
    }
    const content = formatReadonlyValue(value, {
      type,
      options,
      emptyText: emptyTextProp ?? '-',
      locale: config.intl.value.locale,
      moneyPrefix: fieldProps.prefix as VNodeChild | false | undefined,
      fieldProps,
    })
    if (type === 'textarea' && !copyableProp && !ellipsisProp) {
      const {
        autoSize: _autoSize,
        showCount: _showCount,
        classNames: _classNames,
        styles: _styles,
        ...textareaProps
      } = readControlProps
      return h(
        'span',
        {
          ...textareaProps,
          class: normalizeClass([`${prefix.value}-readonly-textarea`, readControlProps.class]),
          style: mergeStyle(
            {
              display: 'inline-block',
              lineHeight: 1.5715,
              maxWidth: '100%',
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            },
            readControlProps.style,
          ),
        },
        [content],
      )
    }
    return copyableProp || ellipsisProp
      ? h(
          TypographyText,
          { ...readControlProps, copyable: copyableProp, ellipsis: ellipsisProp },
          { default: () => content },
        )
      : renderReadonlyText(content)
  }
  const context: ProFieldRenderContext = {
    mode,
    value,
    onChange,
    fieldProps,
    defaultRender: renderDefault,
  }
  const registered = config.valueTypeMap.value[type]
  const renderer =
    mode === 'read'
      ? (renderProp ?? registered?.render)
      : (formItemRenderProp ??
        renderFormItemProp ??
        registered?.formItemRender ??
        registered?.renderFormItem)
  const dom = renderDefault()
  const content = renderer ? renderer(value, context, dom) : (slots.default?.(context) ?? dom)
  return content
}
const effectiveMode = computed(() => (readonlyProp ? 'read' : modeProp))
</script>

<template>
  <span
    v-bind="attrs"
    :class="[
      prefix,
      `${prefix}-${effectiveMode}`,
      effectiveMode === 'read' &&
        ['text', 'textarea'].includes(definition.type) &&
        `${prefix}-readonly`,
      effectiveMode === 'read' && definition.type === 'select' && 'pro-field-select-read',
      config.hashId.value,
      classes.root,
      attrs.class,
    ]"
    :style="[
      { color: config.token.value.colorText },
      effectiveMode === 'read' && definition.type === 'text'
        ? { overflowWrap: 'anywhere', wordBreak: 'break-word' }
        : undefined,
      attrs.style,
      styles.root,
    ]"
    :dir="config.direction.value"
  >
    <VNodeContent :content="renderContent()" />
  </span>
</template>
