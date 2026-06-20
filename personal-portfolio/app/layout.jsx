import Script from 'next/script'
import { Bricolage_Grotesque, Plus_Jakarta_Sans, JetBrains_Mono, Silkscreen, VT323, ZCOOL_QingKe_HuangYou } from 'next/font/google'
import '@/styles/global.css'
import '@/styles/formstudio.css'
import '@/styles/pixel-theme.css'
import '@/styles/links-drag-lock.css'
import Providers from '@/components/Providers'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap'
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap'
})

const silkscreen = Silkscreen({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel-display',
  display: 'swap'
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel-body',
  display: 'swap'
})

const zcoolPixel = ZCOOL_QingKe_HuangYou({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel-zh',
  display: 'swap'
})

export const metadata = {
  title: "Tyler Zhang's Portfolio",
  description: 'Personal portfolio — design & engineering.',
  icons: {
    icon: '/photos/circuit.svg',
    apple: '/photos/circuit.svg'
  }
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="zh-CN"
      className={`pixel-theme ${bricolage.variable} ${jakarta.variable} ${jetbrainsMono.variable} ${silkscreen.variable} ${vt323.variable} ${zcoolPixel.variable}`}
    >
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-R6DC0Y49B9" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R6DC0Y49B9');
          `}
        </Script>
        <Script
          src="http://110.40.153.38:5555/tracker.js"
          data-site="tyler.yunguhs.com"
          data-endpoint="http://110.40.153.38:5555/collect"
          strategy="lazyOnload"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
