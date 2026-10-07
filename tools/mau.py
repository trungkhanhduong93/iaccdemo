# -*- coding: utf-8 -*-
# Chép từ skill viet-nhu-nguoi của Trum ngày 07/10/2026, dùng cho tools/kiem_van.py.
"""Danh mục mẫu cho kiem_van.py.

Viết mẫu bằng chữ thường và bỏ dấu kiểu mới (hoá, khoá, uỷ). Trước khi so, script đã hạ
chữ thường và quy kiểu bỏ dấu cũ (hóa, khóa, ủy) về kiểu mới, nên một mẫu bắt được cả hai.

Mỗi luật:
  ma       mã ngắn, in ra trong báo cáo
  muc      "do" = gần như chắc là văn AI hoặc lỗi phải sửa; "vang" = đọc lại, giữ nếu có lý do
  loai     các loại văn bản áp dụng
  pham_vi  "van" = chữ người đọc thấy; "tho" = nguyên văn file (để bắt dấu vết trong URL, mã)
  mau      danh sách (regex, gợi ý sửa); gợi ý rỗng thì dùng goi_y của luật
"""

VAN_XUOI = ["tai-lieu", "iso", "thuyet-trinh", "gioi-thieu", "email", "chat"]
MOI_LOAI = VAN_XUOI + ["giao-dien"]

LUAT = [
    dict(
        ma="DAU_VET_MAY", muc="do", loai=MOI_LOAI, pham_vi="tho",
        goi_y="Xoá, rồi tự kiểm lại nguồn trích dẫn đó có thật không",
        mau=[
            (r"oaicite|contentreference\[|oai_citation|attributableindex", ""),
            (r"turn\d+(?:search|image|news|file)\d+", ""),
            (r"utm_source=(?:chatgpt\.com|openai|copilot\.com)|referrer=grok\.com", ""),
            (r"\[cite:\s*\d|\[span_\d+\]\((?:start|end)_span\)", ""),
            (r"grok[-_]card|grok_render_citation_card_json", ""),
            (r"【\d+†l\d+|\[attached_file:\d+\]|\[web:\d+\]|ppl-ai-file-upload|:::writing\{", ""),
        ],
    ),
    # Với file mã nguồn, hai luật chỗ trống chỉ soát trong chuỗi hiển thị, vì obj[name] trong code trông giống chỗ trống.
    dict(
        ma="CHO_TRONG_AI", muc="do", loai=MOI_LOAI, pham_vi="tho_van_ban",
        goi_y="Chỗ trống chatbot để lại cho người hỏi tự điền. Điền giá trị thật hoặc xoá dòng",
        mau=[
            (r"\[(?:your [a-z ]{2,20}|(?:họ )?tên của bạn|chèn [^\]\n]{1,40}|insert [^\]\n]{1,40}|"
             r"describe [^\]\n]{1,60}|mô tả [^\]\n]{1,60})\](?!\()", ""),
            (r"\b20\d\d-xx-xx\b|\binsert_[a-z0-9_]+|\bpaste_[a-z0-9_]+_here\b", ""),
            (r"\((?:thêm|chèn|điền|add|insert)\b[^)\n]{0,40}(?:ở đây|vào đây|here)\)", ""),
            (r"lorem ipsum", ""),
        ],
    ),
    dict(
        ma="CHO_TRONG", muc="vang", loai=MOI_LOAI, pham_vi="tho_van_ban",
        goi_y="Còn chỗ trống. File mẫu (template) thì bỏ qua; thành phẩm thì điền giá trị thật",
        mau=[
            (r"\[(?:tên|họ tên|họ và tên|name|company|tên công ty|công ty|ngày|date|link|"
             r"đường dẫn|số điện thoại|sđt|email|địa chỉ|thêm|điền)[^\]\n]{0,40}\](?!\()", ""),
        ],
    ),
    dict(
        ma="LOI_CHATBOT", muc="do", loai=MOI_LOAI, pham_vi="van",
        goi_y="Lời chatbot nói với người hỏi, không thuộc thành phẩm: xoá cả câu",
        mau=[
            (r"hy vọng\b[^.!?\n]{0,40}\b(?:hữu ích|giúp ích)", ""),
            (r"\bbạn có muốn (?:tôi|tui|mình|em)\b|\bnếu (?:bạn|anh|chị) cần,? (?:tôi|tui|mình|em) có thể", ""),
            (r"\bchắc chắn rồi\s*!|\btuyệt vời\s*!|\bcâu hỏi (?:rất )?hay\b", ""),
            (r"\blà một (?:mô hình ngôn ngữ|trợ lý ai)\b|\bas an ai\b|\bas a large language model\b", ""),
            (r"\bi hope this helps\b|\bcertainly!|\bwould you like me to\b|\bgreat question\b", ""),
            (r"\byou'?re absolutely right\b|\blet me know if you\b", ""),
            (r"\bhere(?:'s| is) (?:a|an|the) (?:revised|updated|draft|template|rewritten|polished)\b", ""),
        ],
    ),
    dict(
        ma="KHONG_DU_TIN", muc="do", loai=VAN_XUOI, pham_vi="van",
        goi_y="Câu rào của chatbot khi thiếu dữ liệu, phần đoán đi kèm thường là bịa. Có nguồn thì ghi nguồn, không thì xoá",
        mau=[
            (r"\bthông tin (?:chi tiết )?(?:về [^.,\n]{0,30})?(?:chưa|không) được (?:công bố|ghi nhận|ghi chép) (?:rộng rãi|đầy đủ)", ""),
            (r"\btính đến (?:thời điểm )?(?:lần )?cập nhật (?:kiến thức|dữ liệu)", ""),
            (r"\bas of my last (?:knowledge|training) update\b|\bnot widely (?:documented|available)\b", ""),
        ],
    ),
    dict(
        ma="CUM_SAO", muc="do", loai=VAN_XUOI, pham_vi="van",
        goi_y="Cụm sáo của văn AI",
        mau=[
            (r"\bđiều này (?:giúp|cho phép|góp phần|đảm bảo)", "Nói thẳng kết quả: \"Nhờ vậy không bị lặp phiếu.\""),
            (r"\bkhông (?:chỉ|những)\b[^.!?\n]{1,80}\bmà còn\b", "Tách hai câu, hoặc bỏ vế phụ"),
            (r"\bđóng vai trò (?:quan trọng|then chốt|trọng yếu|chủ chốt|trung tâm|cốt lõi|không thể thiếu)", "Nói thẳng nó làm gì"),
            (r"\b(?:vô cùng|cực kỳ|hết sức) quan trọng\b", "Nói hậu quả cụ thể nếu bỏ qua"),
            (r"\bmột cách (?:hiệu quả|dễ dàng|nhanh chóng|tối ưu|toàn diện|chính xác|linh hoạt|mạnh mẽ|liền mạch|"
             r"mượt mà|thuận tiện|đáng kể)", "Bỏ trạng ngữ, đưa số liệu"),
            (r"\b(?:hãy|chúng ta hãy) cùng (?:tìm hiểu|khám phá|xem|điểm qua)", "Vào thẳng nội dung"),
            (r"\bdưới đây là (?:những )?(?:gì|điều) (?:bạn|anh|chị|các bạn) cần biết\b|\bkhông dài dòng nữa\b",
             "Báo trước ý sắp nói. Xoá câu báo, nói luôn ý đó"),
            (r"\blet'?s (?:dive in|dive into|break (?:this|it) down)\b|\bhere'?s what you need to know\b|"
             r"\bwithout further ado\b", "Drop the announcement, state the point"),
            (r"\bcần lưu ý rằng\b|\bđiều (?:quan trọng|đáng chú ý|đáng nói) là\b|\bđáng chú ý là\b", "Nói luôn điều cần lưu ý"),
            (r"\bgiải pháp toàn diện\b|\btối ưu hoá trải nghiệm\b", "Gọi đúng tên thứ đó và nó làm được gì"),
            (r"\bcho phép (?:bạn|người dùng) có thể\b", "\"X để…\" hoặc \"Bạn có thể…\""),
            (r"\blà điều (?:cần thiết|quan trọng|không thể thiếu)\b", "\"Phải X\""),
            (r"\b(?:tuy|mặc dù|dù) (?:vẫn )?còn (?:nhiều |một số |không ít )?(?:thách thức|khó khăn|hạn chế)",
             "Nêu thách thức cụ thể, bỏ câu lạc quan đi kèm"),
            (r"\bmở ra (?:một )?(?:kỷ nguyên|chương|trang|hướng đi) mới\b", "Nói thay đổi cụ thể, có số"),
            (r"\bminh chứng (?:rõ nét |sống động |hùng hồn )?cho\b", "Đưa bằng chứng, bỏ lời khen"),
            (r"\bkhẳng định (?:vị thế|vị trí|tầm vóc|thương hiệu)\b", "Đưa số liệu hoặc bỏ"),
            (r"\bdấu ấn (?:sâu đậm|đậm nét|khó phai)\b|\bbước ngoặt (?:quan trọng|lịch sử|lớn)\b",
             "Nói sự kiện và ngày, bỏ lời đánh giá"),
            (r"\bgóp phần (?:quan trọng|không nhỏ|tích cực|to lớn|đáng kể)\b", "Nói góp cái gì, bao nhiêu"),
            (r"\btrong bối cảnh (?:hiện nay|ngày nay|hiện tại|thời đại)\b|\btrong bối cảnh [^.,\n]{0,30}ngày càng\b",
             "Bỏ câu mở bối cảnh, vào thẳng việc"),
            (r"\bkhông ngừng (?:nỗ lực|phát triển|đổi mới|cải tiến|nâng cao)\b", "Nói đã làm gì, khi nào"),
            (r"\bhy vọng (?:email|thư) này đến với\b|\bđừng ngần ngại (?:liên hệ|liên lạc)\b", "Câu dịch máy từ tiếng Anh: bỏ"),
            (r"\btestament to\b|\bpivotal (?:moment|role)\b|\bevolving landscape\b|\bindelible mark\b", "State the fact instead"),
            (r"\bdeeply rooted\b|\brich (?:cultural )?tapestry\b|\bdelves? into\b", "State the fact instead"),
            (r"\bplays? an? (?:crucial|key|vital|pivotal|significant|important) role\b", "Say what it does"),
            (r"\bnot only\b[^.!?\n]{1,80}\bbut also\b", "Split into two sentences"),
            (r"\bit(?:'s| is) (?:important|crucial|worth) (?:to note|noting|to remember)\b", "Just say it"),
            (r"\bdespite (?:its|these|their|the) (?:many )?challenges\b|\bfaces? (?:several|many|numerous) challenges\b",
             "Name the challenge, drop the upbeat ending"),
            (r"\bi hope this (?:message|email) finds you well\b|\bdon'?t hesitate to (?:contact|reach)\b", "Drop it"),
        ],
    ),
    dict(
        ma="DUOI_BINH_LUAN", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Đuôi bình luận gắn sau dấu phẩy. Cắt đi; muốn giữ ý thì viết câu riêng có số liệu",
        mau=[
            # (?!\s*[,|…"]) loại danh sách từ cách nhau bằng dấu phẩy, vd "góp phần, thúc đẩy, nâng cao"
            (r",\s*(?:qua đó |từ đó |nhờ đó )?(?:góp phần|cho thấy|thể hiện|khẳng định|phản ánh|minh chứng|nhấn mạnh|"
             r"củng cố|mở ra|thúc đẩy|tạo nên|mang lại|mang đến|làm nổi bật|tô điểm)\b(?!\s*[,|…\"])", ""),
            (r",\s*(?:highlighting|underscoring|emphasizing|reflecting|symbolizing|showcasing|contributing to|fostering|"
             r"ensuring|cementing|solidifying|demonstrating|marking|underlining)\b(?!\s*[,|…\"])", ""),
        ],
    ),
    dict(
        ma="NE_LA_CO", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Dùng \"là\", \"có\"",
        mau=[
            (r"\b(?:đóng|giữ) vai trò (?:là|như)\b|\bđược (?:xem|coi) (?:là|như)\b", ""),
            (r"(?<!chủ )(?<!quyền )\bsở hữu\b(?! trí tuệ)|\btự hào (?:có|là|sở hữu|mang)\b|\bmang đến\b", ""),
            (r"\b(?:serves|stands|functions) as (?:a|an|the)\b|\bboasts?\b", ""),
        ],
    ),
    dict(
        ma="QUY_CHO_VO_DANH", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Ghi tên nguồn cụ thể, hoặc bỏ",
        mau=[
            (r"\b(?:nhiều|các|một số) chuyên gia (?:cho rằng|nhận định|đánh giá|nhận xét|khuyên)", ""),
            (r"\bgiới (?:quan sát|chuyên môn|phân tích)\b|\btheo đánh giá chung\b|\bđược đánh giá cao\b", ""),
            (r"\bnhận được (?:rất )?nhiều (?:phản hồi|đánh giá) tích cực\b|\bđược ghi nhận rộng rãi\b", ""),
            (r"\bđược (?:nhiều người|đông đảo [^.,\n]{0,20}) (?:biết đến|đánh giá|yêu thích|tin dùng)\b", ""),
            (r"\bnhiều (?:nghiên cứu|báo cáo) (?:cho thấy|chỉ ra)\b", ""),
            (r"\bexperts (?:argue|say|believe|note)\b|\bobservers have\b|\bindustry reports\b|\bwidely regarded\b", ""),
        ],
    ),
    dict(
        ma="KHOE_DUA_TIN", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Đừng khoe được nhắc tới; tóm tắt nội dung nguồn nói gì",
        mau=[
            (r"\bđược (?:nhiều )?(?:báo chí|truyền thông|các kênh|các trang) (?:đưa tin|nhắc đến|đăng tải)\b", ""),
            (r"\bsự hiện diện (?:mạnh mẽ )?trên (?:mạng xã hội|các nền tảng)\b|\bgiải thưởng và (?:ghi nhận|thành tựu)\b", ""),
            (r"\bindependent coverage\b|\bmaintains? an? (?:active|strong) (?:social media|digital|online) presence\b", ""),
            (r"\bawards and recognition\b", ""),
        ],
    ),
    # Ba luật dưới thêm 03/10/2026 theo humanizer v2.11.2 (mục 27, 32 đến 35).
    dict(
        ma="MO_DAU_GIA", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Mở đầu làm như sắp nói điều sâu sắc hoặc thật lòng. Bỏ phần mở, nói thẳng ý",
        mau=[
            (r"\b(?:vấn đề|câu hỏi|điều) (?:thực sự|thật sự) (?:là|nằm ở)\b|\b(?:suy|xét) cho cùng\b|"
             r"\bcốt lõi của vấn đề\b|\bđiều (?:thực sự|thật sự) quan trọng\b", ""),
            (r"(?:^|[.!?\n]\s*)(?:nói thật|thật lòng mà nói|nói thẳng)(?: (?:nhé|nha))?\s*[?!:]", ""),
            (r"\b(?:vấn đề|sự thật|chuyện) là thế này\s*:", ""),
            (r"\bthe real question is\b|\bat its core\b|\bwhat really matters\b|\bthe heart of the matter\b|"
             r"\bthe deeper issue\b", ""),
            (r"(?:^|[.!?\n]\s*)(?:honestly\?|here'?s the thing\s*[:,]|real talk\s*[:,]|let'?s be honest\s*[:,])", ""),
        ],
    ),
    dict(
        ma="CHAM_NGON", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Câu châm ngôn nghe sâu mà không có dữ kiện. Thay bằng khẳng định cụ thể",
        mau=[
            (r"\blà (?:ngôn ngữ|linh hồn|trái tim|xương sống|thước đo|tấm gương|chất keo) (?:chung )?của\b", ""),
            (r"\bis the (?:language|currency|architecture|grammar|soul) of\b|\bbecomes? a trap\b", ""),
        ],
    ),
    dict(
        ma="PHAN_BIEN_GIA", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Cãi lại ý không ai nêu, hoặc dựng phương án để gạt đi. Bỏ, nói thẳng ràng buộc thật",
        mau=[
            (r"\bđừng hiểu lầm\b|\b(?:tôi|tui|mình) không (?:nói|có ý nói) rằng\b|\bcó thể bạn sẽ nghĩ\b", ""),
            (r"\bmột cách làm (?:dễ thấy|hiển nhiên|tưởng như hợp lý) là\b|\bnghe thì có vẻ hợp lý,? nhưng\b", ""),
            (r"\bdon'?t get me wrong\b|\bthis (?:isn'?t|is not) to say\b|\bi'?m not (?:saying|arguing)\b|"
             r"\byou might think\b|\b(?:a|one) tempting (?:approach|option)\b|\bone might be tempted\b", ""),
        ],
    ),
    dict(
        ma="TUONG_LAI_RONG", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Mục thách thức/triển vọng đúc sẵn. Nêu việc cụ thể, người làm, hạn",
        mau=[
            (r"\bthách thức và (?:triển vọng|cơ hội)\b|\btriển vọng tương lai\b", ""),
            (r"\bhứa hẹn (?:sẽ )?(?:mang lại|trở thành|là)\b|\btiềm năng (?:to lớn|vô hạn|rộng mở)\b", ""),
            (r"\bfuture (?:outlook|prospects)\b|\bchallenges and (?:future|legacy|opportunities)\b", ""),
        ],
    ),
    dict(
        ma="TONG_KET", muc="vang", loai=VAN_XUOI, pham_vi="van",
        goi_y="Đoạn nhắc lại ý vừa nói. Bỏ; kết bằng việc cần làm hoặc con số cuối",
        mau=[
            (r"(?:^|\n)\s*(?:tóm lại|nhìn chung|tổng kết lại|nói tóm lại)\s*,", ""),
            (r"(?:^|\n)\s*(?:in conclusion|in summary|overall)\s*,", ""),
        ],
    ),
    dict(
        ma="BAO_CAO_SUONG", muc="vang", loai=["tai-lieu", "iso", "email", "chat"], pham_vi="van",
        goi_y="Lời hứa chung chung. Ghi đã đổi gì và bằng chứng (lệnh đã chạy, kết quả)",
        mau=[
            (r"\bđã (?:được )?(?:rà soát|kiểm tra) (?:kỹ|kỹ lưỡng|toàn diện|cẩn thận)\b", ""),
            (r"\b(?:đảm bảo|bảo đảm) (?:không|tuyệt đối không) (?:ảnh hưởng|lỗi|sai)\b", ""),
            (r"\b(?:giữ|bảo toàn) nguyên (?:ý|nội dung|cấu trúc|ý nghĩa)\b|\bđã tối ưu (?:hoá )?(?:toàn bộ|hoàn toàn)\b", ""),
            (r"\bensur(?:ed|ing) (?:that|compliance|consistency)\b|\bwhile preserving\b|\bimproved (?:clarity|readability|flow)\b", ""),
        ],
    ),
    dict(
        ma="GIAO_DIEN", muc="vang", loai=["giao-dien", "gioi-thieu"], pham_vi="van",
        goi_y="Chữ giao diện chung chung",
        mau=[
            (r"\b(?:đã xảy ra|có) lỗi(?: xảy ra)?\b|\blỗi hệ thống\b|\bsomething went wrong\b|\ban (?:unexpected )?error (?:has )?occurred\b",
             "Nói việc gì không thành, vì sao, làm gì tiếp"),
            (r"\bbạn có chắc(?: chắn)?\b|\bare you sure\b", "Hỏi đúng hành động: \"Xoá 3 phiếu nháp?\", nút ghi \"Xoá phiếu\""),
            (r"\b(?:khám phá|trải nghiệm|bắt đầu) ngay\b|\bbắt đầu hành trình\b|\b(?:nhấn|bấm|click) vào đây\b|\bclick here\b",
             "Động từ + đối tượng: \"Tạo phiếu nhập\", \"Đặt lịch demo 30 phút\""),
            (r"thành công\s*!|!{2,}", "Bỏ chấm than; nói cái gì đã xong: \"Đã lưu 12 dòng\""),
            (r"\bvui lòng thử lại sau\b", "Nói thử lại khi nào, hoặc làm gì khác"),
        ],
    ),
]

# Từ vựng hay gặp trong văn AI. Một hai từ là bình thường; dày đặc mới là dấu hiệu.
# Chỉ báo khi đạt cả hai ngưỡng.
TU_VUNG = dict(
    ma="TU_VUNG_AI", muc="vang", loai=VAN_XUOI,
    nguong_so_lan=3, nguong_moi_1000_chu=4,
    goi_y="Từ vựng văn AI xuất hiện dày. Thay bằng từ thường hoặc bằng dữ kiện",
    mau=[
        r"\bthen chốt\b", r"\bnổi bật\b", r"\bvượt trội\b", r"\bđột phá\b", r"\btoàn diện\b", r"\btối ưu\b",
        r"\bmạnh mẽ\b", r"\bliền mạch\b", r"\bmượt mà\b", r"\bđa dạng\b", r"\bphong phú\b", r"\bsâu sắc\b",
        r"\bhệ sinh thái\b", r"\bkỷ nguyên\b", r"\bhành trình\b", r"\bbức tranh\b", r"\bchìa khoá\b",
        r"\bnền tảng vững chắc\b", r"\bkhông ngừng\b", r"\bgóp phần\b", r"\bthúc đẩy\b", r"\bnâng cao\b",
        r"\bkhẳng định\b", r"\bminh chứng\b", r"\btrải nghiệm\b", r"\btối đa hoá\b", r"\bcách mạng hoá\b",
        r"\bkhai phá\b", r"\btận dụng\b", r"\blinh hoạt\b", r"\bhiệu quả\b", r"\bđáng kể\b", r"\bvượt bậc\b",
        r"\btầm cao mới\b", r"\bgiá trị cốt lõi\b", r"\blan toả\b", r"\btruyền cảm hứng\b", r"\bđịnh hình\b",
        r"\bkiến tạo\b", r"\bđồng hành\b",
        r"\badditionally\b", r"\balign(?:s|ed)? with\b", r"\bbolster(?:ed|s)?\b", r"\bcrucial\b", r"\bdelve\b",
        r"\bemphasiz(?:e|es|ed|ing)\b", r"\benduring\b", r"\benhanc(?:e|es|ed|ing)\b", r"\bfoster(?:s|ed|ing)?\b",
        r"\bgarner(?:s|ed)?\b", r"\bhighlight(?:s|ed|ing)\b", r"\binterplay\b", r"\bintricate\b", r"\bintricacies\b",
        r"\blandscape\b", r"\bmeticulous(?:ly)?\b", r"\bpivotal\b", r"\brobust\b", r"\bshowcas(?:e|es|ed|ing)\b",
        r"\btapestry\b", r"\btestament\b", r"\bunderscor(?:e|es|ed|ing)\b", r"\bvaluable\b", r"\bvibrant\b",
        r"\bseamless(?:ly)?\b", r"\bleverag(?:e|es|ed|ing)\b",
    ],
)

# Thuật ngữ chuyên môn trùng với từ vựng AI. Trong loại văn bản tương ứng thì không báo.
MIEN_TRU = {
    "iso": [
        r"\bđảm bảo (?:chất lượng|tính)\b", r"\bcải tiến liên tục\b", r"\bhiệu lực\b", r"\bhiệu quả\b",
        r"\bnâng cao sự thoả mãn\b", r"\bbối cảnh (?:của )?tổ chức\b", r"\btuân thủ\b", r"\bduy trì\b",
        r"\bthúc đẩy cải tiến\b", r"\brủi ro và cơ hội\b",
    ],
}

# Câu dài quá số chữ này thì báo VÀNG
CAU_DAI = {"tai-lieu": 40, "iso": 42, "email": 35, "gioi-thieu": 30, "chat": 30, "thuyet-trinh": 20, "giao-dien": 25}

# Ký tự được phép dù nằm trong dải emoji: dấu tick, ô chọn, sao đánh giá, dấu sao đánh dấu trường bắt buộc
KY_TU_DUOC_PHEP = set("✓✔✗✘☐☑☒★☆✱✳️")

# Danh sách đường dẫn mà hook bỏ qua: file chứa luật hoặc danh mục cấm, trích cụm sáo làm ví dụ
HOOK_BO_QUA = ["viet-nhu-nguoi", "tra-loi-gon", "node_modules", "/dist/", "/build/", "/.git/"]
HOOK_BO_QUA_TEN = ["CLAUDE.md", "GEMINI.md", "AGENTS.md"]

DANH_DAU_BO_QUA = "viet-nhu-nguoi: bo-qua"
