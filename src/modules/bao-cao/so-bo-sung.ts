// Sổ bổ sung theo thông tư (T47, kế hoạch mục 7.1, 7.3). Số liệu đọc từ nguồn có sẵn.
import type { Col, ReportCfg, Row } from '../types'
import { soCai } from '../tong-hop/so-cai'
import { CHI_NHANH, NVL, daysOf, kqkd, tongKy } from '../../data/mock'
import { between, pad, rng } from '../../ui/format'
import { DS_TSCD } from '../tscd/data'

// ── 2.2.6 Sổ chi tiết tiền vay (TK 341) ──
const cols226: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 95 },
  { k: 'so', t: 'Số chứng từ', cls: 'code', w: 130 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'tk', t: 'TK đối ứng', c: true, w: 90 },
  { k: 'no', t: 'Phát sinh Nợ', num: true },
  { k: 'co', t: 'Phát sinh Có', num: true },
  { k: 'du', t: 'Số dư', num: true },
]

function rows226(thang: number): Row[] {
  const sc = soCai(thang)
  const du0 = -sc.mo['341']
  let du = du0
  let tongNo = 0
  let tongCo = 0
  const rows: Row[] = [
    { dienGiai: 'Số dư đầu kỳ', du: du0, _b: 1 },
  ]
  for (const b of sc.bt) {
    if (b[0] === '341' || b[1] === '341') {
      const no = b[0] === '341' ? b[2] : 0
      const co = b[1] === '341' ? b[2] : 0
      const tk = b[0] === '341' ? b[1] : b[0]
      du = du - no + co
      tongNo += no
      tongCo += co
      rows.push({
        ngay: `${pad(25)}/${pad(thang)}/2026`,
        so: `UNC26${pad(thang)}-0025`,
        dienGiai: no > 0 ? 'Trả nợ gốc khế ước HĐV-2025-01 Vietcombank' : 'Vay theo khế ước HĐV-2025-01 Vietcombank',
        tk,
        no,
        co,
        du,
      })
    }
  }
  rows.push({ dienGiai: 'Cộng phát sinh', no: tongNo, co: tongCo, _t: 1 })
  rows.push({ dienGiai: 'Số dư cuối kỳ', du: -sc.cuoi['341'], _t: 1 })
  return rows
}

// ── 2.2.7 Sổ chi tiết tiền (Tiền mặt và tiền gửi ngân hàng chung) ──
const cols227: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 95 },
  { k: 'so', t: 'Số CT', cls: 'code', w: 130 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'loaiTien', t: 'Loại tiền', c: true, w: 100 },
  { k: 'thu', t: 'Thu', num: true },
  { k: 'chi', t: 'Chi', num: true },
  { k: 'ton', t: 'Tồn', num: true },
]

function rows227(thang: number): Row[] {
  const sc = soCai(thang)
  const dauKy = (sc.mo['1111'] ?? 0) + (sc.mo['1121'] ?? 0)
  let ton = dauKy
  let tongThu = 0
  let tongChi = 0
  const rows: Row[] = [
    { dienGiai: 'Số dư đầu kỳ', ton: dauKy, _b: 1 },
  ]
  let ctIdx = 1
  for (const b of sc.bt) {
    const [tkNo, tkCo, tien, nhom] = b
    if (tkNo === '1121' && tkCo === '1111') {
      ton -= tien
      tongChi += tien
      rows.push({
        ngay: `${pad(Math.min(28, ctIdx * 2))}/${pad(thang)}/2026`,
        so: `PC26${pad(thang)}-${pad(ctIdx++, 4)}`,
        dienGiai: 'Nộp tiền bán hàng vào tài khoản ngân hàng',
        loaiTien: 'Tiền mặt',
        thu: 0,
        chi: tien,
        ton,
      })
      ton += tien
      tongThu += tien
      rows.push({
        ngay: `${pad(Math.min(28, ctIdx * 2))}/${pad(thang)}/2026`,
        so: `BC26${pad(thang)}-${pad(ctIdx++, 4)}`,
        dienGiai: 'Thu nộp tiền bán hàng vào tài khoản ngân hàng',
        loaiTien: 'Ngân hàng',
        thu: tien,
        chi: 0,
        ton,
      })
    } else if (tkNo === '1111' || tkCo === '1111' || tkNo === '1121' || tkCo === '1121') {
      const isThu = tkNo === '1111' || tkNo === '1121'
      const loaiTien = (tkNo === '1111' || tkCo === '1111') ? 'Tiền mặt' : 'Ngân hàng'
      const thu = isThu ? tien : 0
      const chi = isThu ? 0 : tien
      ton = ton + thu - chi
      tongThu += thu
      tongChi += chi
      const prefix = loaiTien === 'Tiền mặt' ? (isThu ? 'PT' : 'PC') : (isThu ? 'BC' : 'UNC')
      let dg = 'Thu chi tiền'
      if (nhom === 'thu') dg = loaiTien === 'Tiền mặt' ? 'Thu tiền bán hàng bằng tiền mặt' : 'Thu tiền bán hàng chuyển khoản, thẻ, app'
      else if (nhom === 'trancc') dg = 'Chi trả tiền nhà cung cấp qua ngân hàng'
      else if (nhom === 'luong') dg = 'Chi trả lương nhân viên qua ngân hàng'
      else if (nhom === 'chikhac') dg = 'Chi phí hoạt động khác bằng tiền mặt'
      else if (nhom === 'tc') dg = 'Thu lãi tiền gửi ngân hàng'
      else if (nhom === 'laivay') dg = 'Chi trả lãi vay ngân hàng'
      else if (nhom === 'thukhac') dg = 'Thu nhập khác bằng tiền mặt'
      else if (nhom === 'travay') dg = 'Chi trả nợ gốc vay ngân hàng'
      else if (nhom === 'thuetruoc') dg = 'Chi trả trước tiền thuê mặt bằng'

      rows.push({
        ngay: `${pad(Math.min(28, ctIdx * 2))}/${pad(thang)}/2026`,
        so: `${prefix}26${pad(thang)}-${pad(ctIdx++, 4)}`,
        dienGiai: dg,
        loaiTien,
        thu,
        chi,
        ton,
      })
    }
  }
  rows.push({ dienGiai: 'Cộng phát sinh', thu: tongThu, chi: tongChi, _t: 1 })
  rows.push({ dienGiai: 'Số dư cuối kỳ', ton: (sc.cuoi['1111'] ?? 0) + (sc.cuoi['1121'] ?? 0), _t: 1 })
  return rows
}

// ── 3.2.5 Sổ doanh thu bán hàng ──
const cols325: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 95 },
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'dt', t: 'Doanh thu chưa thuế', num: true },
  { k: 'vat', t: 'Thuế GTGT', num: true },
  { k: 'tong', t: 'Tổng thu', num: true },
]

function rows325(thang: number): Row[] {
  const ds = daysOf(thang, 2026)
  const ngayMap = new Map<number, { date: Date; dt: number; vat: number }>()
  for (const x of ds) {
    const d = x.date.getDate()
    const cur = ngayMap.get(d)
    if (!cur) ngayMap.set(d, { date: x.date, dt: x.dt, vat: x.vat })
    else { cur.dt += x.dt; cur.vat += x.vat }
  }
  const sorted = Array.from(ngayMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  let tongDt = 0
  let tongVat = 0
  const rows: Row[] = sorted.map(x => {
    const d = x.date.getDate()
    const ddmm = `${pad(d)}${pad(thang)}`
    tongDt += x.dt
    tongVat += x.vat
    return {
      ngay: `${pad(d)}/${pad(thang)}/2026`,
      so: `BH${ddmm}`,
      dienGiai: `Doanh thu bán hàng ngày ${pad(d)}/${pad(thang)}`,
      dt: x.dt,
      vat: x.vat,
      tong: x.dt + x.vat,
    }
  })
  rows.push({
    dienGiai: 'Tổng cộng',
    dt: tongDt,
    vat: tongVat,
    tong: tongDt + tongVat,
    _t: 1,
  })
  return rows
}

// ── 5.2.8 Sổ chi tiết vật liệu, dụng cụ, hàng hoá ──
const cols528: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 90 },
  { k: 'so', t: 'Số CT', cls: 'code', w: 120 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'donGia', t: 'Đơn giá', num: true },
  { k: 'nhapSl', t: 'Nhập SL', num: true },
  { k: 'nhapTien', t: 'Nhập tiền', num: true },
  { k: 'xuatSl', t: 'Xuất SL', num: true },
  { k: 'xuatTien', t: 'Xuất tiền', num: true },
  { k: 'tonSl', t: 'Tồn SL', num: true },
  { k: 'tonTien', t: 'Tồn tiền', num: true },
]

function rows528(thang: number): Row[] {
  const gia = NVL[0].gia
  const r = rng('5.2.8' + thang)
  let tonSl = 18.5
  let tonTien = Math.round(tonSl * gia)
  let tongNhapSl = 0
  let tongNhapTien = 0
  let tongXuatSl = 0
  let tongXuatTien = 0
  const dim = thang === 10 ? 7 : 30
  const rows: Row[] = [
    { dienGiai: `${NVL[0].ten} · ĐVT: ${NVL[0].dvt} (Mã: ${NVL[0].ma})`, _b: 1 },
    { dienGiai: 'Tồn đầu kỳ', tonSl, tonTien, _b: 1 },
  ]
  for (let d = 1; d <= dim; d++) {
    if (d % 3 === 1) {
      const nSl = Math.round(between(r, 20, 30))
      const nTien = nSl * gia
      tonSl += nSl
      tonTien += nTien
      tongNhapSl += nSl
      tongNhapTien += nTien
      rows.push({
        ngay: `${pad(d)}/${pad(thang)}/2026`,
        so: `MH26${pad(thang)}-${pad(d * 7, 4)}`,
        dienGiai: 'Nhập mua từ Thực phẩm Tươi An Phú',
        donGia: gia,
        nhapSl: nSl,
        nhapTien: nTien,
        tonSl,
        tonTien,
      })
    }
    const xSl = Math.round(between(r, 6.5, 9.5) * 10) / 10
    const xTien = Math.round(xSl * gia)
    tonSl = Math.round((tonSl - xSl) * 10) / 10
    tonTien = Math.round(tonSl * gia)
    tongXuatSl = Math.round((tongXuatSl + xSl) * 10) / 10
    tongXuatTien += xTien
    rows.push({
      ngay: `${pad(d)}/${pad(thang)}/2026`,
      so: `XB26${pad(thang)}-Q1-${pad(d)}`,
      dienGiai: 'Xuất bán POS theo định lượng',
      donGia: gia,
      xuatSl: xSl,
      xuatTien: xTien,
      tonSl,
      tonTien,
    })
  }
  rows.push({
    dienGiai: 'Cộng phát sinh',
    nhapSl: tongNhapSl,
    nhapTien: tongNhapTien,
    xuatSl: tongXuatSl,
    xuatTien: tongXuatTien,
    _t: 1,
  })
  rows.push({
    dienGiai: 'Tồn cuối kỳ',
    tonSl,
    tonTien,
    _t: 1,
  })
  return rows
}

// ── 6.2.4 Sổ theo dõi nghĩa vụ thuế GTGT ──
const cols624: Col[] = [
  { k: 'dienGiai', t: 'Kỳ / Tuần theo dõi' },
  { k: 'dauRa', t: 'Thuế GTGT đầu ra phát sinh', num: true },
  { k: 'dauVao', t: 'Thuế GTGT đầu vào được khấu trừ', num: true },
  { k: 'khauTru', t: 'Số thuế đã khấu trừ', num: true },
  { k: 'phaiNop', t: 'Còn phải nộp', num: true },
]

function rows624(thang: number): Row[] {
  const tk = tongKy(thang, 2026)
  const sc = soCai(thang)
  const tongDauRa = tk.vat
  const tongDauVao = sc.no['1331'] ?? 0
  const tongKhauTru = Math.min(tongDauRa, tongDauVao)
  const tongPhaiNop = Math.max(0, tongDauRa - tongDauVao)

  const ranhGioi = thang === 10 ? [[1, 7]] : [[1, 7], [8, 14], [15, 21], [22, 28], [29, 30]]
  let luyKeDauVao = 0
  let luyKeKhauTru = 0
  let luyKePhaiNop = 0
  const rows: Row[] = ranhGioi.map(([tu, den], idx) => {
    const isCuoi = idx === ranhGioi.length - 1
    const vatTuan = daysOf(thang, 2026)
      .filter(x => x.date.getDate() >= tu && x.date.getDate() <= den)
      .reduce((a, x) => a + x.vat, 0)
    const dauVao = isCuoi
      ? tongDauVao - luyKeDauVao
      : Math.round(tongDauVao * (vatTuan / (tongDauRa || 1)))
    luyKeDauVao += dauVao
    const khauTru = isCuoi
      ? tongKhauTru - luyKeKhauTru
      : Math.min(vatTuan, dauVao)
    luyKeKhauTru += khauTru
    const phaiNop = isCuoi
      ? tongPhaiNop - luyKePhaiNop
      : Math.max(0, vatTuan - khauTru)
    luyKePhaiNop += phaiNop

    return {
      dienGiai: `Tuần ${idx + 1} (${pad(tu)}/${pad(thang)} – ${pad(den)}/${pad(thang)})`,
      dauRa: vatTuan,
      dauVao,
      khauTru,
      phaiNop,
    }
  })
  rows.push({
    dienGiai: 'Tổng cộng',
    dauRa: tongDauRa,
    dauVao: tongDauVao,
    khauTru: tongKhauTru,
    phaiNop: tongPhaiNop,
    _t: 1,
  })
  return rows
}

// ── 6.2.5 Sổ theo dõi nghĩa vụ thuế khác ──
const cols625: Col[] = [
  { k: 'loaiThue', t: 'Loại thuế' },
  { k: 'phaiNop', t: 'Số phải nộp', num: true },
  { k: 'daNop', t: 'Số đã nộp', num: true },
  { k: 'conPhaiNop', t: 'Còn phải nộp', num: true },
]

function rows625(thang: number): Row[] {
  const q = kqkd(thang, 2026)
  return [
    { loaiThue: '1. Thuế môn bài (Lệ phí môn bài)', phaiNop: 'Không phát sinh', daNop: 'Không phát sinh', conPhaiNop: 'Không phát sinh' },
    { loaiThue: '2. Thuế thu nhập doanh nghiệp (tạm tính)', phaiNop: q.thue, daNop: 0, conPhaiNop: q.thue },
    { loaiThue: '3. Thuế thu nhập cá nhân', phaiNop: 'Không phát sinh', daNop: 'Không phát sinh', conPhaiNop: 'Không phát sinh' },
    { loaiThue: 'Tổng cộng', phaiNop: q.thue, daNop: 0, conPhaiNop: q.thue, _t: 1 },
  ]
}

// ── 7.2.3 Thẻ tài sản cố định ──
const cols723: Col[] = [
  { k: 'so', t: 'Số CT', cls: 'code', w: 120 },
  { k: 'ngay', t: 'Ngày', w: 95 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'nguyenGia', t: 'Nguyên giá', num: true },
  { k: 'nam', t: 'Năm', c: true, w: 70 },
  { k: 'haoMon', t: 'Giá trị hao mòn', num: true },
  { k: 'congDon', t: 'Cộng dồn', num: true },
]

function rows723(thang: number): Row[] {
  const ts = DS_TSCD[0]
  const [ma, ten, loai, ngaySd, nguyenGia, soThang] = ts
  const khThang = Math.round(nguyenGia / soThang)
  const hm2024 = 10 * khThang
  const cd2024 = hm2024
  const hm2025 = 12 * khThang
  const cd2025 = cd2024 + hm2025
  const hm2026 = thang * khThang
  const cd2026 = cd2025 + hm2026
  const ngay2026 = thang === 10 ? '07/10/2026' : `30/${pad(thang)}/2026`

  return [
    { dienGiai: `Tên: ${ten} · Số hiệu: ${ma} · Nhóm: ${loai} · Ngày đưa vào sử dụng: ${ngaySd}`, _b: 1 },
    { so: 'GTTS2403-0001', ngay: ngaySd, dienGiai: 'Ghi tăng tài sản cố định', nguyenGia, nam: '2024', haoMon: 0, congDon: 0 },
    { so: 'KH2412-0001', ngay: '31/12/2024', dienGiai: 'Trích khấu hao năm 2024 (10 tháng)', nam: '2024', haoMon: hm2024, congDon: cd2024 },
    { so: 'KH2512-0001', ngay: '31/12/2025', dienGiai: 'Trích khấu hao năm 2025 (12 tháng)', nam: '2025', haoMon: hm2025, congDon: cd2025 },
    { so: `KH26${pad(thang)}-0001`, ngay: ngay2026, dienGiai: `Trích khấu hao năm 2026 (${thang} tháng)`, nam: '2026', haoMon: hm2026, congDon: cd2026 },
    { dienGiai: 'Giá trị còn lại', nguyenGia: nguyenGia - cd2026, _t: 1 },
  ]
}

// ── 7.2.4 Sổ theo dõi TSCĐ, CCDC tại nơi sử dụng ──
const cols724: Col[] = [
  { k: 'ngay', t: 'Ngày ghi tăng', w: 95 },
  { k: 'so', t: 'Số CT', cls: 'code', w: 120 },
  { k: 'ten', t: 'Tên TSCĐ/CCDC' },
  { k: 'dvt', t: 'ĐVT', c: true, w: 70 },
  { k: 'sl', t: 'Số lượng', num: true, w: 80 },
  { k: 'donGia', t: 'Đơn giá', num: true },
  { k: 'thanhTien', t: 'Thành tiền', num: true },
]

const DS_CCDC = [
  { ma: 'CC001', ten: 'Bộ nồi inox 50 lít', dvt: 'Bộ', sl: 2, donGia: 12_300_000, ngay: '05/01/2026' },
  { ma: 'CC002', ten: 'Bàn ghế gỗ khu ngoài trời', dvt: 'Bộ', sl: 10, donGia: 8_640_000, ngay: '20/06/2026' },
  { ma: 'CC003', ten: 'Máy POS cầm tay', dvt: 'Cái', sl: 4, donGia: 7_950_000, ngay: '01/08/2026' },
  { ma: 'CC004', ten: 'Máy xay sinh tố công nghiệp', dvt: 'Cái', sl: 3, donGia: 6_300_000, ngay: '15/03/2026' },
  { ma: 'CC005', ten: 'Dao thớt bếp trọn bộ', dvt: 'Bộ', sl: 5, donGia: 2_400_000, ngay: '10/02/2026' },
]

const PHAN_BO_TS: Record<string, { tscd: string[]; ccdc: string[] }> = {
  q1: { tscd: ['TS001', 'TS002'], ccdc: ['CC001', 'CC005'] },
  q5: { tscd: ['TS003'], ccdc: ['CC003', 'CC004'] },
  td: { tscd: ['TS004', 'TS005'], ccdc: ['CC002'] },
}

function rows724(): Row[] {
  const rows: Row[] = []
  let tongCong = 0
  for (const cn of CHI_NHANH) {
    rows.push({ ten: `Bộ phận sử dụng: ${cn.ten}`, _b: 1 })
    const pb = PHAN_BO_TS[cn.id] ?? { tscd: [], ccdc: [] }
    for (const ma of pb.tscd) {
      const ts = DS_TSCD.find(t => t[0] === ma)
      if (ts) {
        const [maTs, tenTs, , ngay, ng] = ts
        tongCong += ng
        rows.push({
          ngay,
          so: `GTTS${maTs.slice(2)}`,
          ten: tenTs,
          dvt: 'Cái',
          sl: 1,
          donGia: ng,
          thanhTien: ng,
        })
      }
    }
    for (const ma of pb.ccdc) {
      const cc = DS_CCDC.find(c => c.ma === ma)
      if (cc) {
        const tt = cc.sl * cc.donGia
        tongCong += tt
        rows.push({
          ngay: cc.ngay,
          so: `GTCC${cc.ma.slice(2)}`,
          ten: cc.ten,
          dvt: cc.dvt,
          sl: cc.sl,
          donGia: cc.donGia,
          thanhTien: tt,
        })
      }
    }
  }
  rows.push({
    ten: 'Tổng cộng',
    thanhTien: tongCong,
    _t: 1,
  })
  return rows
}

// ── 10.4.1 Sổ chi tiết doanh thu, chi phí ──
const cols1041: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 95 },
  { k: 'so', t: 'Số CT', cls: 'code', w: 100 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'dt', t: 'Doanh thu', num: true },
  { k: 'cp', t: 'Chi phí', num: true },
  { k: 'cl', t: 'Chênh lệch', num: true },
]

function rows1041(thang: number): Row[] {
  const q = kqkd(thang, 2026)
  const cpHdThang = q.cpQlkd
  const ds = daysOf(thang, 2026)
  const ngayMap = new Map<number, { date: Date; dt: number; gv: number }>()
  for (const x of ds) {
    const d = x.date.getDate()
    const cur = ngayMap.get(d)
    if (!cur) ngayMap.set(d, { date: x.date, dt: x.dt, gv: x.gv })
    else { cur.dt += x.dt; cur.gv += x.gv }
  }
  const sorted = Array.from(ngayMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  const N = sorted.length
  const cpHdMoiNgay = Math.floor(cpHdThang / (N || 1))
  const cpHdDu = cpHdThang - cpHdMoiNgay * N

  let tongDt = 0
  let tongCp = 0
  let tongCl = 0
  const rows: Row[] = sorted.map((x, idx) => {
    const d = x.date.getDate()
    const cpHd = idx === N - 1 ? cpHdMoiNgay + cpHdDu : cpHdMoiNgay
    const cpNgay = x.gv + cpHd
    const clNgay = x.dt - cpNgay
    tongDt += x.dt
    tongCp += cpNgay
    tongCl += clNgay
    return {
      ngay: `${pad(d)}/${pad(thang)}/2026`,
      so: `BH26${pad(thang)}-${pad(d)}`,
      dienGiai: `Doanh thu và chi phí ngày ${pad(d)}/${pad(thang)}`,
      dt: x.dt,
      cp: cpNgay,
      cl: clNgay,
    }
  })
  rows.push({
    dienGiai: 'Cộng',
    dt: tongDt,
    cp: tongCp,
    cl: tongCl,
    _t: 1,
  })
  return rows
}

// ── 10.4.2 Sổ theo dõi vốn chủ sở hữu (TK 411, 421) ──
const cols1042: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 95 },
  { k: 'so', t: 'Số CT', cls: 'code', w: 120 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'tk', t: 'Tài khoản', c: true, w: 90 },
  { k: 'tang', t: 'Tăng (Có)', num: true },
  { k: 'giam', t: 'Giảm (Nợ)', num: true },
  { k: 'du', t: 'Số dư', num: true },
]

function rows1042(thang: number): Row[] {
  const sc = soCai(thang)
  const du411_0 = -sc.mo['411']
  const du421_0 = -sc.mo['421']
  const rows: Row[] = [
    { dienGiai: 'Số dư đầu kỳ - Vốn đầu tư của chủ sở hữu', tk: '411', du: du411_0, _b: 1 },
    { dienGiai: 'Số dư đầu kỳ - Lợi nhuận sau thuế chưa phân phối', tk: '421', du: du421_0, _b: 1 },
  ]
  let tongTang = 0
  let tongGiam = 0
  const btKc = sc.bt.find(b => (b[0] === '911' && b[1] === '421') || (b[0] === '421' && b[1] === '911'))
  if (btKc) {
    const isLai = btKc[0] === '911' && btKc[1] === '421'
    const tang = isLai ? btKc[2] : 0
    const giam = isLai ? 0 : btKc[2]
    tongTang += tang
    tongGiam += giam
    const ngay = thang === 10 ? '07/10/2026' : `30/${pad(thang)}/2026`
    const du421 = du421_0 + tang - giam
    rows.push({
      ngay,
      so: `PKC26${pad(thang)}-0042`,
      dienGiai: 'Kết chuyển lợi nhuận sau thuế chưa phân phối kỳ này',
      tk: '421',
      tang,
      giam,
      du: du421,
    })
  }
  rows.push({
    dienGiai: 'Cộng phát sinh',
    tang: tongTang,
    giam: tongGiam,
    _t: 1,
  })
  rows.push({
    dienGiai: 'Số dư cuối kỳ - Vốn đầu tư của chủ sở hữu',
    tk: '411',
    du: -sc.cuoi['411'],
    _t: 1,
  })
  rows.push({
    dienGiai: 'Số dư cuối kỳ - Lợi nhuận sau thuế chưa phân phối',
    tk: '421',
    du: -sc.cuoi['421'],
    _t: 1,
  })
  return rows
}

export const SO_BO_SUNG: Record<string, ReportCfg> = {
  '2.2.6': { kieu: 'bangke', cols: cols226, rows: rows226 },
  '2.2.7': { kieu: 'bangke', cols: cols227, rows: rows227 },
  '3.2.5': { kieu: 'bangke', cols: cols325, rows: rows325 },
  '5.2.8': { kieu: 'bangke', cols: cols528, rows: rows528 },
  '6.2.4': { kieu: 'bangke', cols: cols624, rows: rows624 },
  '6.2.5': { kieu: 'bangke', cols: cols625, rows: rows625 },
  '7.2.3': { kieu: 'bangke', cols: cols723, rows: rows723 },
  '7.2.4': { kieu: 'bangke', cols: cols724, rows: () => rows724() },
  '10.4.1': { kieu: 'bangke', cols: cols1041, rows: rows1041 },
  '10.4.2': { kieu: 'bangke', cols: cols1042, rows: rows1042 },
}
