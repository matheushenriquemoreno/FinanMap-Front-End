import { Notify } from 'quasar';

export function notificarAcao(mensage: string, multiLine = false) {
  Notify.create({
    message: mensage,
    position: 'bottom-left',
    timeout: 5000,
    progress: true,
    multiLine: multiLine,
    color: 'teal',
    actions: [{ icon: 'close', color: 'white' }],
  });
}

export function notificar(mensage: string, multiLine = false) {
  Notify.create({
    message: mensage,
    position: 'top',
    timeout: 3000,
    progress: true,
    multiLine: multiLine,
    type: 'positive',
    actions: [{ icon: 'close', color: 'white' }],
  });
}

export function notificarInfo(mensage: string, pesistente = false, multiLine = false) {
  Notify.create({
    message: mensage,
    position: 'center',
    timeout: pesistente ? 0 : 8000,
    progress: true,
    multiLine: multiLine,
    type: 'info',
    actions: [{ icon: 'close', color: 'grey-8' }],
  });
}

export function notificarErro(mensage: string, multiLine = true) {
  Notify.create({
    type: 'negative',
    message: mensage,
    position: 'center',
    progress: true,
    multiLine: multiLine,
    icon: 'warning',
    timeout: 5000,
    actions: [{ icon: 'close', color: 'white' }],
  });
}
