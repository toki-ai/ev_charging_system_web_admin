// Toast notification utility
const createToast = (message, type = 'success', duration = 5000) => {
  const toast = document.createElement('div')

  const baseClasses =
    'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform'

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  }

  toast.className = `${baseClasses} ${typeClasses[type] || typeClasses.success}`
  toast.textContent = message

  // Animation
  toast.style.opacity = '0'
  toast.style.transform = 'translateX(100%)'

  document.body.appendChild(toast)

  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  }, 100)

  // Remove toast after duration
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, duration)
}

// Export toast with helper methods
export const showToast = {
  success: (message, duration) => createToast(message, 'success', duration),
  error: (message, duration) => createToast(message, 'error', duration),
  warning: (message, duration) => createToast(message, 'warning', duration),
  info: (message, duration) => createToast(message, 'info', duration),
}

// Also export default function for backward compatibility
// Usage: showToast(message, type) or showToast.success(message)
export default function toast(message, type = 'success', duration = 5000) {
  return createToast(message, type, duration)
}
