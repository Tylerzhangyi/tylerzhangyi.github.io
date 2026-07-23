'use client'

import { CTA_ARROW_SVG } from '@/lib/cardCta'

export default function CardCta({ label = 'View' }) {
  return (
    <div className="card-cta" aria-hidden="true" data-motion="magnetic">
      <div className="card-cta__scale">
        <span className="card-cta__pill">{label}</span>
        <span className="card-cta__arrow" dangerouslySetInnerHTML={{ __html: CTA_ARROW_SVG }} />
      </div>
    </div>
  )
}
