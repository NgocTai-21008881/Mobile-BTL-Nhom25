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
        return { error: null, user: data };
    } catch (e: any) {
        return { error: e.message ?? "Không thể kết nối máy chủ.", user: null };
    }
}
