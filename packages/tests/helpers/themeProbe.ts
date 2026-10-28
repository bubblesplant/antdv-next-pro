// Resolves a custom property through the cascade so it can be compared against the
// browser-normalized value returned by getComputedStyle.
export function resolveCssVariableColor(root: HTMLElement, variableName: string) {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${variableName})`
  root.append(probe)
  const color = getComputedStyle(probe).backgroundColor
  probe.remove()
  return color
}
