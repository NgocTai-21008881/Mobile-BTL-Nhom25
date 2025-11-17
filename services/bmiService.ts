import { supabase } from '../lib/supabase';

export async function getBMIRecords(userId: string, range: 'week' | 'month' = 'week') {
    try {
        const today = new Date();
        const startDate = new Date();

        if (range === 'week') startDate.setDate(today.getDate() - 6);
        else startDate.setDate(today.getDate() - 29);

        const { data, error } = await supabase
            .from('bmi_records')
            .select('date, weight, height, bmi')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', today.toISOString().split('T')[0])
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Lỗi tải BMI:', e);
        return [];
    }
}

export async function addBMIRecord(
    userId: string,
    date: string,
    weight: number,
    height: number
) {
    const bmi = weight / (height * height);

    try {
        const { data, error } = await supabase
            .from('bmi_records')
            .insert([
                {
                    user_id: userId,
                    date,
                    weight,
                    height,
                    bmi: parseFloat(bmi.toFixed(1)),
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return { error: null, data };
    } catch (e: any) {
        return { error: e.message, data: null };
    }
}