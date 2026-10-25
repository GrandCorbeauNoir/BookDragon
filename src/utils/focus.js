// Move focus to the page's main region, e.g. after the element that had focus is removed.
export const focusMain = () => document.getElementById('main')?.focus({ preventScroll: true })
