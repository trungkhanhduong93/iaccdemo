// Hướng dẫn nhanh các màn Hệ thống (T685, QD86), soạn cho chủ quán và kế toán. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  'nguoi-dung': {
    muc: 'Quản lý danh sách tài khoản, vai trò và phạm vi cửa hàng phân công cho từng nhân viên.',
    buoc: [
      { chu: 'Xem số lượng người dùng đang có trên tổng số tài khoản cho phép của gói.', o: 'tong' },
      { chu: 'Bấm Mời người dùng để gửi thư mời kích hoạt tài khoản qua email cho nhân viên.', o: 'them' },
      { chu: 'Xem họ tên, email, vai trò, phạm vi cửa hàng và trạng thái kích hoạt của từng người dùng.', o: 'bang' },
      { chu: 'Bấm một dòng hoặc nút Sửa ở cuối dòng để chỉnh sửa vai trò hoặc phạm vi dữ liệu.', o: 'bang' },
    ],
    luuY: [
      'Người dùng chỉ xem và thao tác trên dữ liệu các cửa hàng, kho được phân công.',
      'Xác thực hai lớp áp dụng cho vai trò Kế toán trưởng và Chủ doanh nghiệp.',
    ],
    soDo: [
      [{ k: 'tong', ten: 'Số người dùng của gói', rong: 3 }, { k: 'them', ten: 'Mời người dùng', kieu: 'nut' }],
      [{ k: 'bang', ten: 'Danh sách: họ tên, email, vai trò, phạm vi, trạng thái', kieu: 'bang' }],
    ],
  },

  'phan-quyen': {
    muc: 'Thiết lập quyền Xem, Thêm, Sửa, Xoá, Ghi sổ và Khoá sổ cho từng vai trò nhân viên.',
    buoc: [
      { chu: 'Bấm một vai trò ở cột trái để xem và sửa quyền tương ứng.', o: 'vaiTro' },
      { chu: 'Bấm tên phân hệ để mở rộng danh sách màn hình, bật tắt từng quyền của vai trò đó.', o: 'bang' },
      { chu: 'Bấm Thêm mới để tạo thêm vai trò tuỳ chỉnh.', o: 'them' },
      { chu: 'Bấm Lưu để áp dụng phân quyền vừa sửa.', o: 'luuQuyen' },
    ],
    luuY: [
      'Phạm vi cửa hàng và kho của từng người được đặt ở màn Người dùng.',
      'Chủ doanh nghiệp và Kế toán trưởng có sẵn bộ quyền mặc định của hệ thống.',
    ],
    soDo: [
      [{ k: 'them', ten: 'Thêm mới vai trò', kieu: 'nut' }, { k: 'luuQuyen', ten: 'Lưu thay đổi', kieu: 'nut' }],
      [{ k: 'vaiTro', ten: 'Danh sách vai trò', rong: 1 }, { k: 'bang', ten: 'Ma trận quyền theo phân hệ và màn hình', rong: 3, kieu: 'bang' }],
    ],
  },

  'nhat-ky': {
    muc: 'Theo dõi mọi thao tác phát sinh trên hệ thống để kiểm soát và truy vết khi cần.',
    buoc: [
      { chu: 'Theo dõi thời điểm phát sinh thao tác và tài khoản thực hiện.', o: 'bang' },
      { chu: 'Xem chi tiết hành động: thêm mới, sửa, xoá chứng từ, ghi sổ hoặc khoá sổ.', o: 'bang' },
      { chu: 'Mặc định xem thao tác hôm nay. Đổi ngày, lọc theo thao tác, cửa hàng ở thanh lọc.', o: 'loc' },
      { chu: 'Bấm một dòng để xem ai làm, trên chứng từ nào, đã làm gì. Nhật ký tự ghi, không ai sửa hay xoá được.', o: 'chiTiet' },
    ],
    luuY: [
      'Các thao tác trên chứng từ trong phiên làm việc hiện ngay ở đầu danh sách.',
      'Nhật ký ghi cả đăng nhập, khoá sổ, xuất Excel.',
    ],
    soDo: [
      [{ k: 'ghiChu', ten: 'Quy tắc toàn vẹn: không sửa, không xoá được' }],
      [{ k: 'bang', ten: 'Bảng nhật ký: thời điểm, người làm, thao tác, địa chỉ IP', kieu: 'bang' }],
    ],
  },

  'thong-tin': {
    muc: 'Khai báo thông tin pháp lý đơn vị, thông tư áp dụng và chế độ kế toán làm việc.',
    buoc: [
      { chu: 'Khai báo tên đơn vị, mã số thuế và địa chỉ in trên chứng từ, báo cáo.', o: 'chungTu' },
      { chu: 'Chọn loại hình kinh doanh, thông tư áp dụng và phương pháp thuế.', o: 'keKhai' },
      { chu: 'Thiết lập ngày đầu năm tài chính, năm làm việc và phương pháp tính giá xuất kho.', o: 'cheDo' },
      { chu: 'Bấm Lưu để áp dụng toàn bộ thông tin đơn vị và chế độ kế toán mới.', o: 'luuDv' },
    ],
    luuY: [
      'Mã số thuế đã khai báo khi khởi tạo hệ thống sẽ không sửa được tại đây.',
      'Đổi loại hình hoặc thông tư áp dụng sẽ thay đổi mẫu chứng từ và hệ thống sổ kế toán tương ứng.',
    ],
    soDo: [
      [{ k: 'chungTu', ten: 'Thông tin in trên chứng từ: tên, mã số thuế, địa chỉ', rong: 3 }, { k: 'luuDv', ten: 'Lưu', kieu: 'nut' }],
      [{ k: 'keKhai', ten: 'Thông tin kê khai: loại hình, thông tư, phương pháp thuế' }],
      [{ k: 'cheDo', ten: 'Chế độ kế toán: ngày đầu năm, tính giá xuất kho' }],
    ],
  },

  'cau-hinh': {
    muc: 'Thiết lập bộ định khoản tự động và quy tắc đánh số chứng từ cho toàn hệ thống.',
    buoc: [
      { chu: 'Xem quy tắc định khoản tự động: ưu tiên theo hàng hoá, nhóm hàng rồi đến mặc định.', o: 'dinhKhoan' },
      { chu: 'Bấm Sửa bộ định khoản nếu cần đổi tài khoản Nợ, Có mặc định của từng nghiệp vụ.', o: 'dinhKhoan' },
      { chu: 'Xem mẫu số và tiền tố đánh số tự động của từng loại chứng từ.', o: 'danhSo' },
      { chu: 'Bấm Lưu để lưu các thay đổi cấu hình.', o: 'luuCh' },
    ],
    luuY: [
      'Chế độ kế toán không dùng tài khoản Nợ, Có thì không có bộ định khoản.',
    ],
    soDo: [
      [{ k: 'luuCh', ten: 'Lưu cấu hình', kieu: 'nut' }],
      [{ k: 'dinhKhoan', ten: 'Bộ định khoản tự động', rong: 1, kieu: 'bang' }, { k: 'danhSo', ten: 'Bảng đánh số chứng từ', rong: 1, kieu: 'bang' }],
    ],
  },

  'khoa-so': {
    muc: 'Chốt số liệu kế toán theo từng tháng để ngăn sửa, xoá chứng từ cũ.',
    buoc: [
      { chu: 'Chọn cửa hàng và năm làm việc cần theo dõi tiến độ khoá sổ.', o: 'loc' },
      { chu: 'Xem trạng thái khoá sổ của từng tháng trong năm.', o: 'bang' },
      { chu: 'Bấm nút Khoá sổ ở cuối dòng để chốt số liệu của tháng.', o: 'bang' },
      { chu: 'Bấm Lịch sử khoá sổ để xem lại ai đã khoá hoặc mở khoá và lý do.', o: 'lichSu' },
    ],
    luuY: [
      'Chứng từ trong tháng đã khoá chỉ xem được, không thể sửa hay xoá.',
      'Mở khoá sổ yêu cầu ghi rõ lý do để lưu vào nhật ký hệ thống.',
      'Khoá sổ theo tuần tự từng tháng từ đầu năm đến cuối năm.',
    ],
    soDo: [
      [{ k: 'lichSu', ten: 'Lịch sử khoá sổ', kieu: 'nut' }],
      [{ k: 'loc', ten: 'Trạng thái · Năm · Cửa hàng' }],
      [{ k: 'bang', ten: 'Danh sách tháng: trạng thái, người khoá, nút Khoá sổ', kieu: 'bang' }],
    ],
  },

  'goi-thue-bao': {
    muc: 'Theo dõi thời hạn bản quyền hiện tại và lựa chọn gói thuê bao phù hợp nhu cầu.',
    buoc: [
      { chu: 'Theo dõi gói bản quyền đang dùng, mã số thuế đơn vị và thời hạn thuê bao còn lại.', o: 'hienTai' },
      { chu: 'Bấm Gia hạn thêm 1 năm để gửi yêu cầu gia hạn trực tuyến tới chuyên viên iPOS.', o: 'giaHan' },
      { chu: 'Chuyển đổi giữa thanh toán theo năm (tiết kiệm 20%) hoặc theo tháng.', o: 'kyThanhToan' },
      { chu: 'So sánh tính năng giữa các gói Standard, Plus, Pro để chọn gói phù hợp hoặc nâng cấp.', o: 'cacGoi' },
    ],
    luuY: [
      'Thanh toán theo năm được ưu đãi tiết kiệm 20% so với thanh toán từng tháng.',
    ],
    soDo: [
      [{ k: 'hienTai', ten: 'Hiện trạng gói: gói đang dùng, thời hạn còn lại', rong: 3 }, { k: 'giaHan', ten: 'Gia hạn thêm 1 năm', kieu: 'nut' }],
      [{ k: 'kyThanhToan', ten: 'Kỳ thanh toán: theo năm · theo tháng' }],
      [{ k: 'cacGoi', ten: 'Dải thẻ các gói: Standard · Plus · Pro', kieu: 'bang' }],
    ],
  },
}
