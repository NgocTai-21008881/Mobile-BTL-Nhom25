import { supabase } from '../lib/supabase';

// Đăng nhập
export async function signInUser(email: string, password: string) {
    try {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error) return { error: error.message, user: null };
        if (!data) return { error: 'Email hoặc mật khẩu không đúng.', user: null };

        return { error: null, user: data };
    } catch (e: any) {
        return { error: e.message ?? 'Không thể kết nối máy chủ.', user: null };
    }
}

// ✅ Đăng ký người dùng mới
export async function signUpUser(username: string, email: string, password: string) {
    try {
        // Kiểm tra trùng email
        const { data: existing } = await supabase
            .from('user')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (existing) {
            return { error: 'Email đã tồn tại, vui lòng chọn email khác.', user: null };
        }

        // Thêm user mới
        const { data, error } = await supabase
            .from('user')
            .insert([{ username, email, password }])
            .select()
            .single();

        if (error) return { error: error.message, user: null };
        return { error: null, user: data };
    } catch (e: any) {
        return { error: e.message ?? 'Không thể kết nối máy chủ.', user: null };
    }
}
