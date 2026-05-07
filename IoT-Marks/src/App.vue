<script setup>
  import Vizualizer from "@/components/Vizualizer.vue"
  import Footer from "@/components/Footer.vue"
</script>

<template>
  <div class="bg"></div>
  <VApp>
    <VMain
      class="d-flex flex-column align-center h-100"
      style="width: 100vw; height: 100vh; overflow: auto;"
    >
      <Vizualizer class="flex-grow-1" />
      <Footer />
    </VMain>
  </VApp>
</template>

<style scoped>
  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 0;
  }

  .bg::before {
    content: "";
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300%;
    height: 300%;
    z-index: -1;

    --primary-base: color-mix(in srgb,
      rgb(var(--v-theme-primary))
    , black 85%);
    --color-1: var(--primary-base);
    --color-2: hsl(from var(--primary-base) calc(h + 35) s l);
    --color-3: hsl(from var(--primary-base) calc(h - 35) s l);

    background-image: 
      radial-gradient(circle at 35% 35%, var(--color-1) 0%, transparent 35%),
      radial-gradient(circle at 65% 35%, var(--color-2) 0%, transparent 35%),
      radial-gradient(circle at 50% 65%, var(--color-3) 0%, transparent 35%);
    background-repeat: no-repeat;

    animation: flow 20s ease-in-out infinite alternate;
  }

  @keyframes flow {
    0% {
      transform: rotate(0deg) scale(1);
      background-size: 100% 100%, 100% 100%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%;
    }
    25% {
      background-size: 130% 130%, 80% 80%, 100% 100%;
      background-position: -5% -5%, 10% 5%, 0% 5%;
    }
    50% {
      transform: rotate(180deg) scale(1.1);
      background-size: 80% 80%, 130% 130%, 90% 90%;
      background-position: 5% 5%, -10% -10%, 5% 10%;
    }
    75% {
      background-size: 100% 100%, 90% 90%, 130% 130%;
      background-position: 0% 0%, 5% -5%, -5% -5%;
    }
    100% {
      transform: rotate(360deg) scale(1);
      background-size: 100% 100%, 100% 100%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%;
    }
  }
</style>
