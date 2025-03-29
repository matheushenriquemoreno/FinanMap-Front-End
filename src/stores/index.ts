import { defineStore } from '#q-app/wrappers'
import { createPinia } from 'pinia'

declare module 'pinia' {

  export interface PiniaCustomProperties {
    // add your custom properties here, if any
  }
}

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia()

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia
})
