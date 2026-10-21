import { useEffect, useRef } from 'react'
import { BrowserIcon, type BrowserIconHandle } from '@animateicons/react/huge'

/* Ikon browser di samping judul layanan 01.
 *
 * Animasinya tidak dipicu kursor: isAnimated={false} mematikan handler
 * enter/leave milik ikon, lalu interval 5 detik memanggil startAnimation()
 * lewat ref. Ritmenya sama dengan lambaian tangan di section tentang, jadi
 * pengunjung tetap melihat gerak tanpa harus menyentuh ikon.
 *
 * prefers-reduced-motion: reduce mematikan interval; ikon berhenti pada
 * frame diam.
 */
export default function ServiceBrowserIcon() {
  const icon = useRef<BrowserIconHandle>(null)

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
    <BrowserIcon
      ref={icon}
      size={40}
      duration={1}
      color="var(--electric)"
      isAnimated={false}
      aria-hidden="true"
      className="service-browser-icon"
    />
  )
}
