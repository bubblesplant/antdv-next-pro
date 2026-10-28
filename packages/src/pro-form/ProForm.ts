import type { FormInstance, FormProps } from 'antdv-next'
import type { PropType } from 'vue'
import { Button, Form, Space, Spin } from 'antdv-next'
import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue'
import type { ProDataIndex } from '../types'
import {
  cloneValue,
  getValue,
  mergeValues,
  normalizePath,
  recordsEqual,
  replaceRecord,
  setValue,
} from '../schema-form/utils'
import type { FormRecord } from '../schema-form/utils'
import { useThemeVars } from '../shared/useThemeVars'
import { proFormContextKey } from './context'
import { formProviderKey } from './hooks'
import type { RegisteredFormField } from './context'
import type {
  FormClasses,
  FormStyles,
  ProFormFinish,
  ProFormInstance,
  ProFormProps,
  SemanticValue,
  SubmitterProps,
} from './types'
import {
  assignRef,
  deletePath,
  formatDates,
  logicalRootStyle,
  resolveSemantic,
  useFormPrefix,
} from './utils'

export const proFormProps = {
  name: String,
  modelValue: Object as PropType<FormRecord>,
  initialValues: Object as PropType<FormRecord>,
  onFinish: Function as PropType<ProFormFinish>,
  onValuesChange: Function as PropType<(changed: FormRecord, values: FormRecord) => void>,
  request: Function as PropType<(params?: FormRecord) => Promise<FormRecord>>,
  params: Object as PropType<FormRecord>,
  readonly: Boolean,
  disabled: { type: Boolean, default: undefined },
  submitter: { type: [Object, Boolean] as PropType<false | SubmitterProps>, default: () => ({}) },
  syncToUrl: [Boolean, Function] as PropType<ProFormProps['syncToUrl']>,
  syncToInitialValues: { type: Boolean, default: true },
  dateFormatter: {
    type: [String, Boolean, Function] as PropType<ProFormProps['dateFormatter']>,
    default: 'string',
  },
  prefixCls: String,
  classes: [Object, Function] as PropType<SemanticValue<FormClasses, ProFormProps>>,
  classNames: Object as PropType<FormClasses>,
  styles: [Object, Function] as PropType<SemanticValue<FormStyles, ProFormProps>>,
  formRef: [Object, Function] as PropType<ProFormProps['formRef']>,
  layout: { type: String as PropType<FormProps['layout']>, default: 'vertical' },
}

export default defineComponent({
  name: 'ProForm',
  inheritAttrs: false,
  props: proFormProps,
  emits: ['update:modelValue', 'change', 'reset', 'submit', 'error', 'requestError'],
  setup(props, { slots, attrs, emit, expose }) {
    const model = reactive<FormRecord>({})
    const initial = ref<FormRecord>({})
    const formRef = ref<FormInstance>()
    const loading = ref(false)
    const requesting = ref(false)
    const fields = new Set<RegisteredFormField>()
    const provider = inject(formProviderKey, undefined)
    const { prefix, direction, config, t } = useFormPrefix('form', () => props.prefixCls)
    const themeVars = useThemeVars()
    let requestSequence = 0
    let submission: Promise<FormRecord> | undefined
    let alive = true
    let initialized = false
    const ownedUrlKeys = new Set<string>()
    const hydratedUrlPaths = new Set<string>()

    function readUrl(base: FormRecord = model): FormRecord {
      if (!props.syncToUrl || typeof window === 'undefined') return {}
      const values: FormRecord = {}
      for (const [key, value] of new URLSearchParams(window.location.search)) {
        const path = key.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part))
        try {
          setValue(values, path, JSON.parse(value))
        } catch {
          setValue(values, path, value)
        }
      }
      const incoming =
        typeof props.syncToUrl === 'function' ? props.syncToUrl(values, 'get') : values
      const result: FormRecord = {}
      const paths = [...fields].map((field) => field.path())
      const visit = (record: FormRecord, parent: Array<string | number> = []) => {
        for (const [key, value] of Object.entries(record)) {
          const path = [...parent, key]
          if (value && Object.getPrototypeOf(value) === Object.prototype)
            visit(value as FormRecord, path)
          else paths.push(path)
        }
      }
      visit(base)
      for (const path of paths) {
        const value = getValue(incoming, path)
        if (value !== undefined) {
          setValue(result, path, value)
          ownedUrlKeys.add(path.join('.'))
        }
      }
      return result
    }

    function convert(values: FormRecord): FormRecord {
      const output = cloneValue(values)
      for (const field of fields) {
        const path = field.path()
        const value = getValue(output, path)
        if (value !== undefined && field.convertValue)
          setValue(output, path, field.convertValue(value, output))
      }
      return output
    }

    async function initialize() {
      const sequence = ++requestSequence
      requesting.value = Boolean(props.request)
      try {
        const requested = props.request ? await props.request(props.params) : {}
        if (!alive || sequence !== requestSequence) return
        const base = mergeValues(props.initialValues, requested, props.modelValue)
        const urlValues = props.syncToInitialValues ? readUrl(base) : {}
        replaceRecord(
          model,
          convert(mergeValues(props.initialValues, requested, urlValues, props.modelValue)),
        )
        initial.value = cloneValue(model)
        initialized = true
        hydratedUrlPaths.clear()
        for (const field of fields) hydratedUrlPaths.add(field.path().join('.'))
      } catch (error) {
        if (!alive || sequence !== requestSequence) return
        emit('requestError', error)
        replaceRecord(model, convert(mergeValues(props.initialValues, props.modelValue)))
        initial.value = cloneValue(model)
      } finally {
        if (sequence === requestSequence) requesting.value = false
      }
    }

    watch(
      () => [props.request, cloneValue(props.params), cloneValue(props.initialValues)] as const,
      (next, previous) => {
        if (
          !previous ||
          next[0] !== previous[0] ||
          !recordsEqual(next[1], previous[1]) ||
          !recordsEqual(next[2], previous[2])
        )
          void initialize()
      },
      { immediate: true, deep: true },
    )
    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined && !recordsEqual(value, model)) replaceRecord(model, convert(value))
      },
      { deep: true },
    )

    function writeUrl(values: FormRecord) {
      if (!props.syncToUrl || typeof window === 'undefined') return
      const data =
        typeof props.syncToUrl === 'function' ? props.syncToUrl(cloneValue(values), 'set') : values
      const url = new URL(window.location.href)
      const nextKeys = new Set<string>()
      const visit = (record: FormRecord, path: string[] = []) => {
        for (const [key, value] of Object.entries(record)) {
          const parts = [...path, key]
          if (value && Object.getPrototypeOf(value) === Object.prototype)
            visit(value as FormRecord, parts)
          else {
            const name = parts.join('.')
            nextKeys.add(name)
            if (value === undefined || value === null || value === '') url.searchParams.delete(name)
            else url.searchParams.set(name, JSON.stringify(value))
          }
        }
      }
      visit(data)
      for (const key of ownedUrlKeys) if (!nextKeys.has(key)) url.searchParams.delete(key)
      ownedUrlKeys.clear()
      for (const key of nextKeys) ownedUrlKeys.add(key)
      window.history.replaceState(window.history.state, '', url)
    }

    function notify(changed: FormRecord, syncUrl = true) {
      const values = cloneValue(model)
      emit('update:modelValue', values)
      emit('change', values)
      props.onValuesChange?.(cloneValue(changed), values)
      if (props.name) provider?.change(props.name, cloneValue(changed))
      if (syncUrl) writeUrl(values)
    }

    function setFieldValue(name: ProDataIndex, value: unknown) {
      const path = normalizePath(name)
      setValue(model, path, value)
      const changed: FormRecord = {}
      setValue(changed, path, cloneValue(value))
      notify(changed)
    }

    function setFieldsValue(values: FormRecord) {
      const converted = convert(values)
      replaceRecord(model, mergeValues(model, converted))
      notify(converted)
    }

    function getFieldsFormatValue(): FormRecord {
      const output = cloneValue(model)
      for (const field of fields) {
        const path = field.path()
        const value = formatDates(getValue(model, path), props.dateFormatter, field.valueType?.())
        if (field.transform) {
          const transformed = field.transform(value, cloneValue(model))
          if (transformed && Object.getPrototypeOf(transformed) === Object.prototype) {
            deletePath(output, path)
            Object.assign(output, mergeValues(output, transformed))
          } else setValue(output, path, transformed)
        } else if (value !== undefined) setValue(output, path, value)
      }
      return output
    }

    async function validateFields(names?: ProDataIndex[]): Promise<FormRecord> {
      await formRef.value?.validateFields(names)
      return cloneValue(model)
    }

    function reset() {
      replaceRecord(model, initial.value)
      formRef.value?.clearValidate()
      notify(cloneValue(model))
      emit('reset', cloneValue(model))
    }

    async function performSubmit(): Promise<FormRecord> {
      loading.value = true
      try {
        await validateFields()
        const values = getFieldsFormatValue()
        emit('submit', values)
        if (props.name) provider?.finish(props.name, values)
        await props.onFinish?.(values)
        return values
      } catch (error) {
        emit('error', error)
        throw error
      } finally {
        if (alive) loading.value = false
      }
    }

    function submit(): Promise<FormRecord> {
      if (submission) return submission
      submission = performSubmit().finally(() => {
        submission = undefined
      })
      return submission
    }

    const api: ProFormInstance = {
      get nativeForm() {
        return formRef.value
      },
      validate: validateFields,
      validateFields,
      validateFieldsReturnFormatValue: async (names) => {
        await validateFields(names)
        return getFieldsFormatValue()
      },
      reset,
      resetFields: reset,
      clearValidate: (names) => formRef.value?.clearValidate(names),
      getFieldsValue: () => cloneValue(model),
      getFieldValue: (name) => getValue(model, normalizePath(name)),
      getFieldsFormatValue,
      getFieldFormatValue: (name) => getValue(getFieldsFormatValue(), normalizePath(name)),
      setFieldsValue,
      setFieldValue,
      submit,
      scrollToField: (name, options) => formRef.value?.scrollToField(name, options),
      loading,
    }

    provide(proFormContextKey, {
      model,
      readonly: computed(() => props.readonly),
      disabled: computed(() => props.disabled ?? config.value.componentDisabled ?? false),
      ...api,
      registerField(field) {
        fields.add(field)
        const path = field.path()
        if (initialized && props.syncToInitialValues && !hydratedUrlPaths.has(path.join('.'))) {
          hydratedUrlPaths.add(path.join('.'))
          const urlValue = getValue(readUrl(), path)
          if (urlValue !== undefined && getValue(props.modelValue, path) === undefined) {
            setValue(model, path, urlValue)
            setValue(initial.value, path, cloneValue(urlValue))
          }
        }
        const value = getValue(model, path)
        if (value !== undefined && field.convertValue) {
          setValue(model, path, field.convertValue(value, model))
          if (getValue(initial.value, path) !== undefined)
            setValue(initial.value, path, cloneValue(getValue(model, path)))
        }
        return () => {
          fields.delete(field)
          if (field.preserve === false) deletePath(model, path)
        }
      },
    })
    expose(api)
    watch(
      () => props.name,
      (name, _previous, onCleanup) => {
        if (name) {
          const unregister = provider?.register(name, api)
          onCleanup(() => unregister?.())
        }
      },
      { immediate: true },
    )
    onMounted(() => assignRef(props.formRef, api))
    onBeforeUnmount(() => {
      alive = false
      requestSequence++
      assignRef(props.formRef, undefined)
    })
    function hydrate() {
      if (!props.syncToUrl) return
      const incoming = readUrl()
      const next = cloneValue(model)
      const changed: FormRecord = {}
      for (const key of ownedUrlKeys) {
        const path = key.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part))
        const value = getValue(incoming, path)
        if (!recordsEqual(getValue(next, path), value)) setValue(changed, path, cloneValue(value))
        if (value === undefined) deletePath(next, path)
      }
      const converted = convert(incoming)
      replaceRecord(model, mergeValues(next, converted))
      if (Object.keys(changed).length) notify(mergeValues(changed, converted), false)
    }
    onMounted(() => window.addEventListener('popstate', hydrate))
    onBeforeUnmount(() => window.removeEventListener('popstate', hydrate))

    return () => {
      const semantic = resolveSemantic(props)
      const submitter = props.submitter === false ? undefined : props.submitter
      const defaults = submitter
        ? [
            submitter.resetButtonProps === false
              ? null
              : h(
                  Button,
                  {
                    ...submitter.resetButtonProps,
                    onClick: (event: MouseEvent) => {
                      if (submitter.resetButtonProps) submitter.resetButtonProps.onClick?.(event)
                      if (!event.defaultPrevented) reset()
                    },
                  },
                  () =>
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
                    loading: loading.value || submitter.submitButtonProps?.loading,
                  },
                  () =>
                    submitter.searchConfig?.submitText ??
                    submitter.submitText ??
                    t('tableForm.submit', '提交'),
                ),
          ].filter(Boolean)
        : []
      const actions = submitter
        ? (slots.submitter?.({
            form: api,
            values: model,
            submit,
            reset,
            submitting: loading.value,
          }) ??
          (submitter.render === false
            ? null
            : submitter.render
              ? submitter.render({ form: api, submit, reset }, defaults)
              : defaults))
        : null
      return h(
        Form,
        {
          ...attrs,
          ref: formRef,
          model,
          name: props.name,
          'data-pro-form': '',
          layout: props.layout,
          disabled: props.disabled,
          class: [
            prefix.value,
            { [`${prefix.value}-rtl`]: direction.value === 'rtl' },
            attrs.class,
            semantic.classes.root,
            semantic.classes.form,
          ],
          style: [
            themeVars.value,
            logicalRootStyle(direction.value),
            attrs.style,
            semantic.styles.root,
            semantic.styles.form,
          ],
          onFinish: () => {
            void submit().catch(() => undefined)
          },
        },
        {
          ...slots,
          default: () => [
            h(
              Spin,
              { spinning: requesting.value },
              { default: () => slots.default?.({ values: model, form: api }) },
            ),
            actions &&
              h(
                'div',
                {
                  'data-pro-form-submitter': '',
                  class: [`${prefix.value}-submitter`, semantic.classes.submitter],
                  style: semantic.styles.submitter,
                },
                [h(Space, null, () => actions)],
              ),
          ],
        },
      )
    }
  },
})
