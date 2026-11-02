// Hướng dẫn nhanh các màn Thu chi (T673, T674, QD86), soạn cho chủ quán gói Standard. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  '2-1-1': {
    goi: ['S'],
    muc: 'Ghi mọi khoản tiền vào, ra của quán. Phiếu thu chi ghi trên máy POS FABi tự về đây, bạn chỉ ghi thêm khoản còn thiếu.',
    buoc: [
      { chu: 'Chọn tab theo nơi tiền đi qua: Tiền mặt, Ngân hàng, hoặc Chuyển quỹ khi đưa tiền từ quỹ này sang quỹ khác.', o: 'tab' },
      { chu: 'Bấm Thêm mới, chọn Phiếu thu hoặc Phiếu chi.', o: 'them', di: 'tien/2-1-1/moi?loai=chi', nutDi: 'Ghi một khoản chi', dt: 'Chạm nút + ở góc dưới, chọn Phiếu chi.' },
      // 3 bước trong form phiếu chỉ vào ô của form, dải nổi trên form (T676)
      { chu: 'Chọn đối tượng, lý do ở phần đầu phiếu.', o: 'ttc' },
      { chu: 'Ghi diễn giải, số tiền ở bảng Chi tiết.', o: 'chi-tiet', dt: 'Ghi diễn giải, số tiền ở phần Chi tiết.' },
      { chu: 'Bấm Lưu hoặc Ctrl + S. Phiếu lưu xong hiện ở đầu danh sách.', o: 'luu', dt: 'Chạm Lưu ở đáy phiếu. Phiếu lưu xong hiện ở đầu danh sách.' },
      { chu: 'Tìm phiếu cũ: chọn thời gian, gõ số phiếu hoặc diễn giải, bấm Lọc.', o: 'loc', dt: 'Tìm phiếu cũ: chọn thời gian, gõ số phiếu hoặc diễn giải vào ô tìm.' },
      { chu: 'Bấm số chứng từ để xem, in, sửa phiếu.', o: 'bang', dt: 'Chạm vào phiếu để xem, in, sửa phiếu.' },
      // Đồng bộ thu chi FABi bên phải thanh tab (T691, T706); điện thoại không có tiện ích này
      { chu: 'Phiếu thu chi trên máy POS FABi tự về. Muốn lấy ngay thì bấm nút Đồng bộ bên phải thanh tab.', o: 'dongBo', dt: 'Phiếu thu chi trên máy POS FABi tự về. Muốn lấy ngay thì bấm nút Đồng bộ bên phải thanh tab Thu chi trên máy tính.' },
      { chu: 'Chọn khoảng ngày của phiếu cần lấy về.', o: 'hdbNgay', bam: 'dongBo', web: true },
      { chu: 'Tích cửa hàng cần lấy phiếu. Gõ tên vào ô tìm hoặc bấm Chọn tất cả, Bỏ chọn để lọc nhanh.', o: 'hdbDs', bam: 'dongBo', web: true },
      { chu: 'Tích Đồng bộ lại phiếu đã có để lấy lại phiếu đã vào sổ trong kỳ, không nhân đôi.', o: 'hdbLamLai', bam: 'dongBo', web: true },
      { chu: 'Bấm Đồng bộ ngay để lấy phiếu. Phiếu lấy về có số bắt đầu bằng FBTC.', o: 'hdbNut', bam: 'dongBo', web: true },
      { chu: 'Nhãn cam báo số phiếu thu chi FABi chưa vào sổ. Bấm nhãn để xem lý do từng phiếu.', o: 'chuaDb', web: true },
      { chu: 'Mã phiếu FABi là số phiếu trên máy POS, dùng để tra lại phiếu. Cột Nguyên nhân cho biết vì sao phiếu chưa vào sổ: chưa map quỹ, hoặc kỳ đã khoá sổ. Bấm Map quỹ hoặc Mở khoá sổ để sửa, rồi bấm Đồng bộ.', o: 'hdbLyDo', bam: 'chuaDb', web: true },
    ],
    luuY: [
      'Rút tiền mặt từ Quỹ tiền gửi vào ngân hàng thì lập phiếu ở tab Chuyển quỹ. Không ghi một phiếu chi và một phiếu thu.',
      'Phiếu có số bắt đầu bằng FBTC là phiếu thu chi từ máy POS FABi tự về.',
      'Nút Đồng bộ lấy phiếu thu chi cả tiền mặt lẫn ngân hàng, không riêng tab nào.',
      'Hai lý do phiếu chưa đồng bộ: phương thức thanh toán chưa gán quỹ (bấm Map quỹ), hoặc ngày phiếu thuộc kỳ đã khoá sổ (bấm Mở khoá sổ).',
    ],
    soDo: [
      [{ k: 'tab', ten: 'Tiền mặt · Ngân hàng · Chuyển quỹ', kieu: 'tab', rong: 2 }, { k: 'chuaDb', ten: 'Phiếu chưa đồng bộ' }, { k: 'dongBo', ten: 'Đồng bộ', kieu: 'nut' }],
      [{ k: 'loc', ten: 'Thời gian, tìm, Lọc', rong: 3 }, { k: 'them', ten: 'Thêm mới', kieu: 'nut' }],
      [{ k: 'bang', ten: 'Danh sách phiếu thu, chi', kieu: 'bang' }],
      [{ k: 'tong', ten: 'Tổng tiền, chuyển trang' }],
    ],
  },
  // Sổ quỹ gói Standard mở trong phân hệ Thu chi, đầu báo cáo nằm thay thanh tab nên nút la bàn ở cạnh nút In (T674). Gọi là Quỹ tiền, không gọi là két (T679)
  '2-2-1': {
    goi: ['S'],
    muc: 'Xem tiền mặt vào, ra từng ngày và số tiền còn lại trong Quỹ tiền, để cuối ngày đếm tiền thực tế so lại.',
    buoc: [
      { chu: 'Chọn Thời gian và Quỹ tiền cần xem, rồi bấm Lọc.', o: 'loc' },
      { chu: 'Đọc từ dòng Số tồn đầu kỳ, qua từng phiếu thu, chi, tới dòng Số tồn cuối kỳ. Cột Tồn là tiền còn lại sau mỗi phiếu.', o: 'to' },
      { chu: 'Bấm số phiếu thu, phiếu chi để mở phiếu gốc.', o: 'to', dt: 'Chạm dòng phiếu thu, phiếu chi để mở phiếu gốc.' },
      { chu: 'Bấm In để in sổ, bấm nút tải xuống để lấy file về máy.', o: 'in', dt: 'Chạm biểu tượng Excel ở góc bảng để tải file về máy.' },
      { chu: 'Tiền đếm thực tế trong Quỹ tiền khác Số tồn cuối kỳ thì tìm khoản thu, chi chưa ghi rồi ghi thêm ở Thu chi.', di: 'tien/2-1-1?nhom=tm', nutDi: 'Mở Thu chi tiền mặt' },
    ],
    luuY: [
      'Đối chiếu cuối ngày: chọn Thời gian là hôm nay, xem dòng Số tồn cuối kỳ.',
      'Ô Cửa hàng chỉ có khi thanh trên đang xem Tất cả cửa hàng.',
      'Nút phễu mở Bộ lọc nâng cao. Nút Tuỳ chỉnh chọn cột hiện trên sổ.',
    ],
    soDo: [
      [{ k: 'ten', ten: 'Sổ quỹ tiền mặt, ngôi sao ghim', rong: 2 }, { k: 'in', ten: 'Tải xuống, Tuỳ chỉnh, In', kieu: 'nut' }],
      [{ k: 'loc', ten: 'Thời gian, Cửa hàng, Quỹ tiền, Lọc' }],
      [{ k: 'to', ten: 'Tồn đầu kỳ, từng phiếu thu, chi, cột Tồn, tồn cuối kỳ', kieu: 'bang' }],
    ],
  },
}
