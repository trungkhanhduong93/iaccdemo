/** Lưu file về máy và chia sẻ file qua ứng dụng trên máy (T793).
 *  Trình duyệt không cho trang web biết đường dẫn đầy đủ trên máy, nên:
 *  - Chrome, Edge: mở hộp Lưu của máy, người dùng thấy và chọn thư mục, đặt tên file.
 *  - Trình duyệt khác: tải về thư mục Tải xuống (Downloads), báo tên file và thư mục đó. */

type LoaiFile = { description: string; accept: Record<string, string[]> }
type HopLuu = (o: { suggestedName: string; types: LoaiFile[] }) => Promise<{ name: string; createWritable: () => Promise<{ write: (b: Blob) => Promise<void>; close: () => Promise<void> }> }>

const LOAI: Record<string, LoaiFile> = {
  pdf: { description: 'File PDF', accept: { 'application/pdf': ['.pdf'] } },
  xml: { description: 'File XML', accept: { 'application/xml': ['.xml'] } },
  zip: { description: 'File nén ZIP', accept: { 'application/zip': ['.zip'] } },
}

const laHuy = (e: unknown) => e instanceof DOMException && e.name === 'AbortError'

/** Tải thẳng về thư mục Tải xuống (Downloads), không hỏi nơi lưu */
export function taiVe(blob: Blob, tenFile: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = tenFile
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Lưu file: trả câu báo cho toast, người dùng bấm Huỷ ở hộp Lưu thì trả null */
export async function luuFile(blob: Blob, tenFile: string): Promise<string | null> {
  const hopLuu = (window as unknown as { showSaveFilePicker?: HopLuu }).showSaveFilePicker
  if (hopLuu) {
    const duoi = tenFile.split('.').pop()?.toLowerCase() ?? ''
    try {
      const f = await hopLuu({ suggestedName: tenFile, types: LOAI[duoi] ? [LOAI[duoi]] : [] })
      const ghi = await f.createWritable()
      await ghi.write(blob)
      await ghi.close()
      return `Đã lưu file ${f.name} vào thư mục bạn vừa chọn`
    } catch (e) {
      if (laHuy(e)) return null
      // Trang nhúng trong khung hoặc máy chặn hộp Lưu: tải về thư mục mặc định
    }
  }
  taiVe(blob, tenFile)
  return `Đã tải file ${tenFile} về thư mục Tải xuống (Downloads) của máy`
}

/** Chia sẻ file: mở bảng chia sẻ của máy để chọn ứng dụng đã cài (Zalo, Telegram, WhatsApp, Mail...).
 *  Trình duyệt chưa hỗ trợ chia sẻ file thì tải file về để gửi tay. Trả câu báo cho toast, hoặc null khi người dùng đóng bảng chia sẻ. */
export async function chiaSeFile(blob: Blob, tenFile: string, tieuDe: string): Promise<string | null> {
  const file = new File([blob], tenFile, { type: blob.type })
  const du = { files: [file], title: tieuDe, text: tieuDe }
  if (navigator.canShare?.(du)) {
    try {
      await navigator.share(du)
      return null
    } catch (e) {
      if (laHuy(e)) return null
    }
  }
  taiVe(blob, tenFile)
  return `Trình duyệt này chưa mở được bảng chia sẻ. Đã tải ${tenFile} về thư mục Tải xuống (Downloads) để bạn gửi qua Zalo, Telegram...`
}
