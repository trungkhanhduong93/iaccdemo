// Hướng dẫn nhanh đi theo vào form toàn màn (T676, QD87): FormToanMan báo form đang mở để dải bước (HuongDanNhanh) nổi lên form,
// ngay dưới thanh đầu form; form chứng từ hỏi dải có đang chạy không và báo đã lưu để dải sang bước kế.
const dsForm: HTMLElement[] = []   // form mở chồng lên form khác thì form mở sau nằm trên
const nghe = new Set<() => void>()
const bao = () => nghe.forEach(f => f())
let daiChay = false
let soLuu = 0

export const ngheForm = (f: () => void) => { nghe.add(f); return () => { nghe.delete(f) } }
/** Form toàn màn nằm trên cùng, không có form thì null */
export const formTren = () => dsForm[dsForm.length - 1] ?? null
export function ganForm(e: HTMLElement) {
  dsForm.push(e); bao()
  return () => { const i = dsForm.indexOf(e); if (i >= 0) dsForm.splice(i, 1); bao() }
}

export const datDaiChay = (v: boolean) => { daiChay = v }
/** Dải bước đang mở: form chứng từ lưu phiếu mới xong thì đóng về danh sách thay vì ở lại xem phiếu */
export const huongDanDangChay = () => daiChay
export function baoDaLuu() { soLuu++; bao() }
export const soLanLuu = () => soLuu
