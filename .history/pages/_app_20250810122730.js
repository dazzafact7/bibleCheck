import '../styles/globals.css'
import { AnimatePresence } from 'framer-motion'

export default function MyApp({ Component, pageProps, router }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component {...pageProps} key={router.route} />
    </AnimatePresence>
  )
}
