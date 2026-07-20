<template>
  <div class="modern-date-wrapper">
    <!-- Visual Input -->
    <q-input
      :model-value="formattedDisplayDate"
      outlined
      rounded
      dense
      readonly
      class="cursor-pointer hide-readonly-cursor"
      aria-haspopup="dialog"
      :aria-expanded="dialogOpen"
      @click="openDialog"
      @keydown.enter.prevent="openDialog"
      @keydown.space.prevent="openDialog"
      v-bind="$attrs"
    >
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          icon="calendar_month"
          color="primary"
          aria-label="Abrir calendário"
          @click.stop="openDialog"
        />
      </template>
    </q-input>

    <!-- Dialog / Bottom Sheet for picking date -->
    <q-dialog v-model="dialogOpen" :position="$q.screen.lt.sm ? 'bottom' : 'standard'">
      <q-card
        class="date-picker-card"
        :class="{ 'mobile-sheet': $q.screen.lt.sm, 'desktop-dialog': !$q.screen.lt.sm }"
      >
        <q-card-section class="q-pb-none row items-center justify-between">
          <div class="text-h6 text-bold">{{ dialogTitle }}</div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            aria-label="Fechar calendário"
            class="date-picker-close"
          />
        </q-card-section>

        <q-card-section class="q-pt-md flex flex-center">
          <q-date
            v-model="internalDate"
            mask="YYYY-MM-DD"
            color="primary"
            flat
            class="full-width custom-q-date"
            @update:model-value="onDateSelected"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  dialogTitle: {
    type: String,
    default: 'Selecione a Data',
  },
});

const emit = defineEmits(['update:modelValue']);

const dialogOpen = ref(false);
const internalDate = ref(props.modelValue);

// Sync internal start date when opening
watch(dialogOpen, (val) => {
  if (val) {
    internalDate.value = props.modelValue;
  }
});

function openDialog() {
  dialogOpen.value = true;
}

function onDateSelected(val: string | number | null) {
  emit('update:modelValue', val);
  dialogOpen.value = false;
}

const formattedDisplayDate = computed(() => {
  if (!props.modelValue) return '';
  const [year, month, day] = props.modelValue.split('-');
  if (!year || !month || !day) return props.modelValue;

  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
});
</script>

<style scoped>
.modern-date-wrapper {
  width: 100%;
}

/* Remove dashed border from Quasar's readonly outlined input */
.modern-date-wrapper.modern-date-wrapper
  :deep(.q-field--outlined.q-field--readonly .q-field__control:before) {
  border-style: solid;
}

.hide-readonly-cursor.hide-readonly-cursor :deep(input) {
  cursor: pointer;
}

.date-picker-card.mobile-sheet {
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  width: 100vw;
  padding-bottom: 20px;
}

.date-picker-card.desktop-dialog {
  border-radius: 24px;
  min-width: 360px;
}

.custom-q-date {
  border-radius: 16px;
}

.date-picker-close {
  background: rgba(0, 0, 0, 0.05);
}
</style>
