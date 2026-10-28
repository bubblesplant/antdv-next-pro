import { DownOutlined } from '@antdv-next/icons'
import { Fragment, h, type VNodeChild } from 'vue'

/** 与 ProComponents QueryFilter/Actions 一致，复用同一个图标，仅旋转方向。 */
export function defaultCollapseRender(
  collapsed: boolean,
  expand: VNodeChild,
  collapse: VNodeChild,
) {
  return h(Fragment, null, [
    collapsed ? expand : collapse,
    h(DownOutlined, {
      style: {
        marginInlineStart: '0.5em',
        transition: '0.3s all',
        transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
      },
    }),
  ])
}
