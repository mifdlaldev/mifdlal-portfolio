import { useEffect, useRef } from 'react'
import { BotIcon, type BotIconHandle } from '@animateicons/react/lucide'

/* Ikon bot di samping judul layanan chatbot.
 *
 * Ukuran, warna, dan ritme gerak disamakan dengan ikon browser pada layanan
 * 01: 32 px, aksen biru situs, animasi dipicu interval 5 detik. isAnimated
 * dimatikan supaya kursor tidak pernah memicu gerak; prefers-reduced-motion
 * mematikan interval sepenuhnya.
 */
export default function ServiceBotIcon() {
  const icon = useRef<BotIconHandle>(null)

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
    <BotIcon
      ref={icon}
      size={40}
      duration={1}
      color="var(--electric)"
      isAnimated={false}
      aria-hidden="true"
      className="service-bot-icon"
    />
  )
}
