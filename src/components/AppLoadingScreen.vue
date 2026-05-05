<template>
  <Transition name="loading-fade">
    <div v-if="visible" class="app-loading-screen">
      <!-- Animated background particles -->
      <div class="loading-particles">
        <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></span>
      </div>

      <!-- Main content -->
      <div class="loading-content">
        <!-- Logo with pulse animation -->
        <div class="loading-logo-wrapper">
          <div class="loading-logo-glow"></div>
          <img
            src="/favicon.ico"
            alt="FinanMap"
            class="loading-logo"
          />
        </div>

        <!-- App name -->
        <h1 class="loading-title">FinanMap</h1>
        <p class="loading-subtitle">Gerenciamento Financeiro Inteligente</p>

        <!-- Modern spinner -->
        <div class="loading-spinner-container">
          <div class="loading-spinner">
            <div class="spinner-ring spinner-ring-1"></div>
            <div class="spinner-ring spinner-ring-2"></div>
            <div class="spinner-ring spinner-ring-3"></div>
          </div>
        </div>

        <!-- Loading text with dots animation -->
        <p class="loading-text">
          Preparando seu ambiente
          <span class="loading-dots">
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
          </span>
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();

function particleStyle(index: number) {
  const size = 2 + Math.random() * 4;
  const left = Math.random() * 100;
  const delay = Math.random() * 6;
  const duration = 6 + Math.random() * 8;
  const opacity = 0.1 + Math.random() * 0.3;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: opacity,
  };
}
</script>

<style scoped>
.app-loading-screen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1040 35%, #0d1b3e 65%, #06071a 100%);
  overflow: hidden;
}

/* ===== Particles ===== */
.loading-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(77, 120, 255, 0.8), rgba(130, 80, 255, 0.4));
  animation: floatUp linear infinite;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.4;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-100vh) scale(0.3);
    opacity: 0;
  }
}

/* ===== Content ===== */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  animation: contentFadeIn 0.8s ease-out;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Logo ===== */
.loading-logo-wrapper {
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.loading-logo-glow {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(77, 120, 255, 0.3) 0%, transparent 70%);
  animation: logoGlow 2.5s ease-in-out infinite;
}

@keyframes logoGlow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading-logo {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(77, 120, 255, 0.4));
  animation: logoPulse 2.5s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* ===== Typography ===== */
.loading-title {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #a8b4ff 50%, #7c8cff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  line-height: 1.2;
}

.loading-subtitle {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-size: 0.9rem;
  color: rgba(168, 180, 255, 0.6);
  margin: 0 0 24px 0;
  font-weight: 400;
  letter-spacing: 0.04em;
}

/* ===== Spinner ===== */
.loading-spinner-container {
  width: 56px;
  height: 56px;
  position: relative;
  margin: 8px 0;
}

.loading-spinner {
  width: 100%;
  height: 100%;
  position: relative;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2.5px solid transparent;
}

.spinner-ring-1 {
  border-top-color: #4d78ff;
  animation: spinRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring-2 {
  inset: 5px;
  border-right-color: #8250ff;
  animation: spinRing 1.6s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;
}

.spinner-ring-3 {
  inset: 10px;
  border-bottom-color: #5c9aff;
  animation: spinRing 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

@keyframes spinRing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ===== Loading text ===== */
.loading-text {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-size: 0.85rem;
  color: rgba(168, 180, 255, 0.5);
  margin: 8px 0 0 0;
  font-weight: 400;
}

.loading-dots {
  display: inline-flex;
  gap: 1px;
}

.loading-dots .dot {
  animation: dotBounce 1.4s ease-in-out infinite;
}

.loading-dots .dot:nth-child(1) {
  animation-delay: 0s;
}
.loading-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotBounce {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* ===== Fade transition ===== */
.loading-fade-enter-active {
  transition: opacity 0.3s ease;
}

.loading-fade-leave-active {
  transition: opacity 0.6s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

/* ===== Responsive ===== */
@media (max-width: 480px) {
  .loading-logo-wrapper {
    width: 72px;
    height: 72px;
  }

  .loading-logo {
    width: 56px;
    height: 56px;
  }

  .loading-title {
    font-size: 1.6rem;
  }

  .loading-subtitle {
    font-size: 0.8rem;
  }
}
</style>
