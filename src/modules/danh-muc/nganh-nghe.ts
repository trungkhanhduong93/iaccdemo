// Nhóm ngành nghề tính thuế hộ kinh doanh theo tỷ lệ % trên doanh thu (T151)
// Chép từ iFaster (apitax catalog/business, 11/10/2026): 4 nhóm, 37 ngành nghề con. Tỷ lệ mẫu, chờ kế toán trưởng đối chiếu văn bản gốc (T04)

export interface NhomNganhNghe { ma: string; ten: string }
export interface NganhNgheCon { ma: string; ten: string; nhom: string; gtgt: number; tncn: number }   // nhom: mã nhóm ngành nghề; gtgt, tncn: % trên doanh thu

export const NHOM_NGANH_NGHE: NhomNganhNghe[] = [
  { ma: '1', ten: 'Phân phối, cung cấp hàng hóa' },
  { ma: '2', ten: 'Dịch vụ, xây dựng không bao thầu nguyên vật liệu' },
  { ma: '3', ten: 'Sản xuất, vận tải, dịch vụ có gắn với hàng hóa, xây dựng có bao thầu nguyên vật liệu' },
  { ma: '4', ten: 'Hoạt động kinh doanh khác' },
]

export const NGANH_NGHE_CON: NganhNgheCon[] = [
  { ma: '101-1', ten: 'Hoạt động bán buôn, bán lẻ các loại hàng hóa (trừ giá trị hàng hóa đại lý bán đúng giá hưởng hoa hồng)', nhom: '1', gtgt: 1, tncn: 0.5 },
  { ma: '101-2', ten: 'Khoản thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại, chiết khấu thanh toán, chi hỗ trợ bằng tiền hoặc không bằng tiền cho hộ khoán', nhom: '1', gtgt: 1, tncn: 0.5 },
  { ma: '102-1', ten: 'Hoạt động phân phối, cung cấp hàng hóa không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT', nhom: '1', gtgt: 0, tncn: 0.5 },
  { ma: '102-2', ten: 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu của hoạt động hợp tác kinh doanh theo quy định', nhom: '1', gtgt: 0, tncn: 0.5 },
  { ma: '102-3', ten: 'Khoản thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại, chiết khấu thanh toán, chi hỗ trợ bằng tiền hoặc không bằng tiền cho hộ khoán gắn với mua hàng hoá, dịch vụ thuộc đối tượng không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT', nhom: '1', gtgt: 0, tncn: 0.5 },
  { ma: '102-4', ten: 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác', nhom: '1', gtgt: 0, tncn: 0.5 },
  { ma: '201-1', ten: 'Dịch vụ lưu trú gồm: Hoạt động cung cấp cơ sở lưu trú ngắn hạn cho khách du lịch, khách vãng lai khác; hoạt động cung cấp cơ sở lưu trú dài hạn không phải là căn hộ cho sinh viên, công nhân và những đối tượng tương tự; hoạt động cung cấp cơ sở lưu trú cùng dịch vụ ăn uống hoặc các phương tiện giải trí', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-2', ten: 'Dịch vụ bốc xếp hàng hóa và hoạt động dịch vụ hỗ trợ khác liên quan đến vận tải như kinh doanh bến bãi, bán vé, trông giữ phương tiện', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-3', ten: 'Dịch vụ bưu chính, chuyển phát thư tín và bưu kiện', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-4', ten: 'Dịch vụ môi giới, đấu giá và hoa hồng đại lý', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-5', ten: 'Dịch vụ tư vấn pháp luật, tư vấn tài chính, kế toán, kiểm toán; dịch vụ làm thủ tục hành chính thuế, hải quan', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-6', ten: 'Dịch vụ xử lý dữ liệu, cho thuê cổng thông tin, thiết bị công nghệ thông tin, viễn thông; quảng cáo trên sản phẩm, dịch vụ nội dung thông tin số', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-7', ten: 'Dịch vụ hỗ trợ văn phòng và các dịch vụ hỗ trợ kinh doanh khác', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-8', ten: 'Dịch vụ tắm hơi, massage, karaoke, vũ trường, bi-a, internet, game', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-9', ten: 'Dịch vụ may đo, giặt là; cắt tóc, làm đầu, gội đầu', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-11', ten: 'Dịch vụ tư vấn, thiết kế, giám sát thi công xây dựng cơ bản', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-12', ten: 'Các dịch vụ khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ với mức thuế suất thuế GTGT 10%', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '201-13', ten: 'Xây dựng, lắp đặt không bao thầu nguyên vật liệu (bao gồm cả lắp đặt máy móc, thiết bị công nghiệp)', nhom: '2', gtgt: 5, tncn: 2 },
  { ma: '202-1', ten: 'Hoạt động cung cấp dịch vụ không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT', nhom: '2', gtgt: 0, tncn: 2 },
  { ma: '202-2', ten: 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu của hoạt động hợp tác kinh doanh theo quy định', nhom: '2', gtgt: 0, tncn: 2 },
  { ma: '202-3', ten: 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác', nhom: '2', gtgt: 0, tncn: 2 },
  { ma: '203', ten: 'Cho thuê tài sản gồm:\n+ Cho thuê nhà, đất, cửa hàng, nhà xưởng, kho bãi trừ dịch vụ lưu trú\n+ Cho thuê phương tiện vận tải, máy móc thiết bị không kèm theo người điều khiển\n+ Cho thuê tài sản khác không kèm theo dịch vụ', nhom: '2', gtgt: 5, tncn: 5 },
  { ma: '204-1', ten: 'Làm đại lý xổ số, đại lý bảo hiểm, bán hàng đa cấp', nhom: '2', gtgt: 0, tncn: 5 },
  { ma: '204-2', ten: 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác', nhom: '2', gtgt: 0, tncn: 5 },
  { ma: '301-5', ten: 'Dịch vụ ăn uống', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '301-1', ten: 'Sản xuất, gia công, chế biến sản phẩm hàng hóa', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '301-2', ten: 'Khai thác, chế biến khoáng sản', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '301-3', ten: 'Vận tải hàng hóa, vận tải hành khách', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '301-4', ten: 'Dịch vụ kèm theo bán hàng hóa như dịch vụ đào tạo, bảo dưỡng, chuyển giao công nghệ kèm theo bán sản phẩm', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '301-6', ten: 'Dịch vụ sửa chữa và bảo dưỡng máy móc thiết bị, phương tiện vận tải, ô tô, mô tô, xe máy và xe có động cơ khác', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '301-7', ten: 'Xây dựng, lắp đặt có bao thầu nguyên vật liệu (bao gồm cả lắp đặt máy móc, thiết bị công nghiệp)', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '301-8', ten: 'Hoạt động khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ với mức thuế suất thuế GTGT 10%', nhom: '3', gtgt: 3, tncn: 1.5 },
  { ma: '302-1', ten: 'Hoạt động không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT', nhom: '3', gtgt: 0, tncn: 1.5 },
  { ma: '302-2', ten: 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu của hoạt động hợp tác kinh doanh theo quy định', nhom: '3', gtgt: 0, tncn: 1.5 },
  { ma: '401', ten: 'Hoạt động sản xuất các sản phẩm thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ với mức thuế suất thuế GTGT 5%', nhom: '4', gtgt: 2, tncn: 1 },
  { ma: '402', ten: 'Hoạt động cung cấp các dịch vụ thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ với mức thuế suất thuế GTGT 5%', nhom: '4', gtgt: 2, tncn: 1 },
  { ma: '403', ten: 'Hoạt động khác chưa được liệt kê ở các nhóm 1, 2, 3 nêu trên', nhom: '4', gtgt: 2, tncn: 1 },
]

/** Ngành nghề con theo mã, kèm tên nhóm ngành nghề để tự điền */
export function timNganhNghe(ma?: string): (NganhNgheCon & { tenNhom: string }) | undefined {
  const n = NGANH_NGHE_CON.find(x => x.ma === ma)
  return n && { ...n, tenNhom: NHOM_NGANH_NGHE.find(x => x.ma === n.nhom)?.ten ?? '' }
}
