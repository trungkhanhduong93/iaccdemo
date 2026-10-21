import type { NavigateFunction } from 'react-router-dom'

/** Nút quay lại điện thoại (T563): lùi đúng 1 bước lịch sử; hết lịch sử thì về màn cha bằng replace, không đẩy thêm bước gây vòng lặp A ↔ B */
export function quayLaiMobile(nav: NavigateFunction, duongDanMacDinh = '/app/nghiep-vu') {
  if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
    nav(-1)
  } else {
    nav(duongDanMacDinh, { replace: true })
  }
}
