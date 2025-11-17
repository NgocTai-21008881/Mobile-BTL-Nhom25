# 🔧 Xử lý sự cố Đăng ký (Sign Up)

## ❌ Vấn đề: Dữ liệu không lưu vào Supabase

### 📍 Dữ liệu đăng ký được lưu ở đâu?

**2 nơi:**

1. **`auth.users`** (Supabase Authentication)
   - Tự động được tạo bởi `supabase.auth.signUp()`
   - Chứa: id, email, password
   - Xem tại: Dashboard → Authentication → Users

2. **`public.users`** (Bảng users)
   - Tạo thêm bởi script SQL
   - Chứa: id, email, username, avatar_url, bio, created_at, updated_at
   - Xem tại: Dashboard → SQL Editor → `SELECT * FROM public.users;`

---

## 🔍 Kiểm tra từng bước

### Bước 1: Kiểm tra Trigger
```sql
-- Chạy trong SQL Editor
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
**Kết quả:**
- ✅ Nếu có dòng → Trigger đã được tạo
- ❌ Nếu trống → Chạy SQL script lại

### Bước 2: Kiểm tra Table Users
```sql
-- Xem schema của bảng
\d public.users

-- Lấy tất cả user
SELECT * FROM public.users;
```

### Bước 3: Kiểm tra RLS Policy
```sql
-- Xem các policy
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## 🚨 Các lỗi có thể gặp

### Lỗi 1: "Email đã tồn tại" nhưng chưa signup bao giờ
**Nguyên nhân:** RLS Policy chặn query
**Giải pháp:** Disable RLS tạm thời hoặc chỉnh policy

```sql
-- Tạm thời disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Sau khi test xong, enable lại
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Lỗi 2: "Không thể insert vào bảng users"
**Nguyên nhân:** Trigger lỗi hoặc RLS policy chặn
**Giải pháp:** Kiểm tra error message trong console

---

## ✅ Quy trình Đăng ký Đúng

```
1. User nhập email, password, username
2. Validate (format email, password ≥ 6, username ≥ 3)
3. Check duplicate (email & username)
4. supabase.auth.signUp() → Tạo auth.users
5. supabase.from('users').insert() → Tạo public.users
6. Alert "✅ Đăng ký thành công"
7. Redirect sang login
```

---

## 🎯 Cách Test

### Test 1: Đăng ký bằng form
1. Mở app
2. Bấm "Sign up"
3. Nhập email, password (6+ ký tự), username (3+ ký tự)
4. Bấm "Sign Up"
5. Kiểm tra console có message không

### Test 2: Kiểm tra data trong Supabase
1. Dashboard → Authentication → Users
   - ✅ Nên thấy email vừa đăng ký

2. Dashboard → SQL Editor → Chạy:
   ```sql
   SELECT * FROM public.users WHERE email = 'email@bạn.đã.signup';
   ```
   - ✅ Nên thấy row với username, email, id

### Test 3: Nếu không thấy data
1. Kiểm tra error message trong console
2. Có thể RLS Policy chặn
3. Tạm disable RLS (xem phần "Lỗi 1")

---

## 📝 Console Messages

Bạn sẽ thấy log như:
```
📝 Đang tạo tài khoản: email@example.com
🔍 Kiểm tra email và username...
✅ Email và username không trùng
✅ Auth user được tạo thành công, ID: uuid-xxx
📝 Đang insert user profile vào bảng users...
✅ User profile đã được lưu: [...]
```

**Nếu không thấy dòng "✅ User profile đã được lưu":**
- Có lỗi ở bước insert
- Kiểm tra RLS policy

---

## 🆘 Cần giúp?

Nếu vẫn không work:
1. Kiểm tra console log → copy lỗi
2. Kiểm tra Supabase Dashboard → SQL Editor → xem RLS policy
3. Tạm disable RLS để test

