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
export async function signUpUser(username: string, email: string, password: string) {
    try {
        // Kiểm tra username đã tồn tại
        const { exists: usernameExists } = await checkUsernameExists(username);
        if (usernameExists) {
            return { error: "Username đã tồn tại", user: null };
        }

        // Kiểm tra email đã tồn tại
        const { exists: emailExists } = await checkEmailExists(email);
        if (emailExists) {
            return { error: "Email đã được đăng ký", user: null };
        }

        // Tạo tài khoản auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) {
            console.error("❌ Lỗi tạo tài khoản auth:", authError.message);
            return { error: authError.message, user: null };
        }

        if (!authData.user) {
            return { error: "Lỗi tạo tài khoản", user: null };
        }

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
            .select()
            .single();

        if (userError) {
            console.error("❌ Lỗi thêm user vào database:", userError.message);
            return { error: userError.message, user: null };
        }

        return { error: null, user: userData };
    } catch (e: any) {
        console.error("❌ Lỗi đăng ký:", e);
        return { error: e.message ?? "Lỗi máy chủ", user: null };
    }
}
