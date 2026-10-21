import { useEffect, useRef } from 'react'
import { WorkflowIcon, type WorkflowIconHandle } from '@animateicons/react/huge'

/* Ikon workflow di samping judul layanan 03.
 *
 * Sama dengan ServiceBrowserIcon dan ServiceBotIcon: 40 px, warna aksen
 * biru situs, animasi berjalan otomatis tiap 5 detik tanpa hover.
 * isAnimated={false} mematikan handler kursor; prefers-reduced-motion
 * mematikan interval.
 */
export default function ServiceWorkflowIcon() {
  const icon = useRef<WorkflowIconHandle>(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer = 0

    const start = () => {
      window.clearInterval(timer)
      timer = 0
      if (query.matches) return
      timer = window.setInterval(() => icon.current?.startAnimation(), 5000)
    }

    start()
    query.addEventListener('change', start)

    return () => {
      query.removeEventListener('change', start)
      window.clearInterval(timer)
    }
  }, [])

  return (
    <WorkflowIcon
      ref={icon}
      size={40}
      duration={1}
      color="var(--electric)"
      isAnimated={false}
      aria-hidden="true"
      className="service-workflow-icon"
    />
  )
}
