// Tờ khai thuế GTGT quý 3/2026. Standard tính trực tiếp trên doanh thu; Plus, Pro khấu trừ.
// Số bán ra lấy từ DAILY tháng 7–9 nên khớp chứng từ bán hàng. Bố cục để xem, kế toán trưởng phải duyệt mẫu trước khi làm thật.
import { useState } from 'react'
import type { ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { tongKy } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note, PageHead } from '../../ui/Page'
import { ReportPaper, RptTable } from '../../ui/generic/ReportScreen'
import { k } from '../../ui/format'

export function ToKhaiGTGT({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const [gui, setGui] = useState(false)
  const q = [7, 8, 9].map(t => tongKy(t, 2026))
  const dt = q.reduce((a, x) => a + x.dt, 0), vat = q.reduce((a, x) => a + x.vat, 0), gv = q.reduce((a, x) => a + x.gv, 0)
  const truocThang = s.cheDo === 'TT58'
  const muaVao = k(gv * 0.62 + 486_000_000), thueVao = k(muaVao * 0.074)
  const c22 = 18_640_000, c36 = vat - thueVao, c40 = Math.max(0, c36 - c22)

  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}
        meta={<><span className="chip">Quý 3/2026</span><span className="chip warn">Hạn nộp 30/10/2026</span>{gui && <span className="chip ok">Đã nộp, chờ cơ quan thuế phản hồi</span>}</>}>
        <button className="btn"><Icon n="download" className="ic sm" />Xuất XML</button>
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent('bc-in'))}><Icon n="printer" className="ic sm" />In</button>
        <button className="btn pri" onClick={() => { setGui(true); toast('Đã nộp tờ khai qua kết nối cơ quan thuế') }}><Icon n="upload" className="ic sm" />Nộp tờ khai</button>
      </PageHead>
      <Note kind="warn" icon="alert">Số liệu giả để xem bố cục. Mẫu tờ khai và cách kê hàng giảm thuế cần kế toán trưởng duyệt trước khi dùng thật.</Note>
      <section className="report">
        {truocThang ? (
          <ReportPaper title="Tờ khai thuế giá trị gia tăng" sub="Dành cho người nộp thuế tính thuế theo phương pháp trực tiếp trên doanh thu · Mẫu 04/GTGT · Quý 3/2026" ky={false}>
            <RptTable cols={[{ k: 'stt', t: 'STT', c: true, w: 50 }, { k: 'nhom', t: 'Nhóm ngành' }, { k: 'dt', t: 'Doanh thu chịu thuế', num: true }, { k: 'tl', t: 'Tỷ lệ', c: true, w: 70 }, { k: 'thue', t: 'Thuế GTGT phải nộp', num: true }]}
              rows={[
                { stt: 1, nhom: 'Phân phối, cung cấp hàng hoá', tl: '1%' },
                { stt: 2, nhom: 'Dịch vụ, xây dựng không bao thầu nguyên vật liệu', tl: '5%' },
                { stt: 3, nhom: 'Sản xuất, vận tải, dịch vụ có gắn với hàng hoá (ăn uống)', dt: dt + vat, tl: '3%', thue: Math.round((dt + vat) * 0.03) },
                { stt: 4, nhom: 'Hoạt động kinh doanh khác', tl: '2%' },
                { nhom: 'Tổng cộng', dt: dt + vat, thue: Math.round((dt + vat) * 0.03), _t: 1 },
              ]} />
          </ReportPaper>
        ) : (
          <ReportPaper title="Tờ khai thuế giá trị gia tăng" sub="Dành cho người nộp thuế khai thuế theo phương pháp khấu trừ · Mẫu 01/GTGT · Quý 3/2026" ky={false}>
            <RptTable cols={[{ k: 'stt', t: 'STT', c: true, w: 50 }, { k: 'ct', t: 'Chỉ tiêu' }, { k: 'ma1', t: 'Mã', c: true, w: 56 }, { k: 'gt', t: 'Giá trị HHDV', num: true }, { k: 'ma2', t: 'Mã', c: true, w: 56 }, { k: 'thue', t: 'Thuế GTGT', num: true }]}
              rows={[
                { stt: 'A', ct: 'Không phát sinh hoạt động mua, bán trong kỳ', ma1: '[21]', _b: 1 },
                { stt: 'B', ct: 'Thuế GTGT còn được khấu trừ kỳ trước chuyển sang', ma2: '[22]', thue: c22, _b: 1 },
                { stt: 'C', ct: 'Kê khai thuế GTGT phải nộp ngân sách nhà nước', _b: 1 },
                { stt: 'I', ct: 'Hàng hoá, dịch vụ mua vào trong kỳ', _b: 1 },
                { stt: 1, ct: 'Giá trị và thuế GTGT của hàng hoá, dịch vụ mua vào', ma1: '[23]', gt: muaVao, ma2: '[24]', thue: thueVao },
                { stt: 2, ct: 'Tổng số thuế GTGT được khấu trừ kỳ này', ma2: '[25]', thue: thueVao },
                { stt: 'II', ct: 'Hàng hoá, dịch vụ bán ra trong kỳ', _b: 1 },
                { stt: 1, ct: 'Hàng hoá, dịch vụ bán ra không chịu thuế GTGT', ma1: '[26]' },
                { stt: 2, ct: 'Hàng hoá, dịch vụ bán ra chịu thuế GTGT', ma1: '[27]', gt: dt, ma2: '[28]', thue: vat },
                { stt: 'a', ct: 'Hàng hoá, dịch vụ bán ra chịu thuế suất 0%', ma1: '[29]', _i: 1 },
                { stt: 'b', ct: 'Hàng hoá, dịch vụ bán ra chịu thuế suất 5%', ma1: '[30]', ma2: '[31]', _i: 1 },
                { stt: 'c', ct: 'Hàng hoá, dịch vụ bán ra chịu thuế suất 10% (gồm hàng giảm còn 8%)', ma1: '[32]', gt: dt, ma2: '[33]', thue: vat, _i: 1 },
                { stt: 3, ct: 'Tổng doanh thu và thuế GTGT của hàng hoá, dịch vụ bán ra', ma1: '[34]', gt: dt, ma2: '[35]', thue: vat },
                { stt: 'III', ct: 'Thuế GTGT phát sinh trong kỳ', ma2: '[36]', thue: c36, _b: 1 },
                { stt: 'IV', ct: 'Thuế GTGT còn phải nộp trong kỳ', ma2: '[40]', thue: c40, _t: 1 },
                { stt: 'V', ct: 'Thuế GTGT chưa khấu trừ hết kỳ này', ma2: '[41]', thue: 0, _z: 1 },
              ]} />
          </ReportPaper>
        )}
      </section>
    </div>
  )
}
