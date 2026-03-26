let toastRef = null

export const setToastRef = (ref) => {
  toastRef = ref
}

export const showToast = ({ title, type = 'success', duration = 2000 }) => {
  if (toastRef) {
    toastRef.show({ message: title, type, duration })
  } else {
    // fallback to uni.showToast
    uni.showToast({ title, icon: type === 'success' ? 'success' : 'none', duration })
  }
}

export const toast = {
  success(title, duration) { showToast({ title, type: 'success', duration }) },
  error(title, duration) { showToast({ title, type: 'error', duration }) },
  warning(title, duration) { showToast({ title, type: 'warning', duration }) },
  info(title, duration) { showToast({ title, type: 'info', duration }) }
}
