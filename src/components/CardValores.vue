<template>
  <div class="cost-card">
    <div class="icon-container">
      <q-avatar class="icon" :text-color="iconColor" :icon="icon" />
    </div>
    <div class="text-container">
      <span class="amount">
        <ValorPadraoBR :valor="valor" />
      </span>
      <span class="label text-subtitle2">{{ label }}</span>
    </div>
    <span class="close-btn">
      <q-avatar :text-color="iconColor" :icon="icon" size="md" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import ValorPadraoBR from './ValorPadraoBR.vue';

const props = defineProps({
  // Valor a ser exibido formatado pelo componente ValorPadraoBR
  valor: {
    type: Number,
    required: true,
  },
  // Texto descritivo do card (ex: "Recebimentos", "Despesas", etc)
  label: {
    type: String,
    required: true,
  },
  // Ícone principal do card
  icon: {
    type: String,
    required: true,
  },
  // Cor do ícone
  iconColor: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.cost-card {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 140px; /* Ajuste conforme necessário */
  box-shadow:
    rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  position: relative; /* Permite posicionamento absoluto do botão */
  min-height: 60px; /* Garante espaço suficiente para o botão */
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.icon-container {
  margin-right: 12px;
}

.icon {
  width: 50px;
  height: 50px;
  background-color: #f0f8ff;
}

.close-btn {
  display: none;
}

.text-container {
  display: flex;
  flex-direction: column;
}

.amount {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 4px;
}

.label {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: normal;
  font-size: 14px;
  color: #666666;
}

@media (min-width: 460px) {
  .cost-card {
    min-width: 200px;
  }
}

/* Campo Media que vai separar os cards para que o mini icone apareça deixando assim a visualização dos cards mais bonita.
E também que os cars fiquem menores possibilitando um melhor conforto de tela para o usuário mobile

--- Cuidado ao alterar!!!!!!
*/

@media (max-width: 460px) {
  .icon-container {
    display: none;
  }

  .cost-card {
    padding: 8px 8px;
  }

  .close-btn {
    display: block;
    position: absolute;
    bottom: 0%;
    right: 0%;
    font-weight: bold;
    cursor: pointer;
    padding: 3px;
    border-radius: 50%;
    transition: color 0.3s ease;
  }

  .label {
    font-size: 15px;
  }
  .card:active {
    transform: scale(1.05);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  }
}

/* Animação quando o mouse passa perto */
.cost-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
}

.cost-card:before {
  content: '';
  position: absolute;
  border-radius: 12px;
  transition:
    transform 0.4s ease-in-out,
    opacity 0.4s ease-in-out;
  opacity: 0;
  transform: scale(0.8);
}

/* Animação quando o mouse se aproxima */
.cost-card:hover::before {
  opacity: 1;
  transform: scale(1);
}
</style>
