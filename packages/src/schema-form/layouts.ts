import FormLayout from './layouts/Form.vue'
import EmbedLayout from './layouts/Embed.vue'
import ModalFormLayout from './layouts/ModalForm.vue'
import DrawerFormLayout from './layouts/DrawerForm.vue'
import QueryFilterLayout from './layouts/QueryFilter.vue'
import LightFilterLayout from './layouts/LightFilter.vue'
import StepFormLayout from './layouts/StepForm.vue'
import StepsFormLayout from './layouts/StepsForm.vue'

export const Form = FormLayout
export const Embed = EmbedLayout
export const ModalForm = ModalFormLayout
export const DrawerForm = DrawerFormLayout
export const QueryFilter = QueryFilterLayout
export const LightFilter = LightFilterLayout
export const StepForm = StepFormLayout
export const StepsForm = Object.assign(StepsFormLayout, { StepForm: StepFormLayout })
