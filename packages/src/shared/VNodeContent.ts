import type { FunctionalComponent, VNodeChild } from 'vue'

// Compatibility boundary for public render callbacks that return existing VNodes or VNode arrays.
// Templates cannot insert arbitrary VNodeChild data directly. Keep this VDOM-only bridge separate
// from template views so future Vapor interop can be evaluated at this boundary.
const VNodeContent: FunctionalComponent<{ content: VNodeChild }> = ({ content }) => content
VNodeContent.inheritAttrs = false

export default VNodeContent
