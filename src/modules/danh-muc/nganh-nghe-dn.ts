// Nhóm ngành nghề tính thuế doanh nghiệp theo tỷ lệ % trên doanh thu, TT58 (T720, QD93)
// Chép từ file "Bang_Tong_Hop_Nganh_Nghe_Tinh_Thue theo TT58.xlsx" của PhuongXT (03/11/2026), bản gốc ở docs/NGANH-NGHE-THUE-TT58.xlsx.
// Tách riêng danh sách hộ kinh doanh (nganh-nghe.ts, TT152): mã có tiền tố DN, hàng hoá lưu ở ô riêng nganhNgheDn

export interface NhomNganhDn { ma: string; ten: string }
/** gtgt null: không tính thuế GTGT (Excel ghi "-"); gtgt, tndn: % trên doanh thu */
export interface NganhNgheDn { ma: string; ten: string; nhom: string; gtgt: number | null; tndn: number }

export const NHOM_NGANH_DN: NhomNganhDn[] = [
  { ma: '1', ten: 'Phân phối, cung cấp hàng hóa' },
  { ma: '2', ten: 'Dịch vụ, xây dựng không bao thầu nguyên vật liệu' },
  { ma: '2DT', ten: 'Hoạt động đặc thù (nhóm dịch vụ)' },
  { ma: 'LAI', ten: 'Lãi tiền gửi, tiền vay' },
  { ma: '3', ten: 'Sản xuất, vận tải, dịch vụ có gắn với hàng hóa, xây dựng có bao thầu nguyên vật liệu' },
  { ma: '4', ten: 'Hoạt động kinh doanh khác' },
]

const n1 = (so: number, ten: string): NganhNgheDn => ({ ma: `DN1-${so}`, ten, nhom: '1', gtgt: 1, tndn: 1 })
const n2 = (so: number, ten: string): NganhNgheDn => ({ ma: `DN2-${so}`, ten, nhom: '2', gtgt: 5, tndn: 5 })
const n3 = (so: number, ten: string): NganhNgheDn => ({ ma: `DN3-${so}`, ten, nhom: '3', gtgt: 3, tndn: 2 })
const n4 = (so: number, ten: string): NganhNgheDn => ({ ma: `DN4-${so}`, ten, nhom: '4', gtgt: 2, tndn: 2 })

export const NGANH_NGHE_DN: NganhNgheDn[] = [
  n1(1, 'Bán buôn, bán lẻ các loại hàng hóa (trừ giá trị hàng hóa đại lý bán đúng giá hưởng hoa hồng)'),
  n2(1, 'Lưu trú, kinh doanh khách sạn, nhà nghỉ, nhà trọ'),
  n2(2, 'Cho thuê nhà, đất, cửa hàng, nhà xưởng, tài sản, đồ dùng cá nhân'),
  n2(3, 'Cho thuê kho bãi, máy móc, phương tiện vận tải; bốc xếp hàng hóa'),
  n2(4, 'Bưu chính, chuyển phát thư tín, bưu kiện'),
  n2(5, 'Môi giới, đấu giá, hoa hồng đại lý'),
  n2(6, 'Tư vấn pháp luật, tài chính, kế toán, kiểm toán; thủ tục hành chính thuế, hải quan'),
  n2(7, 'Xử lý dữ liệu, cho thuê cổng thông tin, thiết bị CNTT, viễn thông'),
  n2(8, 'Hỗ trợ văn phòng và các dịch vụ hỗ trợ kinh doanh khác'),
  n2(9, 'Tắm hơi, massage, karaoke, vũ trường, bi-a, internet, game'),
  n2(10, 'May đo, giặt là; cắt tóc, làm đầu, gội đầu'),
  n2(11, 'Sửa chữa khác: sửa chữa máy vi tính, đồ dùng gia đình'),
  n2(12, 'Tư vấn, thiết kế, giám sát thi công xây dựng cơ bản'),
  n2(13, 'Các dịch vụ khác'),
  n2(14, 'Xây dựng, lắp đặt không bao thầu nguyên vật liệu'),
  { ma: 'DN2DT-1', ten: 'Hoạt động giáo dục, y tế, biểu diễn nghệ thuật', nhom: '2DT', gtgt: 5, tndn: 2 },
  { ma: 'DNLAI-1', ten: 'Lãi tiền gửi, lãi tiền cho vay', nhom: 'LAI', gtgt: null, tndn: 5 },
  n3(1, 'Sản xuất, gia công, chế biến sản phẩm hàng hóa'),
  n3(2, 'Khai thác, chế biến khoáng sản'),
  n3(3, 'Vận tải hàng hóa, vận tải hành khách'),
  n3(4, 'Dịch vụ kèm theo bán hàng hóa (đào tạo, bảo dưỡng, chuyển giao công nghệ)'),
  n3(5, 'Dịch vụ ăn uống'),
  n3(6, 'Sửa chữa, bảo dưỡng máy móc, thiết bị, phương tiện vận tải'),
  n3(7, 'Xây dựng, lắp đặt có bao thầu nguyên vật liệu'),
  n4(1, 'Sản xuất sản phẩm thuộc đối tượng tính thuế GTGT phương pháp khấu trừ mức 5%'),
  n4(2, 'Cung cấp dịch vụ thuộc đối tượng tính thuế GTGT phương pháp khấu trừ mức 5%'),
  n4(3, 'Các hoạt động khác chưa được liệt kê ở các nhóm trên'),
]

/** Ngành nghề mặc định của hàng hoá doanh nghiệp mẫu: món ăn, đồ uống pha chế; hàng mua về bán lại */
export const DN_AN_UONG = 'DN3-5'
export const DN_BAN_LE = 'DN1-1'

/** Ngành nghề doanh nghiệp theo mã, kèm tên nhóm để tự điền */
export function timNganhNgheDn(ma?: string): (NganhNgheDn & { tenNhom: string }) | undefined {
  const n = NGANH_NGHE_DN.find(x => x.ma === ma)
  return n && { ...n, tenNhom: NHOM_NGANH_DN.find(x => x.ma === n.nhom)?.ten ?? '' }
}

/** Tỷ lệ kiểu "1,5%" theo dấu thập phân đang chọn; null là "—" */
export const nhanTyLe = (n: number | null, dau = ','): string => n === null ? '—' : `${String(n).replace('.', dau)}%`
