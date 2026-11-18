import ProCardBase from '../ProCard.vue'
import ProCardGroup from './ProCardGroup.vue'
import ProCardDivider from './ProCardDivider.vue'
import ProCardTabPane from './ProCardTabPane.vue'

export { ProCardGroup, ProCardDivider, ProCardTabPane }

export const ProCard = Object.assign(ProCardBase, {
  isProCard: true as const,
  Group: ProCardGroup,
  Divider: ProCardDivider,
  TabPane: ProCardTabPane,
})
export default ProCard
