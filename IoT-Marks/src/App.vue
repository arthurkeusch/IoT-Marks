<script setup>
import {RouterView} from "vue-router"

const year = new Date().getFullYear()
</script>

<template>
  <div class="layout">
    <main class="content">
      <RouterView/>
    </main>

    <footer class="legal">
      <div class="legal-card">
        <div class="legal-lines">
          <div class="legal-line">
            <span class="legal-label">Éditeur</span>
            <span class="legal-sep">·</span>
            <span class="legal-text">Arthur KEUSCH</span>
            <span class="legal-sep">·</span>
            <span class="legal-text">90000 Belfort - France</span>
            <span class="legal-sep">·</span>
            <span class="legal-text">© {{ year }}</span>
          </div>

          <div class="legal-line">
            <span class="legal-label">Contact</span>
            <span class="legal-sep">·</span>
            <a class="legal-link" href="mailto:arthur-keusch@orange.fr">arthur-keusch@orange.fr</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}

.legal {
  max-width: 1200px;
  margin: 14px auto 18px;
  padding: 0 18px;
  box-sizing: border-box;
}

.legal-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.025));
  border-radius: 14px;
  padding: 12px 14px;
}

.legal-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
}

.legal-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  color: rgba(255, 255, 255, 0.92);
  font-size: 12.5px;
}

.legal-label {
  color: rgba(255, 255, 255, 0.62);
  font-weight: 650;
}

.legal-text {
  color: rgba(255, 255, 255, 0.9);
}

.legal-sep {
  color: rgba(255, 255, 255, 0.45);
}

.legal-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.95;
}

.legal-link:hover {
  opacity: 0.8;
}
</style>
