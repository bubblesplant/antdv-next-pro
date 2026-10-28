import type { Component, PropType, VNodeChild } from 'vue'
import type { PopoverProps } from 'antdv-next'
import { Button, Drawer, Modal, Popover, Space } from 'antdv-next'
import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  watch,
} from 'vue'
import { cloneValue } from '../schema-form/utils'
import { getValue, normalizePath, setValue } from '../schema-form/utils'
import type { ProDataIndex } from '../types'
import FieldLabel from '../components/FieldLabel.vue'
import ProField from '../pro-field/ProField'
import { FilterOutlined } from '@antdv-next/icons'
import ProForm, { proFormProps } from './ProForm'
import type {
  DrawerFormProps,
  LightFilterProps,
  ModalFormProps,
  ProFormInstance,
  QueryFilterProps,
  SubmitterProps,
} from './types'
import { useProFormContext, useProFormNamePath } from './context'
import { flattenChildren, resolveSemantic, useFormPrefix } from './utils'
import { useOverlaySubmitLock } from './useOverlaySubmitLock'
import { defaultCollapseRender } from './query-filter/Actions'

export function pickFormProps(props: Record<string, unknown>) {
  return Object.fromEntries(Object.keys(proFormProps).map((key) => [key, props[key]]))
}

function proxyForm(refValue: { value: ProFormInstance | undefined }): ProFormInstance {
  return {
    get nativeForm() {
      return refValue.value?.nativeForm
    },
    validate: (...args) => refValue.value?.validate(...args) ?? Promise.resolve({}),
    validateFields: (...args) => refValue.value?.validateFields(...args) ?? Promise.resolve({}),
    validateFieldsReturnFormatValue: (...args) =>
      refValue.value?.validateFieldsReturnFormatValue(...args) ?? Promise.resolve({}),
    reset: () => refValue.value?.reset(),
    resetFields: () => refValue.value?.resetFields(),
    clearValidate: (...args) => refValue.value?.clearValidate(...args),
    getFieldsValue: (...args) => refValue.value?.getFieldsValue(...args) ?? {},
    getFieldValue: (...args) => refValue.value?.getFieldValue(...args),
    getFieldsFormatValue: () => refValue.value?.getFieldsFormatValue() ?? {},
    getFieldFormatValue: (...args) => refValue.value?.getFieldFormatValue(...args),
    setFieldsValue: (...args) => refValue.value?.setFieldsValue(...args),
    setFieldValue: (...args) => refValue.value?.setFieldValue(...args),
    submit: () => refValue.value?.submit() ?? Promise.resolve({}),
    scrollToField: (...args) => refValue.value?.scrollToField(...args),
    loading: computed(() => Boolean(unref(refValue.value?.loading))),
  }
}

export function createDialogForm(kind: 'ModalForm' | 'DrawerForm') {
  return defineComponent({
    name: kind,
    inheritAttrs: false,
    props: {
      ...proFormProps,
      open: { type: Boolean, default: undefined },
      title: null,
      width: [Number, String],
      trigger: null,
      modalProps: Object as PropType<ModalFormProps['modalProps']>,
      drawerProps: Object as PropType<DrawerFormProps['drawerProps']>,
      submitTimeout: Number,
    },
    emits: [
      'update:open',
      'update:modelValue',
      'openChange',
      'reset',
      'error',
      'requestError',
      'submit',
      'change',
    ],
    setup(props, { slots, attrs, emit, expose }) {
      const inner = ref<ProFormInstance>()
      const api = proxyForm(inner)
      const local = ref(false)
      const { prefix, t } = useFormPrefix('form', () => props.prefixCls)
      const closeLock = useOverlaySubmitLock(() => props.submitTimeout)
      const open = computed(() => props.open ?? local.value)
      let revision = 0
      let alive = true
      onBeforeUnmount(() => {
        alive = false
        revision++
      })
      watch(
        open,
        () => {
          revision++
        },
        { flush: 'sync' },
      )
      const setOpen = (value: boolean) => {
        revision++
        local.value = value
        emit('update:open', value)
        emit('openChange', value)
      }
      expose({ ...api, open: () => setOpen(true), close: () => setOpen(false) })
      return () => {
        const trigger =
          slots.trigger?.({
            open: open.value,
            openForm: () => setOpen(true),
            closeForm: () => setOpen(false),
          }) ?? (props.trigger as VNodeChild)
        const dialog: Component = kind === 'ModalForm' ? Modal : Drawer
        const options = kind === 'ModalForm' ? props.modalProps : props.drawerProps
        const sourceSubmitter = props.submitter === false ? undefined : props.submitter
        const sourceReset = sourceSubmitter?.resetButtonProps
        const submitter: false | SubmitterProps =
          props.submitter === false
            ? false
            : {
                ...sourceSubmitter,
                searchConfig: {
                  resetText: sourceSubmitter?.resetText ?? t('editableTable.action.cancel', '取消'),
                  ...sourceSubmitter?.searchConfig,
                },
                resetButtonProps:
                  sourceReset === false
                    ? false
                    : {
                        ...sourceReset,
                        disabled: closeLock.locked.value || sourceReset?.disabled,
                        onClick: (event: MouseEvent) => {
                          event.preventDefault()
                          if (closeLock.locked.value) return
                          if (sourceReset?.onClick) sourceReset.onClick(event)
                          else {
                            setOpen(false)
                            if (kind === 'ModalForm') props.modalProps?.onCancel?.(event)
                            else props.drawerProps?.onClose?.(event)
                          }
                        },
                      },
              }
        return [
          trigger &&
            h('span', { class: `${prefix.value}-trigger`, onClick: () => setOpen(true) }, [
              trigger,
            ]),
          h(
            dialog,
            {
              ...options,
              open: open.value,
              title: props.title ?? options?.title,
              width: props.width ?? options?.width,
              footer: null,
              ...(kind === 'ModalForm'
                ? {
                    afterClose: () => {
                      if (
                        !open.value &&
                        (props.modalProps?.destroyOnHidden ?? props.modalProps?.destroyOnClose)
                      )
                        inner.value?.reset()
                      props.modalProps?.afterClose?.()
                    },
                    onCancel: (event: MouseEvent | KeyboardEvent) => {
                      if (closeLock.locked.value) return
                      props.modalProps?.onCancel?.(event)
                      setOpen(false)
                    },
                  }
                : {
                    afterOpenChange: (next: boolean) => {
                      if (
                        !next &&
                        !open.value &&
                        (props.drawerProps?.destroyOnHidden ?? props.drawerProps?.destroyOnClose)
                      )
                        inner.value?.reset()
                      props.drawerProps?.afterOpenChange?.(next)
                    },
                    onClose: (event: MouseEvent | KeyboardEvent) => {
                      if (closeLock.locked.value) return
                      props.drawerProps?.onClose?.(event)
                      setOpen(false)
                    },
                  }),
            },
            {
              ...slots,
              default: () =>
                h(
                  ProForm,
                  {
                    ...attrs,
                    ...pickFormProps(props),
                    layout: props.layout,
                    submitter,
                    ref: inner,
                    onFinish: async (values: import('../schema-form/utils').FormRecord) => {
                      const submittedRevision = revision
                      closeLock.start()
                      try {
                        const result = await props.onFinish?.(values)
                        if (
                          alive &&
                          result === true &&
                          revision === submittedRevision &&
                          open.value
                        )
                          setOpen(false)
                        return result
                      } finally {
                        closeLock.stop()
                      }
                    },
                    'onUpdate:modelValue': (values: unknown) => emit('update:modelValue', values),
                    onChange: (values: unknown) => emit('change', values),
                    onSubmit: (values: unknown) => emit('submit', values),
                    onReset: (values: unknown) => emit('reset', values),
                    onError: (error: unknown) => emit('error', error),
                    onRequestError: (error: unknown) => emit('requestError', error),
                  },
                  slots,
                ),
            },
          ),
        ]
      }
    },
  })
}

export const ModalForm = createDialogForm('ModalForm')
export const DrawerForm = createDialogForm('DrawerForm')

export const QueryFilter = defineComponent({
  name: 'QueryFilter',
  inheritAttrs: false,
  props: {
    ...proFormProps,
    collapsed: { type: Boolean, default: undefined },
    defaultCollapsed: { type: Boolean, default: true },
    defaultColsNumber: { type: Number, default: 3 },
    span: [Number, Object] as PropType<QueryFilterProps['span']>,
    labelWidth: [Number, String] as PropType<QueryFilterProps['labelWidth']>,
    split: Boolean,
    searchText: null,
    resetText: null,
    optionRender: {
      type: [Boolean, Function] as PropType<QueryFilterProps['optionRender']>,
      default: undefined,
    },
    collapseRender: {
      type: [Boolean, Function] as PropType<QueryFilterProps['collapseRender']>,
      default: undefined,
    },
  },
  emits: [
    'update:modelValue',
    'update:collapsed',
    'collapse',
    'reset',
    'submit',
    'change',
    'error',
    'requestError',
  ],
  setup(props, { attrs, slots, emit, expose }) {
    const inner = ref<ProFormInstance>()
    const api = proxyForm(inner)
    const root = ref<HTMLElement>()
    const width = ref(1024)
    const local = ref(props.defaultCollapsed)
    const collapsed = computed(() => props.collapsed ?? local.value)
    const { prefix, t } = useFormPrefix('query-filter', () => props.prefixCls)
    const breakpoint = computed(() =>
      width.value < 576
        ? 'xs'
        : width.value < 768
          ? 'sm'
          : width.value < 992
            ? 'md'
            : width.value < 1200
              ? 'lg'
              : 'xl',
    )
    const span = computed(() =>
      typeof props.span === 'number'
        ? props.span
        : (props.span?.[breakpoint.value] ??
          (width.value < 576 ? 24 : width.value < 768 ? 12 : 24 / props.defaultColsNumber)),
    )
    let observer: ResizeObserver | undefined
    onMounted(() => {
      if (typeof ResizeObserver !== 'undefined' && root.value) {
        observer = new ResizeObserver(([entry]) => {
          if (entry) width.value = entry.contentRect.width || 1024
        })
        observer.observe(root.value)
      }
    })
    onBeforeUnmount(() => observer?.disconnect())
    expose(api)
    function toggle() {
      local.value = !collapsed.value
      emit('update:collapsed', local.value)
      emit('collapse', local.value)
    }
    return () => {
      const semantic = resolveSemantic(props)
      const children = flattenChildren(slots.default?.())
      const visible = Math.max(1, Math.floor(24 / span.value) - 1)
      const shouldCollapse = children.length > visible
      const submitter = props.submitter === false ? undefined : props.submitter
      const defaults: VNodeChild[] = submitter
        ? [
            submitter.resetButtonProps === false
              ? null
              : h(
                  Button,
                  { ...submitter.resetButtonProps, onClick: () => api.reset() },
                  () =>
                    (props.resetText as VNodeChild) ??
                    submitter.searchConfig?.resetText ??
                    submitter.resetText ??
                    t('tableForm.reset', '重置'),
                ),
            submitter.submitButtonProps === false
              ? null
              : h(
                  Button,
                  {
                    type: 'primary',
                    ...submitter.submitButtonProps,
                    htmlType: 'submit',
                    loading: unref(inner.value?.loading) || submitter.submitButtonProps?.loading,
                  },
                  () =>
                    (props.searchText as VNodeChild) ??
                    submitter.searchConfig?.submitText ??
                    submitter.submitText ??
                    t('tableForm.search', '查询'),
                ),
          ].filter(Boolean)
        : []
      const custom =
        props.optionRender === false
          ? null
          : typeof props.optionRender === 'function'
            ? props.optionRender(props, api, defaults)
            : submitter?.render === false
              ? null
              : submitter?.render
                ? submitter.render({ form: api, submit: api.submit, reset: api.reset }, defaults)
                : (slots.submitter?.({
                    form: api,
                    values: api.getFieldsValue(),
                    submit: api.submit,
                    reset: api.reset,
                  }) ?? defaults)
      const collapseButton =
        shouldCollapse && props.collapseRender !== false
          ? h(
              Button,
              {
                type: 'link',
                class: [`${prefix.value}-collapse-button`, semantic.classes.collapseButton],
                style: semantic.styles.collapseButton,
                'aria-expanded': !collapsed.value,
                onClick: toggle,
              },
              () =>
                typeof props.collapseRender === 'function'
                  ? props.collapseRender(collapsed.value)
                  : defaultCollapseRender(
                      collapsed.value,
                      t('tableForm.collapsed', '展开'),
                      t('tableForm.expand', '收起'),
                    ),
            )
          : null
      return h(
        'div',
        {
          ref: root,
          class: [
            `${prefix.value}-container`,
            attrs.class,
            semantic.classes.root,
            { [`${prefix.value}-split`]: props.split },
          ],
          style: [attrs.style, semantic.styles.root],
        },
        [
          h(
            ProForm,
            {
              ...attrs,
              ...pickFormProps(props),
              ref: inner,
              prefixCls: prefix.value,
              layout: 'horizontal',
              submitter: false,
              labelCol:
                props.labelWidth === undefined
                  ? attrs.labelCol
                  : {
                      style: {
                        width:
                          typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : 'auto',
                      },
                    },
              'onUpdate:modelValue': (values: unknown) => emit('update:modelValue', values),
              onReset: (values: unknown) => emit('reset', values),
              onSubmit: (values: unknown) => emit('submit', values),
              onChange: (values: unknown) => emit('change', values),
              onError: (error: unknown) => emit('error', error),
              onRequestError: (error: unknown) => emit('requestError', error),
            },
            {
              ...slots,
              default: () =>
                h(
                  'div',
                  {
                    'data-pro-query-row': '',
                    class: [`${prefix.value}-row`, semantic.classes.row],
                    style: semantic.styles.row,
                  },
                  [
                    ...children.map((child, index) =>
                      h(
                        'div',
                        {
                          key: child.key ?? index,
                          'data-pro-query-col': '',
                          class: [`${prefix.value}-col`, semantic.classes.item],
                          style: [
                            {
                              flex: `0 0 ${(span.value / 24) * 100}%`,
                              maxWidth: `${(span.value / 24) * 100}%`,
                              display: collapsed.value && index >= visible ? 'none' : undefined,
                            },
                            semantic.styles.item,
                          ],
                        },
                        [child],
                      ),
                    ),
                    (custom || collapseButton) &&
                      h(
                        'div',
                        {
                          'data-pro-query-actions': '',
                          class: [`${prefix.value}-actions`, semantic.classes.actions],
                          style: [
                            { marginInlineStart: 'auto', flex: `0 0 ${(span.value / 24) * 100}%` },
                            semantic.styles.actions,
                          ],
                        },
                        [h(Space, null, () => [custom, collapseButton])],
                      ),
                  ],
                ),
            },
          ),
        ],
      )
    }
  },
})

export const LightWrapper = defineComponent({
  name: 'LightWrapper',
  inheritAttrs: false,
  props: {
    name: [String, Number, Array],
    label: null,
    disabled: Boolean,
    placement: { type: String as PropType<PopoverProps['placement']>, default: 'bottomLeft' },
    fieldNames: Array as PropType<ProDataIndex[]>,
    footerRender: {
      type: [Boolean, Function] as PropType<LightFilterProps['footerRender']>,
      default: undefined,
    },
    open: { type: Boolean, default: undefined },
  },
  emits: ['update:open', 'confirm', 'clear'],
  setup(props, { attrs, slots, emit }) {
    const form = useProFormContext()
    const path = useProFormNamePath(() => props.name as import('../types').ProDataIndex | undefined)
    const local = ref(false)
    const { prefix, t } = useFormPrefix('field-light-wrapper', () => undefined)
    const paths = () =>
      props.fieldNames?.map(normalizePath) ?? (props.name === undefined ? [] : [path.value])
    const value = computed(() => {
      if (!props.fieldNames) return form?.getFieldValue(path.value)
      const values: import('../schema-form/utils').FormRecord = {}
      for (const name of paths()) setValue(values, name, form?.getFieldValue(name))
      return values
    })
    const isEffective = (entry: unknown) =>
      entry !== undefined &&
      entry !== null &&
      entry !== '' &&
      (!Array.isArray(entry) || entry.length > 0)
    const effective = computed(() =>
      props.fieldNames
        ? paths().some((name) => isEffective(getValue(value.value, name)))
        : isEffective(value.value),
    )
    const open = computed(() => props.open ?? local.value)
    let snapshot: unknown
    let captured = false
    let revision = 0
    const confirming = ref(false)
    function transition(next: boolean, accepted = false) {
      revision++
      if (next) {
        snapshot = cloneValue(value.value)
        captured = true
      } else {
        if (!accepted && captured) {
          if (props.fieldNames)
            for (const name of paths())
              form?.setFieldValue(name, cloneValue(getValue(snapshot, name)))
          else if (path.value.length) form?.setFieldValue(path.value, cloneValue(snapshot))
        }
        captured = false
        form?.clearValidate?.(paths().length ? paths() : undefined)
      }
      local.value = next
    }
    watch(
      () => props.open,
      (next) => {
        if (next !== undefined && next !== local.value) transition(next)
      },
      { immediate: true, flush: 'sync' },
    )
    function setOpen(next: boolean, accepted = false) {
      if (next === open.value) return
      transition(next, accepted)
      emit('update:open', next)
    }
    async function confirm() {
      if (confirming.value) return
      confirming.value = true
      const submittedRevision = revision
      try {
        await form?.validateFields(paths().length ? paths() : undefined)
        await form?.submit()
        if (revision === submittedRevision) {
          setOpen(false, true)
          emit('confirm', value.value)
        }
      } catch {
        /* errors remain visible in the field */
      } finally {
        confirming.value = false
      }
    }
    function clear() {
      for (const name of paths()) form?.setFieldValue(name, undefined)
      emit('clear')
      void form?.submit().catch(() => undefined)
    }
    return () => {
      const buttons = [
        h(Button, { size: 'small', disabled: confirming.value, onClick: clear }, () =>
          t('form.lightFilter.clear', '清除'),
        ),
        h(
          Button,
          {
            type: 'primary',
            size: 'small',
            loading: confirming.value,
            onClick: () => void confirm(),
          },
          () => t('form.lightFilter.confirm', '确认'),
        ),
      ]
      const footer =
        props.footerRender === false
          ? null
          : typeof props.footerRender === 'function'
            ? props.footerRender({ clear, confirm: () => void confirm() }, buttons)
            : buttons
      const display = slots.label?.({ value: value.value }) ?? (props.label as VNodeChild) ?? ''
      return h(
        Popover,
        {
          ...attrs,
          trigger: 'click',
          placement: props.placement,
          open: open.value,
          'onUpdate:open': (next: boolean) => setOpen(next),
          onOpenChange: (next: boolean) => setOpen(next),
        },
        {
          default: () =>
            h(FieldLabel, {
              disabled: props.disabled || form?.disabled.value,
              label: display,
              value:
                !props.fieldNames && effective.value
                  ? h(ProField, { text: value.value, mode: 'read' })
                  : undefined,
              expanded: open.value,
            }),
          content: () =>
            h('div', { 'data-pro-light-popover': '', class: `${prefix.value}-container` }, [
              slots.default?.(),
              footer &&
                h('div', { 'data-pro-light-footer': '', class: `${prefix.value}-footer` }, [
                  h(Space, null, () => footer),
                ]),
            ]),
        },
      )
    }
  },
})

export const LightFilter = defineComponent({
  name: 'LightFilter',
  inheritAttrs: false,
  props: {
    ...proFormProps,
    collapse: Boolean,
    collapseLabel: null,
    placement: { type: String as PropType<PopoverProps['placement']>, default: 'bottomLeft' },
    footerRender: {
      type: [Boolean, Function] as PropType<LightFilterProps['footerRender']>,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'change', 'reset', 'submit', 'error', 'requestError'],
  setup(props, { attrs, slots, emit, expose }) {
    const inner = ref<ProFormInstance>()
    const api = proxyForm(inner)
    const { prefix, t, config } = useFormPrefix('form-light-filter', () => props.prefixCls)
    expose(api)
    return () => {
      const semantic = resolveSemantic(props)
      const children = flattenChildren(slots.default?.())
      const primary = props.collapse
        ? []
        : children.filter(
            (child) => child.props?.secondary !== true && child.props?.secondary !== '',
          )
      const secondary = props.collapse
        ? children
        : children.filter(
            (child) => child.props?.secondary === true || child.props?.secondary === '',
          )
      const configuredSize = attrs.size ?? config.value.componentSize
      const size =
        configuredSize === 'small' || configuredSize === 'large' ? configuredSize : 'middle'
      function wrap(node: import('vue').VNode, index: number) {
        return h('div', { key: node.key ?? index, class: `${prefix.value}-item` }, [
          h(
            LightWrapper,
            {
              name: node.props?.name,
              label: node.props?.label,
              disabled: node.props?.disabled,
              placement: props.placement,
              footerRender: props.footerRender,
            },
            { default: () => cloneVNode(node, { label: undefined, secondary: undefined }) },
          ),
        ])
      }
      return h(
        ProForm,
        {
          ...attrs,
          ...pickFormProps(props),
          ref: inner,
          prefixCls: prefix.value,
          layout: 'inline',
          submitter: false,
          class: [attrs.class, semantic.classes.root],
          style: [attrs.style, semantic.styles.root],
          'onUpdate:modelValue': (values: unknown) => emit('update:modelValue', values),
          onChange: (values: unknown) => emit('change', values),
          onReset: (values: unknown) => emit('reset', values),
          onSubmit: (values: unknown) => emit('submit', values),
          onError: (error: unknown) => emit('error', error),
          onRequestError: (error: unknown) => emit('requestError', error),
        },
        {
          ...slots,
          default: ({ values }: { values: Record<string, unknown> }) =>
            h(
              'div',
              {
                class: [
                  prefix.value,
                  `${prefix.value}-${size}`,
                  {
                    [`${prefix.value}-effective`]: Object.values(values).some(
                      (value) =>
                        value !== undefined &&
                        value !== null &&
                        value !== '' &&
                        (!Array.isArray(value) || value.length > 0),
                    ),
                  },
                ],
              },
              [
                h(
                  'div',
                  {
                    'data-pro-light-container': '',
                    class: [`${prefix.value}-container`, semantic.classes.container],
                    style: semantic.styles.container,
                  },
                  [
                    ...primary.map(wrap),
                    secondary.length > 0 &&
                      h('div', { class: `${prefix.value}-item` }, [
                        h(
                          LightWrapper,
                          {
                            label:
                              (props.collapseLabel as VNodeChild) ??
                              t('form.lightFilter.more', '更多筛选'),
                            fieldNames: secondary.flatMap((node) =>
                              node.props?.name === undefined
                                ? []
                                : [node.props.name as ProDataIndex],
                            ),
                            placement: props.placement,
                            footerRender: props.footerRender,
                          },
                          {
                            label: () =>
                              (props.collapseLabel as VNodeChild) ??
                              (props.collapse
                                ? h(FilterOutlined, {
                                    class: `${prefix.value}-collapse-icon`,
                                    'aria-label': t('form.lightFilter.more', '更多筛选'),
                                  })
                                : t('form.lightFilter.more', '更多筛选')),
                            default: () =>
                              secondary.map((node, index) =>
                                h(
                                  'div',
                                  { key: node.key ?? index, class: `${prefix.value}-line` },
                                  [cloneVNode(node, { secondary: undefined })],
                                ),
                              ),
                          },
                        ),
                      ]),
                  ],
                ),
              ],
            ),
        },
      )
    }
  },
})

export { proxyForm }
