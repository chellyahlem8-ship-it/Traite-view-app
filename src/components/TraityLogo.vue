<template>
  <div class="traity-logo">
    <svg :width="size" :height="size" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="7"  r="5.5" fill="#f0abfc"/>
      <circle cx="45" cy="14" r="5"   fill="#e879f9"/>
      <circle cx="52" cy="29" r="4.5" fill="#d946ef"/>
      <circle cx="47" cy="45" r="5.5" fill="#a855f7"/>
      <circle cx="31" cy="53" r="6"   fill="#9333ea"/>
      <circle cx="15" cy="47" r="6.5" fill="#7e22ce"/>
      <circle cx="8"  cy="31" r="6"   fill="#6b21a8"/>
      <circle cx="14" cy="14" r="5.5" fill="#9333ea"/>
    </svg>
    <span v-if="showText" class="traity-name">TRAITY</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number; showText?: boolean }>(), {
  size: 40,
  showText: true,
})
</script>

<style scoped lang="scss">
.traity-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.traity-name {
  font-size: 26px;
  font-weight: 700;
  color: #6B21A8;
  letter-spacing: 2px;
  font-family: 'Outfit', sans-serif;
}
</style>