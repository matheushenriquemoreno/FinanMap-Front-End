import { defineStore } from 'pinia';
import { Dark } from 'quasar';

interface ThemeState {
  isDark: boolean;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDark: false,
  }),

  getters: {
    currentTheme: (state) => (state.isDark ? 'dark' : 'light'),
  },

  actions: {
    /**
     * Inicializa o tema baseado na preferência salva ou preferência do sistema
     */
    initTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDark = savedTheme === 'dark';
      } else {
        // Usa preferência do sistema operacional
        this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      Dark.set(this.isDark);
    },

    /**
     * Alterna entre modo claro e escuro
     */
    toggleTheme() {
      this.isDark = !this.isDark;
      Dark.set(this.isDark);
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    },

    /**
     * Define o tema manualmente
     * @param isDark - true para modo escuro, false para modo claro
     */
    setTheme(isDark: boolean) {
      this.isDark = isDark;
      Dark.set(isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    },
  },
});
