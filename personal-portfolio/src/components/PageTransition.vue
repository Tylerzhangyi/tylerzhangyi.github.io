<template>
  <div
    v-show="visible"
    class="page-transition"
    :class="{
      'is-primed': phase === 'primed',
      'is-expanding': phase === 'expanding',
      'is-holding': phase === 'holding',
      'is-contracting': phase === 'contracting'
    }"
    aria-hidden="true"
  >
    <div
      class="page-transition__ball"
      :style="{
        left: `${originX}px`,
        top: `${originY}px`,
        '--reveal-scale': revealScale
      }"
    />
  </div>
</template>

<script>
import { pageTransition } from '../utils/pageTransition'

export default {
  name: 'PageTransition',
  computed: {
    phase() {
      return pageTransition.phase
    },
    originX() {
      return pageTransition.originX
    },
    originY() {
      return pageTransition.originY
    },
    revealScale() {
      return pageTransition.revealScale
    },
    visible() {
      return this.phase !== 'idle'
    }
  }
}
</script>
