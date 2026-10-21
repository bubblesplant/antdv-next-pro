import { Avatar, Badge, ColorPicker, Image, Progress, Rate, TypographyText } from 'antdv-next'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  isVNode,
  normalizeClass,
  normalizeStyle,
  ref,
  type CSSProperties,
  type PropType,
  type VNodeChild,
} from 'vue'
import { useProConfig, useProPrefix } from '../provider/context'
import type {
  ProFieldRenderContext,
  ProSemanticClasses,
  ProSemanticSource,
  ProSemanticStyles,
} from '../provider/types'
import { useSemanticStyles } from '../shared/semantic'
import FieldControl from '../pro-form-fields/FieldControl.vue'
import { findFieldOption, formatReadonlyValue } from '../pro-form-fields/readonly'
import { useFieldOptions } from '../pro-form-fields/useFieldOptions'
import type {
  ProFormFieldOption,
  ProFormFieldRequest,
  ProFormValueEnum,
} from '../pro-form-fields/types'
import { hasExplicitProp } from '../pro-form-fields/fieldRegistry'
import {
  normalizeBadgeStatus,
  PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES,
  resolveProFieldValueType,
  type ProFieldValueTypeInput,
} from './valueType'

export interface ProFieldProps {
  text?: unknown
  modelValue?: unknown
  value?: unknown
  readonly?: boolean
  valueType?: ProFieldValueTypeInput
  mode?: 'read' | 'edit' | 'update'
  formItemRender?: (text: unknown, context: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  fieldProps?: Record<string, unknown>
  valueEnum?: ProFormValueEnum
  options?: ProFormFieldOption[]
  request?: ProFormFieldRequest
  params?: Record<string, unknown>
  debounceTime?: number
  proFieldKey?: string
  cacheForSwr?: boolean
  onRequestError?: (error: unknown) => void
  emptyText?: VNodeChild
  render?: (text: unknown, context: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  renderFormItem?: (text: unknown, context: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  copyable?: boolean | Record<string, unknown>
  ellipsis?: boolean | Record<string, unknown>
  prefixCls?: string
  classes?: ProSemanticSource<ProSemanticClasses, ProFieldProps>
  classNames?: ProSemanticSource<ProSemanticClasses, ProFieldProps>
  styles?: ProSemanticSource<ProSemanticStyles, ProFieldProps>
}

export const ProField = defineComponent({
  name: 'ProField',
  inheritAttrs: false,
  props: {
    text: null,
    modelValue: null,
    value: null,
    readonly: Boolean,
    valueType: { type: [String, Object] as PropType<ProFieldValueTypeInput>, default: 'text' },
    mode: { type: String as PropType<NonNullable<ProFieldProps['mode']>>, default: 'read' },
    fieldProps: Object as PropType<Record<string, unknown>>,
    valueEnum: [Object, Map] as PropType<ProFormValueEnum>,
    options: Array as PropType<ProFormFieldOption[]>,
    request: Function as PropType<ProFormFieldRequest>,
    params: Object,
    debounceTime: Number,
    proFieldKey: String,
    cacheForSwr: { type: Boolean, default: undefined },
    emptyText: null,
    render: Function as PropType<ProFieldProps['render']>,
    renderFormItem: Function as PropType<ProFieldProps['renderFormItem']>,
    formItemRender: Function as PropType<ProFieldProps['formItemRender']>,
    copyable: [Boolean, Object] as PropType<ProFieldProps['copyable']>,
    ellipsis: [Boolean, Object] as PropType<ProFieldProps['ellipsis']>,
    prefixCls: String,
    classes: [Object, Function] as PropType<ProFieldProps['classes']>,
    classNames: [Object, Function] as PropType<ProFieldProps['classNames']>,
    styles: [Object, Function] as PropType<ProFieldProps['styles']>,
  },
  emits: ['update:modelValue', 'change', 'requestError'],
  setup(props, { attrs, emit, slots, expose }) {
    const config = useProConfig()
    const instance = getCurrentInstance()
    const controlRef = ref<{ refresh: () => Promise<void> }>()
    const prefix = useProPrefix('field', () => props.prefixCls)
    const { classes, styles } = useSemanticStyles(props, {
      classes: () => props.classes,
      classNames: () => props.classNames,
      styles: () => props.styles,
    })
    const definition = computed(() =>
      resolveProFieldValueType(
        !hasExplicitProp(instance?.vnode.props, 'valueType') &&
          (props.valueEnum || props.request || props.options)
          ? 'select'
          : props.valueType,
      ),
    )
    const effectiveFieldProps = computed(() => {
      const { type: _type, ...typeConfig } = definition.value
      return { ...typeConfig, ...props.fieldProps }
    })
    const optionState = useFieldOptions({
      options: computed(() => props.options),
      fieldOptions: computed(() => {
        const fieldProps = effectiveFieldProps.value
        const options =
          definition.value.type === 'treeSelect' ? fieldProps.treeData : fieldProps.options
        return Array.isArray(options) ? options : undefined
      }),
      valueEnum: computed(() => props.valueEnum),
      // The editable FieldControl owns its request. Read fields need their own labels without a second request.
      request: computed(() =>
        props.readonly || props.mode === 'read' ? props.request : undefined,
      ),
      params: computed(() => props.params),
      debounceTime: computed(() => props.debounceTime),
      proFieldKey: computed(() => props.proFieldKey),
      cacheForSwr: computed(() => props.cacheForSwr),
      onRequestError: (error) => emit('requestError', error),
    })
    expose({
      refresh: () =>
        props.readonly || props.mode === 'read'
          ? optionState.refresh()
          : (controlRef.value?.refresh() ?? Promise.resolve()),
    })
    const onChange = (value: unknown) => {
      emit('update:modelValue', value)
      emit('change', value)
    }
    return () => {
      const mode = props.readonly ? 'read' : props.mode
      const value = hasExplicitProp(instance?.vnode.props, 'modelValue')
        ? props.modelValue
        : hasExplicitProp(instance?.vnode.props, 'value')
          ? props.value
          : props.mode !== 'read' && Object.hasOwn(props.fieldProps ?? {}, 'value')
            ? props.fieldProps?.value
            : props.text
      const { type } = definition.value
      const fieldProps = effectiveFieldProps.value
      const readControlProps = {
        ...fieldProps,
        class: normalizeClass([fieldProps.class, classes.value.control]),
        style: normalizeStyle([fieldProps.style, styles.value.control]) as CSSProperties,
      }
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
            value == null ? (props.emptyText ?? '-') : String(Number(value) + 1),
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
            [value as VNodeChild],
          )
        if (type === 'avatar')
          return value == null || value === ''
            ? (props.emptyText ?? '-')
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
              options: props.options,
              valueEnum: props.valueEnum,
              request: props.request,
              params: props.params,
              debounceTime: props.debounceTime,
              proFieldKey: props.proFieldKey,
              cacheForSwr: props.cacheForSwr,
              onRequestError: (error: unknown) => emit('requestError', error),
              'onUpdate:modelValue': onChange,
            },
            slots,
          )
        if (value === undefined || value === null || value === '') return props.emptyText ?? '-'
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
            return new Intl.RelativeTimeFormat(config.intl.value.locale.replace('_', '-'), {
              numeric: 'auto',
            }).format(Math.round(seconds / divisor), unit)
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
          return config.intl.value.getMessage(
            value ? 'switch.open' : 'switch.close',
            value ? '是' : '否',
          )
        if (type === 'progress') return h(Progress, { ...readControlProps, percent: Number(value) })
        if (type === 'image')
          return h(Image, { width: 32, ...readControlProps, src: String(value) })
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
          return h('pre', { style: { margin: 0, whiteSpace: 'pre-wrap' } }, h('code', text))
        }
        const content = formatReadonlyValue(value, {
          type,
          options,
          emptyText: props.emptyText ?? '-',
          locale: config.intl.value.locale,
          moneyPrefix: fieldProps.prefix as VNodeChild | false | undefined,
          fieldProps,
        })
        return props.copyable || props.ellipsis
          ? h(
              TypographyText,
              { ...readControlProps, copyable: props.copyable, ellipsis: props.ellipsis },
              { default: () => content },
            )
          : content
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
          ? (props.render ?? registered?.render)
          : (props.formItemRender ??
            props.renderFormItem ??
            registered?.formItemRender ??
            registered?.renderFormItem)
      const dom = renderDefault()
      const content = renderer ? renderer(value, context, dom) : (slots.default?.(context) ?? dom)
      return h(
        'span',
        {
          ...attrs,
          class: [
            prefix.value,
            `${prefix.value}-${mode}`,
            mode === 'read' && ['text', 'textarea'].includes(type) && `${prefix.value}-readonly`,
            mode === 'read' && type === 'select' && 'pro-field-select-read',
            config.hashId.value,
            classes.value.root,
            attrs.class,
          ],
          style: [{ color: config.token.value.colorText }, attrs.style, styles.value.root],
          dir: config.direction.value,
        },
        [content],
      )
    }
  },
})

export default ProField
