/*
 * PHÂN TÍCH TRADE-OFF: MENU NGUYÊN KHỐI (MONOLITHIC) vs MENU MÔ-ĐUN HÓA (MODULAR)
 *
 * ============================================================
 * 1. BẢNG SO SÁNH KỸ THUẬT
 * ============================================================
 * | Tiêu chuẩn            | Monolithic Switch-Case                  | Modular Function Architecture                 |
 * |-----------------------|-----------------------------------------|-----------------------------------------------|
 * | Độ dài khối switch    | Hàng trăm dòng, cực kỳ khó đọc          | Rất ngắn (1 dòng gọi hàm mỗi case)            |
 * | Khả năng tái sử dụng  | Bằng 0 (logic dính chặt vào menu CLI)   | Rất cao (hàm dùng lại cho API/Web)            |
 * | Khả năng viết Unit    | Không thể test từng chức năng độc lập   | Rất dễ, kiểm thử từng hàm riêng biệt          |
 * | Test                  |                                         |                                               |
 * | Khả năng bảo trì      | Sửa 1 chức năng phải đọc cả khối; biến  | Sửa đúng 1 hàm; biến cục bộ, phạm vi lỗi nhỏ  |
 * |                       | dùng chung dễ bị ghi đè nhầm giữa case  |                                               |
 * | Khả năng mở rộng      | Khối switch phình lên hàng nghìn dòng,  | Thêm 1 hàm + 1 dòng case; switch chỉ tăng     |
 * | (5 -> 20 chức năng)   | dễ trùng tên biến, xung đột giữa case   | 15 dòng, các chức năng không ảnh hưởng nhau   |
 * | Làm việc nhóm         | Nhiều người sửa cùng 1 khối, dễ xung đột| Mỗi người làm 1 hàm riêng, ít xung đột        |
 *
 * ============================================================
 * 2. VÌ SAO CẦN BÓC TÁCH TỪNG CASE THÀNH HÀM ĐỘC LẬP?
 * ============================================================
 * - Nguyên lý Đơn nhiệm (SRP): mỗi đơn vị code chỉ có MỘT lý do để thay đổi.
 *   Trong bản nguyên khối, khối switch vừa điều hướng menu, vừa nhập liệu, vừa xử lý
 *   nghiệp vụ, vừa in kết quả, nên đổi bất kỳ thứ nào cũng phải sửa cùng một chỗ.
 *   Sau khi tách: switch chỉ lo ĐIỀU HƯỚNG; mỗi hàm chỉ lo MỘT nghiệp vụ.
 * - Kiểm thử: hàm nhận tham số và trả về kết quả thì gọi trực tiếp để test được;
 *   còn logic nằm trong case thì phải chạy cả menu và gõ phím mới kiểm tra được.
 * - Tái sử dụng: hàm không phụ thuộc giao diện CLI nên dùng lại được cho API/Web.
 * - Dễ đọc, dễ bảo trì: đọc switch là hiểu ngay chương trình có những chức năng gì.
 *
 * ============================================================
 * 3. TRADE-OFF (SỰ ĐÁNH ĐỔI)
 * ============================================================
 * - Monolithic: viết nhanh với chương trình rất nhỏ, nhưng nợ kỹ thuật tăng rất nhanh.
 * - Modular: tốn công thiết kế ban đầu (đặt tên hàm, chia tham số/giá trị trả về),
 *   nhưng chi phí bảo trì, kiểm thử và mở rộng thấp hơn nhiều khi menu lớn lên.
 * => Với menu 20 chức năng, kiến trúc mô-đun hóa là lựa chọn đúng.
 */

// ============================================================
// 4. MÃ MẪU MINH HỌA
// ============================================================

const subscriptions = [
  { subscriptionId: 'SUB_001', customerName: 'Nguyen Van An', planTier: 'FAMILY', deviceLimit: 5 },
  { subscriptionId: 'SUB_002', customerName: 'Tran Thi Mai', planTier: 'PERSONAL', deviceLimit: 2 }
];

// ---------- CÁCH CŨ: MONOLITHIC (KHÔNG NÊN DÙNG) ----------
// Toàn bộ logic nằm trong case: không gọi lại được, không test riêng được.
function runMenuMonolithic(menuChoice, input) {
  switch (menuChoice) {
    case 1:
      // vừa kiểm tra dữ liệu, vừa tạo mã, vừa thêm mảng, vừa in kết quả
      if (input.name === '') {
        console.log('Lỗi: tên trống');
      } else {
        const id = 'SUB_' + String(subscriptions.length + 1).padStart(3, '0');
        subscriptions.push({ subscriptionId: id, customerName: input.name, planTier: input.plan, deviceLimit: input.plan === 'FAMILY' ? 5 : 2 });
        console.log('Đã thêm ' + id);
      }
      break;
    case 2:
      // ... hàng chục dòng in bảng ...
      break;
    case 3:
      // ... hàng chục dòng tìm theo mã, kiểm tra, cập nhật ...
      break;
    // ... còn nhiều case dài hàng trăm dòng nữa ...
  }
}

// ---------- CÁCH MỚI: MODULAR (NÊN DÙNG) ----------
// Mỗi hàm đơn nhiệm: nghiệp vụ trả kết quả, không phụ thuộc giao diện CLI.
function getDeviceLimit(planTier) {
  return planTier === 'FAMILY' ? 5 : 2;
}

function addSubscription(list, name, planTier) {
  if (name === '') return null; // dữ liệu sai thì trả về null
  const id = 'SUB_' + String(list.length + 1).padStart(3, '0');
  const sub = { subscriptionId: id, customerName: name, planTier: planTier, deviceLimit: getDeviceLimit(planTier) };
  list.push(sub);
  return sub;
}

function listSubscriptions(list) {
  for (let i = 0; i < list.length; i++) {
    console.log(list[i].subscriptionId + ' | ' + list[i].customerName + ' | ' + list[i].planTier + ' | ' + list[i].deviceLimit);
  }
}

function updateSubscription(list, id, newPlan) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].subscriptionId === id) {
      list[i].planTier = newPlan;
      list[i].deviceLimit = getDeviceLimit(newPlan);
      return true;
    }
  }
  return false;
}

// Khối switch giờ chỉ còn điều hướng: mỗi case một dòng gọi hàm.
function runMenuModular(menuChoice, input) {
  switch (menuChoice) {
    case 1:
      const added = addSubscription(subscriptions, input.name, input.plan);
      console.log(added === null ? 'Lỗi: tên trống' : 'Đã thêm ' + added.subscriptionId);
      break;
    case 2:
      listSubscriptions(subscriptions);
      break;
    case 3:
      console.log(updateSubscription(subscriptions, input.id, input.plan) ? 'Đã cập nhật' : 'Không tìm thấy');
      break;
    default:
      console.log('Lựa chọn không hợp lệ');
  }
}

// ---------- DEMO: KIỂM THỬ ĐỘC LẬP HÀM, KHÔNG CẦN CHẠY MENU ----------
console.log('--- Unit test từng hàm riêng biệt ---');
const testList = [];
console.log('addSubscription tên trống -> null:', addSubscription(testList, '', 'FAMILY') === null);
console.log('addSubscription hợp lệ -> SUB_001, 5 thiết bị:',
  addSubscription(testList, 'Test User', 'FAMILY').deviceLimit === 5);
console.log('updateSubscription đúng mã -> true:', updateSubscription(testList, 'SUB_001', 'PERSONAL') === true);
console.log('updateSubscription sai mã -> false:', updateSubscription(testList, 'SUB_999', 'FAMILY') === false);
console.log('Hạn mức sau cập nhật = 2:', testList[0].deviceLimit === 2);

console.log('\n--- Chạy qua menu mô-đun ---');
runMenuModular(1, { name: 'Le Quoc Bao', plan: 'PERSONAL' });
runMenuModular(3, { id: 'SUB_003', plan: 'FAMILY' });
runMenuModular(2, {});
