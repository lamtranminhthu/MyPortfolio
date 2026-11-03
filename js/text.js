"use strict";

/* Chuỗi dùng trong JavaScript (modal vụ án, thông báo, form…) */
const TEXT = {
  projects: {
    p1: { no: "CASE #01 · ĐÃ KHÉP HỒ SƠ", title: "Hệ thống quản lý sinh viên", meta: "Python, SQLite · Nhóm 5 thành viên · Đã hoàn thành",
          desc: "Hệ thống hỗ trợ quản lý thông tin sinh viên và hoạt động học tập: hồ sơ sinh viên, đăng ký học phần, quản lý điểm và tra cứu thời khóa biểu.",
          points: ["Phân tích và xác định các yêu cầu chức năng, phi chức năng của hệ thống quản lý sinh viên", "Xây dựng tài liệu phân tích và thiết kế hệ thống, gồm đặc tả yêu cầu, sơ đồ Use Case, DFD và Class Diagram", "Phân tích quy trình hoạt động của các chức năng quản lý sinh viên, đăng ký học phần, quản lý điểm và xem thời khóa biểu", "Tham gia phát triển một số chức năng của hệ thống bằng Python và SQLite"] },
    p2: { no: "CASE #02 · ĐÃ KHÉP HỒ SƠ", title: "Website Portfolio cá nhân", meta: "HTML, CSS, JavaScript · Cá nhân · Đã hoàn thành",
          desc: "Website giới thiệu bản thân, kỹ năng, dự án và thông tin liên hệ theo concept “Hồ sơ phân tích hành vi”, hiển thị tốt trên cả máy tính và thiết bị di động.",
          points: ["Xây dựng giao diện responsive, tương thích trên máy tính và thiết bị di động", "Phát triển menu mobile, lọc dự án và xem chi tiết dự án", "Dùng JavaScript xử lý tương tác và kiểm tra dữ liệu trong biểu mẫu liên hệ", "Bổ sung kính lúp soi ghi chú, khóa mã số và thanh trượt mức độ nguy hiểm"] },
    p3: { no: "CASE #03 · ĐANG ĐIỀU TRA", title: "Website Cổng thông tin việc làm", meta: "HTML, CSS, JavaScript · Nhóm 6 thành viên · Đang phát triển",
          desc: "Website kết nối người tìm việc với nhà tuyển dụng, hỗ trợ tìm kiếm việc làm, đăng tin tuyển dụng, xem thông tin công ty và quản lý người dùng.",
          points: ["Phân tích yêu cầu chức năng và phi chức năng cho website kết nối người tìm việc với nhà tuyển dụng", "Tham gia thiết kế giao diện và bố cục cho các chức năng tìm kiếm việc làm, đăng tin tuyển dụng, xem thông tin công ty và quản lý người dùng", "Phối hợp với các thành viên trong nhóm để xây dựng một số chức năng giao diện bằng HTML, CSS và JavaScript"] }
  },
  roleLabel: "Động thái của đối tượng",
  err: {
    nameEmpty: "Vui lòng nhập họ tên.", nameShort: "Họ tên cần ít nhất 2 ký tự.",
    emailEmpty: "Vui lòng nhập email.", emailBad: "Email chưa đúng định dạng, ví dụ: ten@gmail.com.",
    msgEmpty: "Vui lòng nhập nội dung.", msgShort: "Nội dung cần ít nhất 10 ký tự.",
    fixForm: "Phiếu còn ô chưa hợp lệ — kiểm tra lại các ô đánh dấu đỏ."
  },
  sent: name => `Cảm ơn ${name}! Lệnh triệu tập đã được đóng dấu và ghi nhận.`,
  sentToast: "Lệnh triệu tập đã được phát ✓",
  copied: "Đã sao chép email ✓", copyFail: "Không sao chép được, hãy chép thủ công nhé.",
  wrongCode: "Sai mã. Gợi ý: ngày + tháng sinh (ddmm).", unlocked: "Giải mật thành công — đang xé niêm phong…",
  photoOf: "Tang vật"
};
