type FocusableInputRef = React.RefObject<unknown>;

export function focusInputRef(ref: FocusableInputRef) {
  const target = ref.current;
  if (
    target != null &&
    typeof target === 'object' &&
    'focus' in target &&
    typeof target.focus === 'function'
  ) {
    target.focus();
  }
}
