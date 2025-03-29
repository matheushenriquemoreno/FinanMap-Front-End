
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Interface para tipagem do estado
interface UserState {
  email: string | null
}

export const useEmailStore = defineStore('user', () => {
  // Estado
  const email = ref<string | null>(null)

  // Ações
  function setEmail(newEmail: string) {
    email.value = newEmail
  }

  function clearEmail() {
    email.value = null
  }

  // Getters (computados)
  const getEmail = () => email.value
  const isAuthenticated = () => !!email.value

  return {
    email,
    setEmail,
    clearEmail,
    getEmail,
    isAuthenticated
  }
})
