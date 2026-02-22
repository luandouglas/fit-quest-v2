export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay = 250,
) {
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args: TArgs) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}
