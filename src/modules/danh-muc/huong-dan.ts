// Hướng dẫn nhanh các màn Danh mục (T673, QD86), soạn cho chủ quán gói Standard. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  '1-12': {
    goi: ['S'],
    muc: 'Mỗi nơi giữ tiền là một quỹ: két tiền mặt của từng cửa hàng, từng tài khoản ngân hàng. Phiếu thu chi chọn quỹ ở đây.',
    buoc: [
      { chu: 'Bấm tên quỹ, nhập Số dư ban đầu là số tiền đang có lúc bắt đầu dùng phần mềm.', o: 'bang', di: 'danh-muc/1-12?mo=TM01', nutDi: 'Nhập số dư két' },
      { chu: 'Cột PTTT từ FABi cho biết tiền mặt, chuyển khoản, QR bán trên FABi về quỹ nào.', o: 'bang' },
      { chu: 'Có thêm tài khoản ngân hàng thì bấm Thêm mới, chọn loại Ngân hàng, ghi số tài khoản.', o: 'them' },
      { chu: 'Bấm Đang hoạt động, Không hoạt động để xem quỹ đang dùng và quỹ đã ngừng.', o: 'nhom' },
    ],
    luuY: ['Số dư ban đầu chỉ nhập một lần. Sau đó tồn quỹ tự tính từ phiếu thu chi.'],
    soDo: [
      [{ k: 'loc', ten: 'Tìm, Lọc', rong: 3 }, { k: 'them', ten: 'Thêm mới', kieu: 'nut' }],
      [{ k: 'nhom', ten: 'Đang hoạt động · Không hoạt động' }],
      [{ k: 'bang', ten: 'Danh sách quỹ: tên, loại, PTTT từ FABi, số dư ban đầu', kieu: 'bang' }],
    ],
    // Đi tiếp theo sơ đồ Thu chi: Số dư ban đầu ở Thu chi chuyển về màn này (T245)
    quyTrinh: { mod: 'tien', khop: ['tien/so-du-ban-dau'] },
  },
}
