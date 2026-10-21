import {
  PRO_FIELD_BUILTIN_VALUE_TYPES,
  resolveProFieldValueType,
  type ProFieldValueTypeInput,
} from './valueType'

let fieldModules: Promise<void> | undefined
/** The Vue build eagerly exports fields. This compatibility preload loads their actual renderer modules. */
export function preloadProFieldValueType(valueType: ProFieldValueTypeInput): Promise<void> {
  const type = resolveProFieldValueType(valueType).type
  if (!(PRO_FIELD_BUILTIN_VALUE_TYPES as readonly string[]).includes(type)) {
    return Promise.reject(
      new RangeError(
        `No built-in ProField loader for "${type}". Register custom fields through ProConfigProvider.valueTypeMap.`,
      ),
    )
  }
  fieldModules ??= Promise.all([
    import('./ProField'),
    import('../pro-form-fields/FieldControl.vue'),
  ]).then(() => undefined)
  return fieldModules
}

export function preloadAllProFieldValueTypes(): Promise<void> {
  return preloadProFieldValueType('text')
}
