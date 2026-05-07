<script setup>
  import Vizualizer from "@/components/Vizualizer.vue"
  import Footer from "@/components/Footer.vue"
</script>

<template>
  <VApp>
    <VMain class="d-flex flex-column align-center h-100">
      <Vizualizer class="flex-grow-1" />
      <Footer />
    </VMain>
  </VApp>
</template>

<style scoped>
</style>
