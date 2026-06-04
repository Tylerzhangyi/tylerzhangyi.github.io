<template>
  <div class="card-cta" aria-hidden="true">
    <div class="card-cta__scale">
      <span class="card-cta__pill">{{ label }}</span>
      <span class="card-cta__arrow" v-html="arrowSvg" />
    </div>
  </div>
</template>

<script>
import { CTA_ARROW_SVG } from '../utils/cardCta.js'

export default {
  name: 'CardCta',
  props: {
    label: {
      type: String,
      default: 'View'
    }
  },
  data() {
    return {
      arrowSvg: CTA_ARROW_SVG
    }
  }
}
</script>
