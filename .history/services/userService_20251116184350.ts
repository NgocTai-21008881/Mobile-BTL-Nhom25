import { supabase } from "../lib/supabase";

// Đăng nhập
export async function signInUser(email: string, password: string) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .eq("password", password)
            .single();

        if (error || !data) {
            return { error: "Email hoặc mật khẩu không đúng.", user: null };
        }
        return { error: null, user: data };
    } catch (e: any) {
        return { error: e.message ?? "Không thể kết nối máy chủ.", user: null };
    }
}

// Đăng ký
export async function signUpUser(
    username: string,
    email: string,
    password: string
) {
    try {
        // Kiểm tra email tồn tại
        const { data: existing } = await supabase
            .from("users")
            .select("email")
            .eq("email", email)
            .maybeSingle();

        if (existing) {
            return {
                error: "Email đã tồn tại, vui lòng chọn email khác.",
                user: null,
            };
        }

        // Thêm user mới
        const { data, error } = await supabase
            .from("users")
            .insert([{ username, email, password }])
            .select()
            .single();

        if (error) return { error: error.message, user: null };
        return { error: null, user: data };
    } catch (e: any) {
        return { error: e.message ?? "Không thể kết nối máy chủ.", user: null };
    }
}
