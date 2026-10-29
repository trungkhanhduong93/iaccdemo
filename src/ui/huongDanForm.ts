// Hướng dẫn nhanh đi theo vào form toàn màn (T676, QD87): FormToanMan báo form đang mở để tour (HuongDanNhanh) khoanh ô trong form;
// form chứng từ hỏi tour có đang chạy không và báo phiếu mới đã lưu.
// Tour đi ra bước ngoài form hoặc tắt hướng dẫn thì đóng form không hỏi (T680). Tắt tour thì xoá phiếu mẫu tour đã lưu (T681, QD88).
const dsForm: { e: HTMLElement; dong: () => void }[] = []   // form mở chồng lên form khác thì form mở sau nằm trên
const nghe = new Set<() => void>()
const bao = () => nghe.forEach(f => f())
let tourChay = false
let soLuu = 0
/** Phiếu mới lưu trong form lúc tour đang chạy */
export interface PhieuLuu { man: string; id: string; so: string }
let dsLuu: PhieuLuu[] = []

export const ngheForm = (f: () => void) => { nghe.add(f); return () => { nghe.delete(f) } }
/** Form toàn màn nằm trên cùng, không có form thì null */
export const formTren = () => dsForm[dsForm.length - 1]?.e ?? null
/** dong: đóng form không hỏi lại */
export function ganForm(e: HTMLElement, dong: () => void) {
  const x = { e, dong }
  dsForm.push(x); bao()
  return () => { const i = dsForm.indexOf(x); if (i >= 0) dsForm.splice(i, 1); bao() }
}
export const dongFormTren = () => dsForm[dsForm.length - 1]?.dong()

/** Bật tour thì bắt đầu ghi lại phiếu mẫu lưu trong tour */
export const datTourChay = (v: boolean) => { tourChay = v; dsLuu = [] }
/** Tour đang chạy: form chứng từ lưu phiếu mới xong thì đóng về danh sách thay vì ở lại xem phiếu */
export const huongDanDangChay = () => tourChay
/** Form chứng từ lưu xong phiếu mới */
export function baoDaLuu(p: PhieuLuu) {
  soLuu++
  if (tourChay) dsLuu = [...dsLuu, p]
  bao()
}
export const soLanLuu = () => soLuu
/** Phiếu mẫu đã lưu từ lúc bật tour, phiếu mới nhất ở cuối */
export const phieuTour = () => dsLuu
