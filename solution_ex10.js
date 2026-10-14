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
