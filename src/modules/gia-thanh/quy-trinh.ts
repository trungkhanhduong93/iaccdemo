// Quy trình tính giá thành theo bước đánh số, giống màn Giá thành của AMIS
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Quy trình tính giá thành',
  danhSo: true,
  buoc: [
    { chinh: { ten: 'Công thức chế biến', icon: 'book', di: 'kho/9-1-3' } },
    { chinh: { ten: 'Tính giá vốn nguyên vật liệu', icon: 'calc', di: 'kho/5-1-7' } },
    { chinh: { ten: 'Tập hợp chi phí', icon: 'layers', di: 'gia-thanh/9-2-1' } },
    { chinh: { ten: 'Phân bổ chi phí chung', icon: 'scale', di: 'gia-thanh/9-1-1' } },
    { chinh: { ten: 'Tính giá thành nhiều cấp', icon: 'flask', di: 'gia-thanh/9-1-2' } },
    { chinh: { ten: 'Báo cáo giá thành', icon: 'chart', di: 'gia-thanh/9-2-2' } },
  ],
  baoCao: ['9-2-1', '9-2-2', 'kho/5-2-6', 'kho/5-2-7', 'kho/5-2-5'],
  danhMuc: ['kho/9-1-3', 'danh-muc/1-6', 'danh-muc/1-7'],
}
