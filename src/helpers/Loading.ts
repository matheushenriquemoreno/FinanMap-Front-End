import { Loading, QSpinnerTail } from 'quasar';

export function showLoading() {
  Loading.show({
    spinner: QSpinnerTail,
  });
}

export function hideLoading() {
  Loading.hide();
}

export function executarFuncaoComLoading(action: () => void) {
  try {
    showLoading();
    action();
  } finally {
    hideLoading();
  }
}
