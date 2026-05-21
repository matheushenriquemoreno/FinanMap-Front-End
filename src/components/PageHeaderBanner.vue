<template>
  <div class="page-header-banner q-mb-lg" :style="{ background: gradient }">
    <div class="page-header-banner__info">
      <q-icon :name="icon" size="40px" color="white" />
      <div>
        <h4 class="text-h4 text-bold text-white q-mb-none" style="line-height: 1">
          {{ title }}
        </h4>
        <span class="page-header-banner__subtitle">{{ subtitle }}</span>
      </div>
    </div>
    <q-btn
      color="white"
      text-color="primary"
      :icon="buttonIcon"
      :label="buttonLabel"
      rounded
      unelevated
      @click="$emit('action')"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
    buttonIcon?: string;
    gradient?: string;
  }>(),
  {
    buttonIcon: 'add',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
  },
);

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style lang="scss" scoped>
.page-header-banner {
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__subtitle {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
