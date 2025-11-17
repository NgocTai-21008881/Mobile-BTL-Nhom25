import { supabase } from "../lib/supabase";

// ========================================
// Lấy thông tin profile user
// ========================================
export async function getUserProfile(userId: string) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("❌ Lỗi lấy profile:", error.message);
            return { error: error.message, user: null };
        }

        return { error: null, user: data };
    } catch (e: any) {
        return { error: e.message ?? "Không thể kết nối máy chủ.", user: null };
    }
}

// ========================================
// Cập nhật profile user
// ========================================
export async function updateUserProfile(userId: string, updates: any) {
    try {
        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("❌ Lỗi cập nhật profile:", error.message);
            return { error: error.message, user: null };
        }

        return { error: null, user: data };
    } catch (e: any) {
        return { error: e.message ?? "Không thể kết nối máy chủ.", user: null };
    }
}

// ========================================
// Kiểm tra username có tồn tại không
// ========================================
export async function checkUsernameExists(username: string) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .maybeSingle();

        if (error) {
            console.error("❌ Lỗi kiểm tra username:", error.message);
            return { exists: false, error: error.message };
        }

        return { exists: !!data, error: null };
    } catch (e: any) {
        return { exists: false, error: e.message ?? "Lỗi máy chủ" };
    }
}

// ========================================
// Kiểm tra email có tồn tại không (auth)
// ========================================
export async function checkEmailExists(email: string) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (error) {
            console.error("❌ Lỗi kiểm tra email:", error.message);
            return { exists: false, error: error.message };
        }

        return { exists: !!data, error: null };
    } catch (e: any) {
        return { exists: false, error: e.message ?? "Lỗi máy chủ" };
    }
}

// ========================================
// Đăng ký tài khoản mới
// ========================================
export async function signUpUser(
    username: string,
    email: string,
    password: string
) {
    try {
        console.log("🔄 Starting signUpUser:", { username, email });

        // Kiểm tra username đã tồn tại
        const { exists: usernameExists } = await checkUsernameExists(username);
        if (usernameExists) {
            console.error("❌ Username exists:", username);
            return { error: "Username đã tồn tại", user: null };
        }

        console.log("✅ Username available:", username);

        // Tạo tài khoản auth (Supabase sẽ tự check email đã tồn tại)
        const { data: authData, error: authError } = await supabase.auth.signUp(
            {
                email: email,
                password: password,
            }
        );

        if (authError) {
            console.error("❌ Auth signup error:", authError.message);
            return { error: authError.message, user: null };
        }

        if (!authData.user) {
            console.error("❌ No user created in auth");
            return { error: "Lỗi tạo tài khoản", user: null };
        }

        console.log("✅ Auth user created:", authData.user.id);

        // Thêm user vào bảng users
        const { data: userData, error: userError } = await supabase
            .from("users")
            .insert([
                {
                    id: authData.user.id,
                    username: username,
                    email: email,
                    created_at: new Date().toISOString(),
                },
            ])
            .select();

        if (userError) {
            console.error("❌ Database insert error:", userError.message);
            return { error: userError.message, user: null };
        }

        console.log("✅ User inserted into database:", userData);
        
        // Nếu insert thành công nhưng không có data trả về, tạo object user từ dữ liệu đã gửi
        const user = (userData && (userData as any[]).length > 0) ? (userData as any[])[0] : {
            id: authData.user.id,
            username: username,
            email: email,
            created_at: new Date().toISOString(),
        };
        
        return { error: null, user };
    } catch (e: any) {
        console.error("❌ Catch error in signUpUser:", e);
        return { error: e.message ?? "Lỗi máy chủ", user: null };
    }
}
