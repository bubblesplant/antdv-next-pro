import type { ComputedRef, InjectionKey, PropType, ShallowRef, VNodeChild } from 'vue'
import { Button, Space, Steps } from 'antdv-next'
import {
  computed,
  defineComponent,
  Fragment,
  getCurrentInstance,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue'
import ProForm, { proFormProps } from './ProForm'
import { pickFormProps, proxyForm } from './layouts'
import type { FormRecord } from '../schema-form/utils'
import { mergeValues } from '../schema-form/utils'
import type { ProFormFinish, ProFormInstance, StepFormProps, StepsFormProps } from './types'
import { flattenChildren, resolveSemantic, useFormPrefix } from './utils'
import { useThemeVars } from '../shared/useThemeVars'

interface RegisteredStep {
  id: symbol
  name: () => string
  title: () => VNodeChild
  stepProps: () => Record<string, unknown> | undefined
  form: ProFormInstance
  submit: () => Promise<boolean>
}

interface StepsContext {
  current: ComputedRef<number>
  forms: ShallowRef<RegisteredStep[]>
  formProps: () => StepsFormProps['formProps']
  register: (entry: RegisteredStep) => () => void
}

const stepsContextKey: InjectionKey<StepsContext> = Symbol('StepsFormContext')

export const StepForm = defineComponent({
  name: 'StepForm',
  inheritAttrs: false,
  props: {
    ...proFormProps,
    name: String,
    title: null,
    stepProps: Object as PropType<StepFormProps['stepProps']>,
  },
  emits: ['update:modelValue', 'change', 'reset', 'submit', 'error', 'requestError'],
  setup(props, { attrs, slots, emit, expose }) {
    const parent = inject(stepsContextKey, undefined)
    const inner = ref<ProFormInstance>()
    const api = proxyForm(inner)
    const id = Symbol('StepForm')
    const instance = getCurrentInstance()
    const { prefix } = useFormPrefix('steps-form-step', () => props.prefixCls)
    let accepted = true
    const entry: RegisteredStep = {
      id,
      name: () =>
        props.name ?? `step-${parent?.forms.value.findIndex((step) => step.id === id) ?? 0}`,
      title: () => slots.title?.() ?? (props.title as VNodeChild),
      stepProps: () => props.stepProps,
      form: api,
      submit: async () => {
        accepted = props.onFinish === undefined
        await api.submit()
        return accepted
      },
    }
    const unregister = parent?.register(entry)
    onBeforeUnmount(() => unregister?.())
    const active = computed(() => !parent || parent.forms.value[parent.current.value]?.id === id)
    expose(api)
    return () => {
      const parentProps = parent?.formProps() ?? {}
      const explicitProps = instance?.vnode.props ?? {}
      const ownProps = Object.fromEntries(
        Object.entries(pickFormProps(props)).filter(
          ([key, value]) =>
            value !== undefined &&
            (!(key in parentProps) ||
              key in explicitProps ||
              key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) in explicitProps),
        ),
      )
      return h(
        'div',
        {
          class: [prefix.value, { [`${prefix.value}-active`]: active.value }],
          style: { display: active.value ? undefined : 'none' },
          'aria-hidden': !active.value,
        },
        [
          h(
            ProForm,
            {
              ...parentProps,
              ...attrs,
              ...ownProps,
              ref: inner,
              submitter: parent ? false : props.submitter,
              onFinish: async (values: FormRecord) => {
                const result = await props.onFinish?.(values)
                accepted = props.onFinish === undefined || result === true
                return result
              },
              'onUpdate:modelValue': (values: FormRecord) => emit('update:modelValue', values),
              onChange: (values: FormRecord) => emit('change', values),
              onSubmit: (values: FormRecord) => emit('submit', values),
              onReset: (values: FormRecord) => emit('reset', values),
              onError: (error: unknown) => emit('error', error),
              onRequestError: (error: unknown) => emit('requestError', error),
            },
            slots,
          ),
        ],
      )
    }
  },
})

export const StepsForm = defineComponent({
  name: 'StepsForm',
  inheritAttrs: false,
  props: {
    current: { type: Number, default: undefined },
    onFinish: Function as PropType<ProFormFinish>,
    stepsProps: Object as PropType<StepsFormProps['stepsProps']>,
    submitter: {
      type: [Object, Boolean] as PropType<StepsFormProps['submitter']>,
      default: () => ({}),
    },
    formProps: Object as PropType<StepsFormProps['formProps']>,
    formMapRef: Object as PropType<StepsFormProps['formMapRef']>,
    prefixCls: String,
    classes: [Object, Function] as PropType<StepsFormProps['classes']>,
    classNames: Object as PropType<StepsFormProps['classNames']>,
    styles: [Object, Function] as PropType<StepsFormProps['styles']>,
  },
  emits: ['update:current', 'currentChange', 'finish', 'error', 'reset'],
  setup(props, { attrs, slots, emit, expose }) {
    const forms = shallowRef<RegisteredStep[]>([])
    const localCurrent = ref(0)
    const current = computed(() =>
      Math.max(
        0,
        Math.min(props.current ?? localCurrent.value, Math.max(0, forms.value.length - 1)),
      ),
    )
    const loading = ref(false)
    const { prefix, t } = useFormPrefix('steps-form', () => props.prefixCls)
    const themeVars = useThemeVars()
    let pending: Promise<FormRecord> | undefined
    function syncFormMap() {
      if (props.formMapRef)
        props.formMapRef.value = new Map(forms.value.map((step) => [step.name(), step.form]))
    }
    function setCurrent(value: number) {
      const next = Math.max(0, Math.min(value, Math.max(0, forms.value.length - 1)))
      localCurrent.value = next
      emit('update:current', next)
      emit('currentChange', next)
    }
    provide(stepsContextKey, {
      current,
      forms,
      formProps: () => props.formProps,
      register(entry) {
        forms.value = [...forms.value, entry]
        syncFormMap()
        return () => {
          forms.value = forms.value.filter((step) => step.id !== entry.id)
          syncFormMap()
        }
      },
    })
    watch(() => props.formMapRef, syncFormMap)
    watch(() => forms.value.map((step) => step.name()), syncFormMap)
    onMounted(syncFormMap)
    onBeforeUnmount(() => {
      if (props.formMapRef) props.formMapRef.value = new Map()
    })
    const values = () => mergeValues(...forms.value.map((step) => step.form.getFieldsValue()))
    const formattedValues = () =>
      mergeValues(...forms.value.map((step) => step.form.getFieldsFormatValue()))
    async function validateAll(): Promise<FormRecord> {
      for (const [index, step] of forms.value.entries()) {
        try {
          await step.form.validateFields()
        } catch (error) {
          setCurrent(index)
          throw error
        }
      }
      return values()
    }
    function reset() {
      forms.value.forEach((step) => step.form.reset())
      setCurrent(0)
      emit('reset', values())
    }
    async function advance(): Promise<FormRecord> {
      loading.value = true
      try {
        const index = current.value
        const step = forms.value[index]
        if (!step || !(await step.submit())) return formattedValues()
        if (current.value !== index) return formattedValues()
        if (index < forms.value.length - 1) {
          setCurrent(index + 1)
          return formattedValues()
        }
        await validateAll()
        const resultValues = formattedValues()
        const accepted = await props.onFinish?.(resultValues)
        if (!props.onFinish) emit('finish', resultValues)
        if (accepted === true) reset()
        return resultValues
      } catch (error) {
        emit('error', error)
        throw error
      } finally {
        loading.value = false
      }
    }
    function submit(): Promise<FormRecord> {
      if (!pending)
        pending = advance().finally(() => {
          pending = undefined
        })
      return pending
    }
    async function next(): Promise<boolean> {
      const before = current.value
      if (before >= forms.value.length - 1) return false
      await submit()
      return current.value !== before
    }
    const api: ProFormInstance & {
      next: () => Promise<boolean>
      prev: () => void
      formMap: () => Map<string, ProFormInstance>
    } = {
      validate: validateAll,
      validateFields: validateAll,
      validateFieldsReturnFormatValue: async () => {
        await validateAll()
        return formattedValues()
      },
      reset,
      resetFields: reset,
      clearValidate: (names) => forms.value.forEach((step) => step.form.clearValidate(names)),
      getFieldsValue: values,
      getFieldValue: (name) =>
        forms.value
          .map((step) => step.form.getFieldValue(name))
          .find((value) => value !== undefined),
      getFieldsFormatValue: formattedValues,
      getFieldFormatValue: (name) =>
        forms.value
          .map((step) => step.form.getFieldFormatValue(name))
          .find((value) => value !== undefined),
      setFieldsValue: (record) => forms.value.forEach((step) => step.form.setFieldsValue(record)),
      setFieldValue: (name, value) => forms.value[current.value]?.form.setFieldValue(name, value),
      submit,
      loading,
      scrollToField: (name, options) =>
        forms.value[current.value]?.form.scrollToField(name, options),
      next,
      prev: () => setCurrent(current.value - 1),
      formMap: () => new Map(forms.value.map((step) => [step.name(), step.form])),
    }
    expose(api)
    return () => {
      const semantic = resolveSemantic(props)
      const submitter = props.submitter === false ? undefined : props.submitter
      const last = current.value >= forms.value.length - 1
      const defaults: VNodeChild[] = [
        current.value > 0 &&
          submitter?.resetButtonProps !== false &&
          h(
            Button,
            {
              ...submitter?.resetButtonProps,
              disabled:
                loading.value ||
                (submitter?.resetButtonProps && submitter.resetButtonProps.disabled),
              onClick: (event: MouseEvent) => {
                if (submitter?.resetButtonProps) submitter.resetButtonProps.onClick?.(event)
                api.prev()
              },
            },
            () =>
              submitter?.searchConfig?.resetText ??
              submitter?.resetText ??
              t('stepsForm.prev', '上一步'),
          ),
        submitter?.submitButtonProps !== false &&
          h(
            Button,
            {
              type: 'primary',
              ...submitter?.submitButtonProps,
              loading: loading.value,
              onClick: (event: MouseEvent) => {
                if (submitter?.submitButtonProps) submitter.submitButtonProps.onClick?.(event)
                void submit().catch(() => undefined)
              },
            },
            () =>
              last
                ? (submitter?.searchConfig?.submitText ??
                  submitter?.submitText ??
                  t('stepsForm.submit', '提交'))
                : t('stepsForm.next', '下一步'),
          ),
      ].filter(Boolean)
      const actions =
        slots.submitter?.({
          form: api,
          current: current.value,
          submit,
          next,
          prev: api.prev,
          values: values(),
        }) ??
        (submitter?.render === false
          ? null
          : submitter?.render
            ? submitter.render({ form: api, submit, reset }, defaults)
            : defaults)
      return h(
        'div',
        {
          ...attrs,
          class: [prefix.value, attrs.class, semantic.classes.root],
          style: [themeVars.value, attrs.style, semantic.styles.root],
        },
        [
          h('div', { class: `${prefix.value}-steps-container` }, [
            h(Steps, {
              ...props.stepsProps,
              current: current.value,
              items: forms.value.map((step, index) => ({
                ...step.stepProps(),
                key: step.name(),
                title: h(Fragment, null, [step.title() ?? String(index + 1)]),
              })),
              onChange: (index: number) => {
                props.stepsProps?.onChange?.(index)
                if (index < current.value) setCurrent(index)
                else if (index > current.value) void next().catch(() => undefined)
              },
            }),
          ]),
          h(
            'div',
            {
              'data-pro-steps-form-content': '',
              class: [`${prefix.value}-container`, semantic.classes.container],
              style: semantic.styles.container,
            },
            flattenChildren(slots.default?.()),
          ),
          props.submitter !== false &&
            actions &&
            h(
              'div',
              {
                'data-pro-steps-form-submitter': '',
                class: [`${prefix.value}-submitter`, semantic.classes.submitter],
                style: semantic.styles.submitter,
              },
              [h(Space, null, () => actions)],
            ),
        ],
      )
    }
  },
})
