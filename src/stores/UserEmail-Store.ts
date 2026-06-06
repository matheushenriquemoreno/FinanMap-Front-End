
import { defineStore } from 'pinia'
import { AVATAR_PADRAO, normalizarAvatarId, type AvatarId, type UsuarioPerfil } from 'src/models/Usuario'
import { ref } from 'vue'

export const useEmailStore = defineStore('user', () => {
  const email = ref<string | null>(null)
  const name = ref<string | null>(null)
  const avatarId = ref<AvatarId>(AVATAR_PADRAO)

  function setEmail(newEmail: string) {
    email.value = newEmail
  }

  function setName(newName: string) {
    name.value = newName
  }

  function setAvatarId(newAvatarId?: string | null) {
    avatarId.value = normalizarAvatarId(newAvatarId)
  }

  function setUser(user: UsuarioPerfil) {
    email.value = user.email
    name.value = user.nome
    setAvatarId(user.avatarId)
  }

  function clearUser() {
    email.value = null
    name.value = null
    avatarId.value = AVATAR_PADRAO
  }

  const getEmail = () => email.value
  const getName = () => name.value
  const isAuthenticated = () => !!email.value

  return {
    email,
    name,
    avatarId,
    setEmail,
    setName,
    setAvatarId,
    setUser,
    clearUser,
    getEmail,
    getName,
    isAuthenticated
  }
})
