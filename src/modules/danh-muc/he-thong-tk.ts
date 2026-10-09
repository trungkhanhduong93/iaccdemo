// Hệ thống tài khoản cấp 1, 2 (và cấp 3 hay dùng) theo chế độ kế toán, cho danh mục 1.1 (T69).
// TT133: theo phụ lục 1 Thông tư 133/2016/TT-BTC. TT99: dựng theo khung tài khoản Thông tư 200/2014/TT-BTC mà TT99/2025 thay thế,
// chưa đối chiếu văn bản gốc TT99, chờ kế toán trưởng duyệt (T04). TT152, TT58 không có màn 1.1 (gói Free, Standard).
// Mỗi dòng: "số|tên|tính chất". Tính chất bỏ trống thì lấy của tài khoản cha, không có cha thì theo đầu số:
// 1, 2 Dư Nợ; 3, 4 Dư Có; 5 đến 9 Không số dư. N Dư Nợ, C Dư Có, L Lưỡng tính, K Không số dư.
import type { CheDo } from '../../app/che-do'

export type TinhChatTk = 'Dư Nợ' | 'Dư Có' | 'Lưỡng tính' | 'Không số dư'
export interface TaiKhoanDef {
  so: string; ten: string; cap: number; cha?: string; laCha: boolean
  tinhChat: TinhChatTk; loai: string
}

const TT133 = `
111|Tiền mặt
1111|Tiền Việt Nam
1112|Ngoại tệ
1113|Vàng tiền tệ
112|Tiền gửi ngân hàng
1121|Tiền Việt Nam
1122|Ngoại tệ
1123|Vàng tiền tệ
121|Chứng khoán kinh doanh
128|Đầu tư nắm giữ đến ngày đáo hạn
1281|Tiền gửi có kỳ hạn
1288|Các khoản đầu tư khác nắm giữ đến ngày đáo hạn
131|Phải thu của khách hàng|L
133|Thuế GTGT được khấu trừ
1331|Thuế GTGT được khấu trừ của hàng hoá, dịch vụ
1332|Thuế GTGT được khấu trừ của tài sản cố định
136|Phải thu nội bộ
1361|Vốn kinh doanh ở đơn vị trực thuộc
1368|Phải thu nội bộ khác
138|Phải thu khác|L
1381|Tài sản thiếu chờ xử lý
1386|Cầm cố, thế chấp, ký quỹ, ký cược
1388|Phải thu khác
141|Tạm ứng
151|Hàng mua đang đi đường
152|Nguyên liệu, vật liệu
153|Công cụ, dụng cụ
154|Chi phí sản xuất, kinh doanh dở dang
155|Thành phẩm
156|Hàng hoá
157|Hàng gửi đi bán
211|Tài sản cố định
2111|Tài sản cố định hữu hình
2112|Tài sản cố định thuê tài chính
2113|Tài sản cố định vô hình
214|Hao mòn tài sản cố định|C
2141|Hao mòn tài sản cố định hữu hình
2142|Hao mòn tài sản cố định thuê tài chính
2143|Hao mòn tài sản cố định vô hình
2147|Hao mòn bất động sản đầu tư
217|Bất động sản đầu tư
228|Đầu tư góp vốn vào đơn vị khác
2281|Đầu tư vào công ty liên doanh, liên kết
2288|Đầu tư khác
229|Dự phòng tổn thất tài sản|C
2291|Dự phòng giảm giá chứng khoán kinh doanh
2292|Dự phòng tổn thất đầu tư vào đơn vị khác
2293|Dự phòng phải thu khó đòi
2294|Dự phòng giảm giá hàng tồn kho
241|Xây dựng cơ bản dở dang
2411|Mua sắm tài sản cố định
2412|Xây dựng cơ bản
2413|Sửa chữa lớn tài sản cố định
242|Chi phí trả trước
331|Phải trả cho người bán|L
333|Thuế và các khoản phải nộp Nhà nước
3331|Thuế giá trị gia tăng phải nộp
33311|Thuế GTGT đầu ra
33312|Thuế GTGT hàng nhập khẩu
3332|Thuế tiêu thụ đặc biệt
3333|Thuế xuất, nhập khẩu
3334|Thuế thu nhập doanh nghiệp
3335|Thuế thu nhập cá nhân
3336|Thuế tài nguyên
3337|Thuế nhà đất, tiền thuê đất
3338|Thuế bảo vệ môi trường và các loại thuế khác
33381|Thuế bảo vệ môi trường
33382|Các loại thuế khác
3339|Phí, lệ phí và các khoản phải nộp khác
334|Phải trả người lao động
335|Chi phí phải trả
336|Phải trả nội bộ
3361|Phải trả nội bộ về vốn kinh doanh
3368|Phải trả nội bộ khác
338|Phải trả, phải nộp khác|L
3381|Tài sản thừa chờ giải quyết
3382|Kinh phí công đoàn
3383|Bảo hiểm xã hội
3384|Bảo hiểm y tế
3385|Bảo hiểm thất nghiệp
3386|Nhận ký quỹ, ký cược
3387|Doanh thu chưa thực hiện
3388|Phải trả, phải nộp khác
341|Vay và nợ thuê tài chính
3411|Các khoản đi vay
3412|Nợ thuê tài chính
352|Dự phòng phải trả
3521|Dự phòng bảo hành sản phẩm hàng hoá
3522|Dự phòng bảo hành công trình xây dựng
3524|Dự phòng phải trả khác
353|Quỹ khen thưởng phúc lợi
3531|Quỹ khen thưởng
3532|Quỹ phúc lợi
3533|Quỹ phúc lợi đã hình thành tài sản cố định
3534|Quỹ thưởng ban quản lý điều hành công ty
356|Quỹ phát triển khoa học và công nghệ
3561|Quỹ phát triển khoa học và công nghệ
3562|Quỹ phát triển khoa học và công nghệ đã hình thành tài sản cố định
411|Vốn đầu tư của chủ sở hữu
4111|Vốn góp của chủ sở hữu
4112|Thặng dư vốn cổ phần
4118|Vốn khác
413|Chênh lệch tỷ giá hối đoái|L
418|Các quỹ thuộc vốn chủ sở hữu
419|Cổ phiếu quỹ|N
421|Lợi nhuận sau thuế chưa phân phối|L
4211|Lợi nhuận sau thuế chưa phân phối năm trước
4212|Lợi nhuận sau thuế chưa phân phối năm nay
511|Doanh thu bán hàng và cung cấp dịch vụ
5111|Doanh thu bán hàng hoá
5112|Doanh thu bán thành phẩm
5113|Doanh thu cung cấp dịch vụ
5118|Doanh thu khác
515|Doanh thu hoạt động tài chính
611|Mua hàng
631|Giá thành sản xuất
632|Giá vốn hàng bán
635|Chi phí tài chính
642|Chi phí quản lý kinh doanh
6421|Chi phí bán hàng
6422|Chi phí quản lý doanh nghiệp
711|Thu nhập khác
811|Chi phí khác
821|Chi phí thuế thu nhập doanh nghiệp
911|Xác định kết quả kinh doanh
`

const TT99 = `
111|Tiền mặt
1111|Tiền Việt Nam
1112|Ngoại tệ
1113|Vàng tiền tệ
112|Tiền gửi ngân hàng
1121|Tiền Việt Nam
1122|Ngoại tệ
1123|Vàng tiền tệ
113|Tiền đang chuyển
1131|Tiền Việt Nam
1132|Ngoại tệ
121|Chứng khoán kinh doanh
1211|Cổ phiếu
1212|Trái phiếu
1218|Chứng khoán và công cụ tài chính khác
128|Đầu tư nắm giữ đến ngày đáo hạn
1281|Tiền gửi có kỳ hạn
1282|Trái phiếu
1283|Cho vay
1288|Các khoản đầu tư khác nắm giữ đến ngày đáo hạn
131|Phải thu của khách hàng|L
133|Thuế GTGT được khấu trừ
1331|Thuế GTGT được khấu trừ của hàng hoá, dịch vụ
1332|Thuế GTGT được khấu trừ của tài sản cố định
136|Phải thu nội bộ
1361|Vốn kinh doanh ở đơn vị trực thuộc
1362|Phải thu nội bộ về chênh lệch tỷ giá
1363|Phải thu nội bộ về chi phí đi vay đủ điều kiện được vốn hoá
1368|Phải thu nội bộ khác
138|Phải thu khác|L
1381|Tài sản thiếu chờ xử lý
1385|Phải thu về cổ phần hoá
1388|Phải thu khác
141|Tạm ứng
151|Hàng mua đang đi đường
152|Nguyên liệu, vật liệu
153|Công cụ, dụng cụ
1531|Công cụ, dụng cụ
1532|Bao bì luân chuyển
1533|Đồ dùng cho thuê
1534|Thiết bị, phụ tùng thay thế
154|Chi phí sản xuất, kinh doanh dở dang
155|Thành phẩm
1551|Thành phẩm nhập kho
1557|Thành phẩm bất động sản
156|Hàng hoá
1561|Giá mua hàng hoá
1562|Chi phí thu mua hàng hoá
1567|Hàng hoá bất động sản
157|Hàng gửi đi bán
158|Hàng hoá kho bảo thuế
161|Chi sự nghiệp
1611|Chi sự nghiệp năm trước
1612|Chi sự nghiệp năm nay
171|Giao dịch mua bán lại trái phiếu Chính phủ
211|Tài sản cố định hữu hình
2111|Nhà cửa, vật kiến trúc
2112|Máy móc, thiết bị
2113|Phương tiện vận tải, truyền dẫn
2114|Thiết bị, dụng cụ quản lý
2115|Cây lâu năm, súc vật làm việc và cho sản phẩm
2118|Tài sản cố định khác
212|Tài sản cố định thuê tài chính
2121|Tài sản cố định hữu hình thuê tài chính
2122|Tài sản cố định vô hình thuê tài chính
213|Tài sản cố định vô hình
2131|Quyền sử dụng đất
2132|Quyền phát hành
2133|Bản quyền, bằng sáng chế
2134|Nhãn hiệu, tên thương mại
2135|Chương trình phần mềm
2136|Giấy phép và giấy phép nhượng quyền
2138|Tài sản cố định vô hình khác
214|Hao mòn tài sản cố định|C
2141|Hao mòn tài sản cố định hữu hình
2142|Hao mòn tài sản cố định thuê tài chính
2143|Hao mòn tài sản cố định vô hình
2147|Hao mòn bất động sản đầu tư
217|Bất động sản đầu tư
221|Đầu tư vào công ty con
222|Đầu tư vào công ty liên doanh, liên kết
228|Đầu tư khác
2281|Đầu tư góp vốn vào đơn vị khác
2288|Đầu tư khác
229|Dự phòng tổn thất tài sản|C
2291|Dự phòng giảm giá chứng khoán kinh doanh
2292|Dự phòng tổn thất đầu tư vào đơn vị khác
2293|Dự phòng phải thu khó đòi
2294|Dự phòng giảm giá hàng tồn kho
241|Xây dựng cơ bản dở dang
2411|Mua sắm tài sản cố định
2412|Xây dựng cơ bản
2413|Sửa chữa lớn tài sản cố định
242|Chi phí trả trước
243|Tài sản thuế thu nhập hoãn lại
244|Cầm cố, thế chấp, ký quỹ, ký cược
331|Phải trả cho người bán|L
333|Thuế và các khoản phải nộp Nhà nước
3331|Thuế giá trị gia tăng phải nộp
33311|Thuế GTGT đầu ra
33312|Thuế GTGT hàng nhập khẩu
3332|Thuế tiêu thụ đặc biệt
3333|Thuế xuất, nhập khẩu
3334|Thuế thu nhập doanh nghiệp
3335|Thuế thu nhập cá nhân
3336|Thuế tài nguyên
3337|Thuế nhà đất, tiền thuê đất
3338|Thuế bảo vệ môi trường và các loại thuế khác
33381|Thuế bảo vệ môi trường
33382|Các loại thuế khác
3339|Phí, lệ phí và các khoản phải nộp khác
334|Phải trả người lao động
3341|Phải trả công nhân viên
3348|Phải trả người lao động khác
335|Chi phí phải trả
336|Phải trả nội bộ
3361|Phải trả nội bộ về vốn kinh doanh
3362|Phải trả nội bộ về chênh lệch tỷ giá
3363|Phải trả nội bộ về chi phí đi vay đủ điều kiện được vốn hoá
3368|Phải trả nội bộ khác
337|Thanh toán theo tiến độ kế hoạch hợp đồng xây dựng|L
338|Phải trả, phải nộp khác|L
3381|Tài sản thừa chờ giải quyết
3382|Kinh phí công đoàn
3383|Bảo hiểm xã hội
3384|Bảo hiểm y tế
3385|Phải trả về cổ phần hoá
3386|Bảo hiểm thất nghiệp
3387|Doanh thu chưa thực hiện
3388|Phải trả, phải nộp khác
341|Vay và nợ thuê tài chính
3411|Các khoản đi vay
3412|Nợ thuê tài chính
343|Trái phiếu phát hành
3431|Trái phiếu thường
3432|Trái phiếu chuyển đổi
344|Nhận ký quỹ, ký cược
347|Thuế thu nhập hoãn lại phải trả
352|Dự phòng phải trả
3521|Dự phòng bảo hành sản phẩm hàng hoá
3522|Dự phòng bảo hành công trình xây dựng
3523|Dự phòng tái cơ cấu doanh nghiệp
3524|Dự phòng phải trả khác
353|Quỹ khen thưởng phúc lợi
3531|Quỹ khen thưởng
3532|Quỹ phúc lợi
3533|Quỹ phúc lợi đã hình thành tài sản cố định
3534|Quỹ thưởng ban quản lý điều hành công ty
356|Quỹ phát triển khoa học và công nghệ
3561|Quỹ phát triển khoa học và công nghệ
3562|Quỹ phát triển khoa học và công nghệ đã hình thành tài sản cố định
357|Quỹ bình ổn giá
411|Vốn đầu tư của chủ sở hữu
4111|Vốn góp của chủ sở hữu
4112|Thặng dư vốn cổ phần
4113|Quyền chọn chuyển đổi trái phiếu
4118|Vốn khác
412|Chênh lệch đánh giá lại tài sản|L
413|Chênh lệch tỷ giá hối đoái|L
4131|Chênh lệch tỷ giá do đánh giá lại các khoản mục tiền tệ có gốc ngoại tệ
4132|Chênh lệch tỷ giá hối đoái trong giai đoạn trước hoạt động
414|Quỹ đầu tư phát triển
417|Quỹ hỗ trợ sắp xếp doanh nghiệp
418|Các quỹ khác thuộc vốn chủ sở hữu
419|Cổ phiếu quỹ|N
421|Lợi nhuận sau thuế chưa phân phối|L
4211|Lợi nhuận sau thuế chưa phân phối năm trước
4212|Lợi nhuận sau thuế chưa phân phối năm nay
441|Nguồn vốn đầu tư xây dựng cơ bản
461|Nguồn kinh phí sự nghiệp
4611|Nguồn kinh phí sự nghiệp năm trước
4612|Nguồn kinh phí sự nghiệp năm nay
466|Nguồn kinh phí đã hình thành tài sản cố định
511|Doanh thu bán hàng và cung cấp dịch vụ
5111|Doanh thu bán hàng hoá
5112|Doanh thu bán thành phẩm
5113|Doanh thu cung cấp dịch vụ
5114|Doanh thu trợ cấp, trợ giá
5117|Doanh thu kinh doanh bất động sản đầu tư
5118|Doanh thu khác
515|Doanh thu hoạt động tài chính
521|Các khoản giảm trừ doanh thu
5211|Chiết khấu thương mại
5212|Hàng bán bị trả lại
5213|Giảm giá hàng bán
611|Mua hàng
6111|Mua nguyên liệu, vật liệu
6112|Mua hàng hoá
621|Chi phí nguyên liệu, vật liệu trực tiếp
622|Chi phí nhân công trực tiếp
623|Chi phí sử dụng máy thi công
627|Chi phí sản xuất chung
6271|Chi phí nhân viên phân xưởng
6272|Chi phí vật liệu
6273|Chi phí dụng cụ sản xuất
6274|Chi phí khấu hao tài sản cố định
6277|Chi phí dịch vụ mua ngoài
6278|Chi phí bằng tiền khác
631|Giá thành sản xuất
632|Giá vốn hàng bán
635|Chi phí tài chính
641|Chi phí bán hàng
6411|Chi phí nhân viên
6412|Chi phí nguyên vật liệu, bao bì
6413|Chi phí dụng cụ, đồ dùng
6414|Chi phí khấu hao tài sản cố định
6415|Chi phí bảo hành
6417|Chi phí dịch vụ mua ngoài
6418|Chi phí bằng tiền khác
642|Chi phí quản lý doanh nghiệp
6421|Chi phí nhân viên quản lý
6422|Chi phí vật liệu quản lý
6423|Chi phí đồ dùng văn phòng
6424|Chi phí khấu hao tài sản cố định
6425|Thuế, phí và lệ phí
6426|Chi phí dự phòng
6427|Chi phí dịch vụ mua ngoài
6428|Chi phí bằng tiền khác
711|Thu nhập khác
811|Chi phí khác
821|Chi phí thuế thu nhập doanh nghiệp
8211|Chi phí thuế thu nhập doanh nghiệp hiện hành
8212|Chi phí thuế thu nhập doanh nghiệp hoãn lại
911|Xác định kết quả kinh doanh
`

const TC: Record<string, TinhChatTk> = { N: 'Dư Nợ', C: 'Dư Có', L: 'Lưỡng tính', K: 'Không số dư' }
const LOAI: Record<string, string> = {
  '1': 'Tài sản ngắn hạn', '2': 'Tài sản dài hạn', '3': 'Nợ phải trả', '4': 'Vốn chủ sở hữu', '5': 'Doanh thu',
  '6': 'Chi phí sản xuất, kinh doanh', '7': 'Thu nhập khác', '8': 'Chi phí khác', '9': 'Xác định kết quả kinh doanh',
}
const tcTheoDau = (so: string): TinhChatTk => so[0] === '1' || so[0] === '2' ? 'Dư Nợ' : so[0] === '3' || so[0] === '4' ? 'Dư Có' : 'Không số dư'

function dung(nguon: string): TaiKhoanDef[] {
  const dong = nguon.trim().split('\n').map(l => l.split('|'))
  const theoSo = new Map<string, TaiKhoanDef>()
  const out: TaiKhoanDef[] = []
  for (const [so, ten, ma] of dong) {
    // Tài khoản cha là tài khoản đứng trước có số là tiền tố dài nhất
    let cha: TaiKhoanDef | undefined
    for (let n = so.length - 1; n >= 3 && !cha; n--) cha = theoSo.get(so.slice(0, n))
    const tk: TaiKhoanDef = {
      so, ten, cap: cha ? cha.cap + 1 : 1, cha: cha?.so, laCha: false,
      tinhChat: ma ? TC[ma] : cha ? cha.tinhChat : tcTheoDau(so), loai: LOAI[so[0]],
    }
    if (cha) cha.laCha = true
    theoSo.set(so, tk)
    out.push(tk)
  }
  return out
}

const CACHE: Partial<Record<CheDo, TaiKhoanDef[]>> = {}
/** Hệ thống tài khoản của chế độ kế toán đang chọn. TT152, TT58 không dùng màn 1.1 nên lấy theo TT133 */
export function heThongTk(cd: CheDo): TaiKhoanDef[] {
  const k: CheDo = cd === 'TT99' ? 'TT99' : 'TT133'
  return CACHE[k] ??= dung(k === 'TT99' ? TT99 : TT133)
}
