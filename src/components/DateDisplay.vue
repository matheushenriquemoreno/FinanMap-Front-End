    <template>
  <div class="column items-end justify-center q-mr-md">
    <div class="text-uppercase text-grey-5" style="font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; line-height: 1.2;">HOJE</div>
    <div class="text-white text-subtitle2" style="font-size: 1rem; line-height: 1.2;">{{ formattedDate }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const formattedDate = computed(() => {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('pt-BR', { month: 'long' });
  return `${day} de ${month}`;
});
</script>
