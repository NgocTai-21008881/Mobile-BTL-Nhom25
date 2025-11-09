//services/blogService.ts
// services/blogService.ts
import { supabase } from '../lib/supabase';

export async function getBlogs() {
    const { data, error } = await supabase
        .from('blogs')
        .select('id, ngaytao, tieude, luongxem, loai, hinhanh')
        .order('id', { ascending: true });

    if (error) {
        console.error('Lỗi Supabase:', error.message);
        return [];
    }

    console.log('Dữ liệu blogs:', data); // Kiểm tra console log
    return data;
}
