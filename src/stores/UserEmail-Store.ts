
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Interface para tipagem do estado
interface UserState {
  email: string | null
}

export const useEmailStore = defineStore('user', () => {
  // Estado
  const email = ref<string | null>(null)
  const name = ref<string | null>(null)

  // Ações
  function setEmail(newEmail: string) {
    email.value = newEmail
  }

  function setName(newName: string) {
    name.value = newName
  }

  function setUser(newEmail: string, newName: string) {
    email.value = newEmail
    name.value = newName
  }

  function clearUser() {
    email.value = null
    name.value = null
  }

  // Getters (computados)
  const getEmail = () => email.value
  const getName = () => name.value
  const isAuthenticated = () => !!email.value

  return {
    email,
    name,
    setEmail,
    setName,
    setUser,
    clearUser, // Renomeado de clearEmail para clearUser para refletir melhor
    getEmail,
    getName,
    isAuthenticated
  }
})
