<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { Drawer } from 'antdv-next'
import { computed, onBeforeUnmount, ref, watch, useAttrs, useSlots } from 'vue'
import ProForm from './ProForm'
import type { ProFormInstance, SubmitterProps } from './types'
import { useFormPrefix } from './utils'
import { useOverlaySubmitLock } from './useOverlaySubmitLock'
import { provideOverlayFormFooter } from './useOverlayFormFooter'

import VNodeContent from '../shared/VNodeContent'
import { pickFormProps, proxyForm } from './layoutHelpers'
import { drawerFormProps } from './componentProps'

defineOptions({ name: 'DrawerForm', inheritAttrs: false })

const {
  name: propName,
  modelValue: propModelValue,
  initialValues: propInitialValues,
  onFinish: propOnFinish,
  onValuesChange: propOnValuesChange,
  request: propRequest,
  params: propParams,
  readonly: propReadonly,
  disabled: propDisabled,
  submitter: propSubmitter,
  syncToUrl: propSyncToUrl,
  syncToInitialValues: propSyncToInitialValues,
  dateFormatter: propDateFormatter,
  prefixCls: propPrefixCls,
  classes: propClasses,
  classNames: propClassNames,
  styles: propStyles,
  formRef: propFormRef,
  layout: propLayout,
  open: propOpen,
  title: propTitle,
  width: propWidth,
  trigger: propTrigger,
  modalProps: propModalProps,
  drawerProps: propDrawerProps,
  submitTimeout: propSubmitTimeout,
} = defineProps(drawerFormProps)

const emit = defineEmits([
  'update:open',
  'update:modelValue',
  'openChange',
  'reset',
  'error',
  'requestError',
  'submit',
  'change',
])

const kind = 'DrawerForm' as 'ModalForm' | 'DrawerForm'

const attrs = useAttrs()
const slots = useSlots()
const props = {
  get name() {
    return propName
  },
  get modelValue() {
    return propModelValue
  },
  get initialValues() {
    return propInitialValues
  },
  get onFinish() {
    return propOnFinish
  },
  get onValuesChange() {
    return propOnValuesChange
  },
  get request() {
    return propRequest
  },
  get params() {
    return propParams
  },
  get readonly() {
    return propReadonly
  },
  get disabled() {
    return propDisabled
  },
  get submitter() {
    return propSubmitter
  },
  get syncToUrl() {
    return propSyncToUrl
  },
  get syncToInitialValues() {
    return propSyncToInitialValues
  },
  get dateFormatter() {
    return propDateFormatter
  },
  get prefixCls() {
    return propPrefixCls
  },
  get classes() {
    return propClasses
  },
  get classNames() {
    return propClassNames
  },
  get styles() {
    return propStyles
  },
  get formRef() {
    return propFormRef
  },
  get layout() {
    return propLayout
  },
  get open() {
    return propOpen
  },
  get title() {
    return propTitle
  },
  get width() {
    return propWidth
  },
  get trigger() {
    return propTrigger
  },
  get modalProps() {
    return propModalProps
  },
  get drawerProps() {
    return propDrawerProps
  },
  get submitTimeout() {
    return propSubmitTimeout
  },
}

const inner = ref<ProFormInstance>()
const api = proxyForm(inner)
const local = ref(false)
const { prefix, t, config } = useFormPrefix('form', () => propPrefixCls)
const closeLock = useOverlaySubmitLock(() => propSubmitTimeout)
const open = computed(() => propOpen ?? local.value)
const footer = provideOverlayFormFooter(computed(() => propSubmitter !== false && !slots.footer))
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
defineExpose({ ...api, open: () => setOpen(true), close: () => setOpen(false) })
const dialog = Drawer
const options = computed(() => propDrawerProps)
function resolveTrigger() {
  return (
    slots.trigger?.({
      open: open.value,
      openForm: () => setOpen(true),
      closeForm: () => setOpen(false),
    }) ?? (propTrigger as VNodeChild)
  )
}
function resolveSubmitter() {
  const sourceSubmitter = propSubmitter === false ? undefined : propSubmitter
  const sourceReset = sourceSubmitter?.resetButtonProps
  const okText = propModalProps?.okText ?? config.value.locale?.Modal?.okText
  const submitter: false | SubmitterProps =
    propSubmitter === false || slots.footer
      ? false
      : {
          ...sourceSubmitter,
          searchConfig: {
            submitText:
              sourceSubmitter?.submitText ??
              (kind === 'ModalForm'
                ? ((typeof okText === 'function' ? okText() : okText) ??
                  t('form.lightFilter.confirm', '确认'))
                : t('tableForm.submit', '提交')),
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
                      if (kind === 'ModalForm') propModalProps?.onCancel?.(event)
                      else propDrawerProps?.onClose?.(event)
                    }
                  },
                },
        }
  return submitter
}
function dialogBindings() {
  return {
    ...options.value,
    ...(kind === 'ModalForm'
      ? {
          afterClose: () => {
            if (!open.value && (propModalProps?.destroyOnHidden ?? propModalProps?.destroyOnClose))
              inner.value?.reset()
            propModalProps?.afterClose?.()
          },
          onCancel: (event: MouseEvent | KeyboardEvent) => {
            if (closeLock.locked.value) return
            propModalProps?.onCancel?.(event)
            setOpen(false)
          },
        }
      : {
          afterOpenChange: (next: boolean) => {
            if (
              !next &&
              !open.value &&
              (propDrawerProps?.destroyOnHidden ?? propDrawerProps?.destroyOnClose)
            )
              inner.value?.reset()
            propDrawerProps?.afterOpenChange?.(next)
          },
          onClose: (event: MouseEvent | KeyboardEvent) => {
            if (closeLock.locked.value) return
            propDrawerProps?.onClose?.(event)
            setOpen(false)
          },
        }),
  }
}
async function finish(values: import('../schema-form/utils').FormRecord) {
  const submittedRevision = revision
  closeLock.start()
  try {
    const result = await propOnFinish?.(values)
    if (alive && result === true && revision === submittedRevision && open.value) setOpen(false)
    return result
  } finally {
    closeLock.stop()
  }
}
</script>

<template>
  <template v-for="(trigger, index) in [resolveTrigger()]" :key="index">
    <span v-if="trigger" :class="`${prefix}-trigger`" @click="setOpen(true)"
      ><VNodeContent :content="trigger"
    /></span>
  </template>
  <component
    :is="dialog"
    v-bind="dialogBindings()"
    :open="open"
    :title="propTitle ?? options?.title"
    :width="options?.width ?? propWidth ?? 800"
    :footer="footer.enabled.value || slots.footer ? undefined : null"
  >
    <template
      v-for="name in Object.keys(slots).filter((name) => name !== 'default' && name !== 'footer')"
      #[name]="slotProps"
    >
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
    <template v-if="slots.footer || footer.enabled.value" #footer>
      <slot name="footer">
        <div
          :ref="footer.target"
          data-pro-overlay-footer=""
          :style="{ display: 'flex', justifyContent: 'flex-end' }"
        />
      </slot>
    </template>
    <ProForm
      v-bind="{ ...attrs, ...pickFormProps(props) }"
      ref="inner"
      :layout="propLayout"
      :submitter="resolveSubmitter()"
      :on-finish="finish"
      @update:model-value="emit('update:modelValue', $event)"
      @change="emit('change', $event)"
      @submit="emit('submit', $event)"
      @reset="emit('reset', $event)"
      @error="emit('error', $event)"
      @request-error="emit('requestError', $event)"
    >
      <template v-for="(_, name) in slots" #[name]="slotProps"
        ><slot :name="name" v-bind="slotProps || {}"
      /></template>
    </ProForm>
  </component>
</template>
