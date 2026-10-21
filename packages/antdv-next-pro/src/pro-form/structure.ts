import type { PropType, VNodeChild } from 'vue'
import { Button, FormItem, Space, Tooltip } from 'antdv-next'
import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue'
import { cloneValue, normalizePath, setValue } from '../schema-form/utils'
import type { FormRecord } from '../schema-form/utils'
import type { ProDataIndex } from '../types'
import {
  proFormListContextKey,
  proFormNamePathKey,
  useProFormContext,
  useProFormNamePath,
} from './context'
import type {
  FormListActionType,
  FormListFieldData,
  ProFormDependencyProps,
  ProFormFieldSetProps,
  ProFormListProps,
  SemanticValue,
  FormClasses,
  FormStyles,
} from './types'
import { assignRef, flattenChildren, resolveSemantic, useFormPrefix } from './utils'
import ProField from '../pro-field/ProField'
import type { ProFieldValueTypeInput } from '../pro-field/valueType'
import { useThemeVars } from '../shared/useThemeVars'

const semanticProps = {
  prefixCls: String,
  classes: [Object, Function] as PropType<SemanticValue<FormClasses>>,
  classNames: Object as PropType<FormClasses>,
  styles: [Object, Function] as PropType<SemanticValue<FormStyles>>,
}

export const ProFormGroup = defineComponent({
  name: 'ProFormGroup',
  inheritAttrs: false,
  props: {
    ...semanticProps,
    title: null,
    titleStyle: Object,
    tooltip: null,
    extra: null,
    collapsible: Boolean,
    collapsed: { type: Boolean, default: undefined },
    defaultCollapsed: Boolean,
    direction: { type: String, default: 'horizontal' },
    size: [Number, String],
    labelLayout: String,
  },
  emits: ['update:collapsed', 'collapse'],
  setup(props, { attrs, slots, emit }) {
    const { prefix } = useFormPrefix('form-group', () => props.prefixCls)
    const themeVars = useThemeVars()
    const internal = ref(props.defaultCollapsed)
    const collapsed = computed(() => props.collapsed ?? internal.value)
    function toggle() {
      internal.value = !collapsed.value
      emit('update:collapsed', internal.value)
      emit('collapse', internal.value)
    }
    return () => {
      const semantic = resolveSemantic(props)
      const title = slots.title?.() ?? (props.title as VNodeChild)
      const gap =
        typeof props.size === 'number'
          ? `${props.size}px`
          : props.size === 'small'
            ? '8px'
            : props.size === 'middle'
              ? '16px'
              : props.size === 'large'
                ? 'var(--antdv-next-pro-padding-lg, 24px)'
                : undefined
      return h(
        'div',
        {
          ...attrs,
          'data-pro-form-group': '',
          class: [
            prefix.value,
            attrs.class,
            semantic.classes.root,
            {
              [`${prefix.value}-collapsed`]: collapsed.value,
              [`${prefix.value}-twoLine`]: props.labelLayout === 'twoLine',
            },
          ],
          style: [themeVars.value, attrs.style, semantic.styles.root],
        },
        [
          (title || slots.extra || props.extra || props.collapsible) &&
            h(
              'div',
              {
                'data-pro-form-group-title': '',
                class: [`${prefix.value}-title`, semantic.classes.title],
                style: [props.titleStyle, semantic.styles.title],
              },
              [
                props.collapsible
                  ? h(
                      'button',
                      {
                        type: 'button',
                        'data-pro-form-group-toggle': '',
                        class: `${prefix.value}-collapse-button`,
                        'aria-expanded': !collapsed.value,
                        onClick: toggle,
                      },
                      [collapsed.value ? '› ' : '⌄ ', title],
                    )
                  : title,
                props.tooltip &&
                  h(
                    Tooltip,
                    typeof props.tooltip === 'object' ? props.tooltip : { title: props.tooltip },
                    () => h('span', { tabindex: 0, class: `${prefix.value}-tooltip` }, ' ⓘ'),
                  ),
                h('span', { 'data-pro-form-group-extra': '', class: `${prefix.value}-extra` }, [
                  slots.extra?.() ?? (props.extra as VNodeChild),
                ]),
              ],
            ),
          h(
            'div',
            {
              'data-pro-form-group-content': '',
              'data-pro-form-label-layout': props.labelLayout,
              class: [`${prefix.value}-container`, semantic.classes.container],
              style: [
                {
                  display: collapsed.value ? 'none' : 'flex',
                  flexDirection: props.direction === 'vertical' ? 'column' : 'row',
                  gap,
                  flexWrap: 'wrap',
                },
                semantic.styles.container,
              ],
            },
            slots.default?.(),
          ),
        ],
      )
    }
  },
})

const ListRowScope = defineComponent({
  name: 'ProFormListRow',
  props: {
    path: { type: Array as PropType<Array<string | number>>, required: true },
    index: { type: Number, required: true },
    rowKey: { type: Number, required: true },
  },
  setup(props, { slots }) {
    provide(
      proFormNamePathKey,
      computed(() => [...props.path, props.index]),
    )
    provide(proFormListContextKey, {
      index: computed(() => props.index),
      key: props.rowKey,
      listName: computed(() => props.path),
    })
    return () => slots.default?.()
  },
})

export const ProFormList = defineComponent({
  name: 'ProFormList',
  inheritAttrs: false,
  props: {
    ...semanticProps,
    name: { type: [String, Number, Array] as PropType<ProDataIndex>, required: true },
    label: null,
    initialValue: Array as PropType<FormRecord[]>,
    min: { type: Number, default: 0 },
    max: Number,
    creatorRecord: [Object, Function] as PropType<ProFormListProps['creatorRecord']>,
    creatorButtonProps: {
      type: [Object, Boolean] as PropType<ProFormListProps['creatorButtonProps']>,
      default: undefined,
    },
    copyIconProps: {
      type: [Object, Boolean] as PropType<ProFormListProps['copyIconProps']>,
      default: undefined,
    },
    deleteIconProps: {
      type: [Object, Boolean] as PropType<ProFormListProps['deleteIconProps']>,
      default: undefined,
    },
    actionGuard: Object as PropType<ProFormListProps['actionGuard']>,
    actionRef: [Object, Function] as PropType<ProFormListProps['actionRef']>,
    actionRender: Function as PropType<ProFormListProps['actionRender']>,
    itemRender: Function as PropType<ProFormListProps['itemRender']>,
    rules: [Object, Array] as PropType<ProFormListProps['rules']>,
    alwaysShowItemLabel: { type: Boolean, default: undefined },
  },
  emits: ['afterAdd', 'afterRemove', 'change', 'error'],
  setup(props, { attrs, slots, emit, expose }) {
    const form = useProFormContext()
    if (!form) throw new Error('ProFormList must be used inside ProForm')
    const path = useProFormNamePath(() => props.name)
    const { prefix, t } = useFormPrefix('form-list', () => props.prefixCls)
    const busy = ref(false)
    let sequence = 0
    const keys = ref<number[]>([])
    const list = computed(() => {
      const value = form.getFieldValue(path.value)
      return Array.isArray(value) ? (value as FormRecord[]) : []
    })
    const createRecord = () =>
      cloneValue(
        typeof props.creatorRecord === 'function'
          ? props.creatorRecord()
          : (props.creatorRecord ?? {}),
      )
    if (!Array.isArray(form.getFieldValue(path.value)))
      form.setFieldValue(
        path.value,
        cloneValue(props.initialValue ?? Array.from({ length: props.min }, createRecord)),
      )
    watch(
      () => list.value.length,
      (length) => {
        while (keys.value.length < length) keys.value.push(sequence++)
        keys.value.length = length
      },
      { immediate: true, flush: 'sync' },
    )
    function commit(value: FormRecord[]) {
      form!.setFieldValue(path.value, value)
      emit('change', cloneValue(value))
    }

    async function add(
      defaultValue = createRecord(),
      insertIndex = list.value.length,
    ): Promise<boolean> {
      if (
        busy.value ||
        form!.readonly.value ||
        form!.disabled.value ||
        (props.max !== undefined && list.value.length >= props.max)
      )
        return false
      busy.value = true
      try {
        const index = Math.max(0, Math.min(insertIndex, list.value.length))
        if (
          (await props.actionGuard?.beforeAddRow?.(defaultValue, index, list.value.length)) ===
          false
        )
          return false
        if (props.max !== undefined && list.value.length >= props.max) return false
        const next = cloneValue(list.value)
        next.splice(index, 0, cloneValue(defaultValue))
        keys.value.splice(index, 0, sequence++)
        commit(next)
        emit('afterAdd', cloneValue(defaultValue), index)
        return true
      } catch (error) {
        emit('error', error)
        return false
      } finally {
        busy.value = false
      }
    }

    async function remove(index: number | number[]): Promise<boolean> {
      const indices = [...new Set(Array.isArray(index) ? index : [index])]
        .filter((entry) => entry >= 0 && entry < list.value.length)
        .sort((a, b) => b - a)
      if (
        busy.value ||
        form!.readonly.value ||
        form!.disabled.value ||
        !indices.length ||
        list.value.length - indices.length < props.min
      )
        return false
      busy.value = true
      try {
        if ((await props.actionGuard?.beforeRemoveRow?.(index, list.value.length)) === false)
          return false
        if (list.value.length - indices.length < props.min) return false
        const next = cloneValue(list.value)
        for (const item of indices) {
          next.splice(item, 1)
          keys.value.splice(item, 1)
        }
        commit(next)
        emit('afterRemove', index)
        return true
      } catch (error) {
        emit('error', error)
        return false
      } finally {
        busy.value = false
      }
    }

    const action: FormListActionType = {
      add,
      remove,
      move(from, to) {
        if (
          busy.value ||
          form.readonly.value ||
          form.disabled.value ||
          from < 0 ||
          to < 0 ||
          from >= list.value.length ||
          to >= list.value.length
        )
          return false
        const next = cloneValue(list.value)
        next.splice(to, 0, next.splice(from, 1)[0]!)
        keys.value.splice(to, 0, keys.value.splice(from, 1)[0]!)
        commit(next)
        return true
      },
      copy: (index) =>
        index < 0 || index >= list.value.length
          ? Promise.resolve(false)
          : add(cloneValue(list.value[index]!), index + 1),
      get: (index) => cloneValue(list.value[index]),
      getList: () => cloneValue(list.value),
    }
    expose(action)
    onMounted(() => assignRef(props.actionRef, action))
    onBeforeUnmount(() => assignRef(props.actionRef, undefined))
    return () => {
      const semantic = resolveSemantic(props)
      const creatorConfig =
        props.creatorButtonProps && typeof props.creatorButtonProps === 'object'
          ? props.creatorButtonProps
          : {}
      const { creatorButtonText, position: creatorPosition, ...creatorButtonProps } = creatorConfig
      const creator =
        !form.readonly.value &&
        props.creatorButtonProps !== false &&
        (props.max === undefined || list.value.length < props.max)
          ? h(
              Button,
              {
                block: true,
                type: 'dashed',
                ...creatorButtonProps,
                'data-pro-form-list-creator': '',
                class: `${prefix.value}-creator`,
                disabled: busy.value || form.disabled.value,
                onClick: () => void add(),
              },
              () => creatorButtonText ?? t('editableTable.action.add', '添加一行数据'),
            )
          : null
      const rows = list.value.map((record, index) => {
        const field: FormListFieldData = {
          name: index,
          key: keys.value[index]!,
          fieldKey: keys.value[index]!,
        }
        const defaultActions: VNodeChild[] = [
          !form.readonly.value &&
            props.copyIconProps !== false &&
            h(
              Button,
              {
                type: 'text',
                size: 'small',
                class: [`${prefix.value}-action-icon`, 'action-copy'],
                disabled:
                  busy.value ||
                  form.disabled.value ||
                  (props.max !== undefined && list.value.length >= props.max),
                'aria-label': t('copyThisLine', '复制此项'),
                onClick: () => void action.copy(index),
              },
              () =>
                props.copyIconProps && props.copyIconProps.Icon ? h(props.copyIconProps.Icon) : '⧉',
            ),
          !form.readonly.value &&
            props.deleteIconProps !== false &&
            h(
              Button,
              {
                type: 'text',
                size: 'small',
                class: [`${prefix.value}-action-icon`, 'action-remove'],
                'data-pro-form-list-remove': '',
                disabled: busy.value || form.disabled.value || list.value.length <= props.min,
                'aria-label': t('deleteThisLine', '删除此项'),
                onClick: () => void remove(index),
              },
              () =>
                props.deleteIconProps && props.deleteIconProps.Icon
                  ? h(props.deleteIconProps.Icon)
                  : '−',
            ),
        ].filter(Boolean)
        const content = h(
          ListRowScope,
          { path: path.value, index, rowKey: field.key },
          {
            default: () =>
              slots.default?.({
                field,
                index,
                action,
                fields: list.value.map((_, i) => ({
                  name: i,
                  key: keys.value[i],
                  fieldKey: keys.value[i],
                })),
                record,
                list: list.value,
              }),
          },
        )
        const actions =
          props.actionRender?.(field, action, defaultActions, list.value.length) ?? defaultActions
        return h(
          'div',
          {
            key: field.key,
            'data-pro-form-list-item': '',
            class: [
              `${prefix.value}-item`,
              {
                [`${prefix.value}-item-default`]: props.alwaysShowItemLabel === undefined,
                [`${prefix.value}-item-show-label`]: props.alwaysShowItemLabel,
              },
              semantic.classes.item,
            ],
            style: semantic.styles.item,
          },
          [
            props.itemRender
              ? props.itemRender({ listDom: content, action: actions }, { field, index, record })
              : [
                  h(
                    'div',
                    { 'data-pro-form-list-content': '', class: `${prefix.value}-container` },
                    [content],
                  ),
                  h(
                    Space,
                    { 'data-pro-form-list-actions': '', class: `${prefix.value}-action` },
                    () => actions,
                  ),
                ],
          ],
        )
      })
      return h(
        'div',
        {
          ...attrs,
          'data-pro-form-list': '',
          class: [prefix.value, attrs.class, semantic.classes.root],
          style: [attrs.style, semantic.styles.root],
        },
        [
          h(
            FormItem,
            { name: path.value, label: props.label, rules: props.rules, autoLink: false },
            {
              default: () => [
                creatorPosition === 'top' && creator,
                ...rows,
                creatorPosition !== 'top' && creator,
              ],
            },
          ),
        ],
      )
    }
  },
})

export const ProFormDependency = defineComponent({
  name: 'ProFormDependency',
  props: {
    name: { type: Array as PropType<ProFormDependencyProps['name']>, required: true },
    ignoreFormListField: Boolean,
  },
  setup(props, { slots }) {
    const form = useProFormContext()
    const prefix = inject(
      proFormNamePathKey,
      computed<Array<string | number>>(() => []),
    )
    return () => {
      const values: FormRecord = {}
      for (const name of props.name) {
        const path = normalizePath(name)
        const full = props.ignoreFormListField ? path : [...prefix.value, ...path]
        setValue(values, path, form?.getFieldValue(full))
      }
      return slots.default?.({ ...values, form })
    }
  },
})

export const ProFormFieldSet = defineComponent({
  name: 'ProFormFieldSet',
  inheritAttrs: false,
  props: {
    name: [String, Number, Array] as PropType<ProDataIndex>,
    modelValue: Array as PropType<unknown[]>,
    initialValue: Array as PropType<unknown[]>,
    transform: Function as PropType<ProFormFieldSetProps['transform']>,
    convertValue: Function as PropType<ProFormFieldSetProps['convertValue']>,
    type: { type: String, default: 'space' },
    space: Object,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, slots, emit }) {
    const form = useProFormContext()
    const { prefix } = useFormPrefix('form-field-set', () => undefined)
    const path = useProFormNamePath(() => props.name)
    const local = ref<unknown[]>(props.initialValue ?? [])
    const values = computed(
      () =>
        props.modelValue ??
        (props.name !== undefined ? (form?.getFieldValue(path.value) as unknown[]) : undefined) ??
        local.value,
    )
    if (
      props.name !== undefined &&
      form &&
      form.getFieldValue(path.value) === undefined &&
      props.initialValue
    )
      form.setFieldValue(path.value, cloneValue(props.initialValue))
    watch(
      path,
      (current, _previous, onCleanup) => {
        if (props.name === undefined || !current.length) return
        const registeredPath = [...current]
        const unregister = form?.registerField({
          path: () => registeredPath,
          transform: props.transform
            ? (value, record) => props.transform!(value as unknown[], record)
            : undefined,
          convertValue: props.convertValue,
        })
        onCleanup(() => unregister?.())
      },
      { immediate: true },
    )
    function update(index: number, value: unknown) {
      const next = [...values.value]
      next[index] = value
      local.value = next
      if (props.name !== undefined) form?.setFieldValue(path.value, next)
      emit('update:modelValue', next)
      emit('change', next)
    }
    return () =>
      h(
        FormItem,
        { ...attrs, name: props.name === undefined ? undefined : path.value },
        {
          ...slots,
          default: () =>
            h(
              Space,
              { ...props.space, class: [prefix.value, `${prefix.value}-${props.type}`] },
              () =>
                flattenChildren(slots.default?.()).map((node, index) =>
                  cloneVNode(node, {
                    fieldMode: 'field',
                    name: undefined,
                    modelValue: values.value[index],
                    'onUpdate:modelValue': (value: unknown) => update(index, value),
                  }),
                ),
            ),
        },
      )
  },
})

export const ProFormItem = defineComponent({
  name: 'ProFormItem',
  inheritAttrs: false,
  props: {
    name: [String, Number, Array] as PropType<ProDataIndex>,
    readonly: { type: Boolean, default: undefined },
    valueType: [String, Object] as PropType<ProFieldValueTypeInput>,
  },
  setup(props, { attrs, slots }) {
    const form = useProFormContext()
    const path = useProFormNamePath(() => props.name)
    return () =>
      h(
        FormItem,
        { ...attrs, name: props.name === undefined ? undefined : path.value },
        {
          ...slots,
          default: () => {
            const children = flattenChildren(
              slots.default?.({ value: form?.getFieldValue(path.value), form }),
            )
            if (props.name === undefined || !form) return children
            if (props.readonly ?? form.readonly.value)
              return h(ProField, {
                text: form.getFieldValue(path.value),
                valueType: props.valueType,
                mode: 'read',
              })
            return children.map((node, index) =>
              index > 0
                ? node
                : cloneVNode(node, {
                    value: form.getFieldValue(path.value),
                    'onUpdate:value': (value: unknown) => form.setFieldValue(path.value, value),
                  }),
            )
          },
        },
      )
  },
})
