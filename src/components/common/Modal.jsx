import { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="pd-modal-backdrop" onMouseDown={onClose}>
      <div
        className="pd-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pd-modal-header">
          <h2 className="h5 fw-bold mb-0">{title}</h2>
          <button type="button" className="pd-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="pd-modal-body">{children}</div>
      </div>
    </div>
  )
}
