<script setup>
  const year = new Date().getFullYear()
</script>

<template>
  <VFooter class="bg-transparent d-flex justify-center mt-4 mb-5 px-4 flex-grow-0">
    <VCard
      variant="outlined"
      class="legal-card w-100"
      max-width="1200"
      rounded="lg"
    >
      <VCardText class="d-flex flex-column ga-2 text-center py-3 px-4">
        
        <div class="d-flex flex-wrap align-center justify-center ga-2 text-caption">
          <span class="text-medium-emphasis font-weight-bold">Éditeur</span>
          <span class="text-disabled">·</span>
          <span>Arthur KEUSCH</span>
          <span class="text-disabled">·</span>
          <span>90000 Belfort - France</span>
          <span class="text-disabled">·</span>
          <span>© {{ year }}</span>
        </div>

        <div class="d-flex flex-wrap align-center justify-center ga-2 text-caption">
          <span class="text-medium-emphasis font-weight-bold">Contact</span>
          <span class="text-disabled">·</span>
          <a class="text-white text-decoration-underline" href="mailto:arthur-keusch@orange.fr">
            arthur-keusch@orange.fr
          </a>
        </div>

      </VCardText>
    </VCard>
  </VFooter>
</template>

<style scoped>
  .legal-card {
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.025)) !important;
  }

  a {
    transition: opacity 0.2s ease;
  }
  a:hover {
    opacity: 0.8;
  }
</style>