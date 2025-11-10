import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { signInUser } from '../services/userService';


export default function SignInScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !pwd) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
            return;
        }

        setLoading(true);
        const { error, user } = await signInUser(email.trim(), pwd.trim());
        setLoading(false);

        if (error) {
            Alert.alert('Đăng nhập thất bại', error);
        } else {
            Alert.alert('Thành công', `Xin chào ${user.username}!`);
            navigation.replace('Home');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Welcome back <Text style={styles.wave}>👋</Text>
            </Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
                <AntDesign name="mail" size={18} color="#9AA0A6" />
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tai@gmail.com"
                    placeholderTextColor="#A7A7A7"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />
            </View>

            {/* Password */}
            <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
            <View style={styles.inputWrap}>
                <AntDesign name="lock" size={18} color="#9AA0A6" />
                <TextInput
                    value={pwd}
                    onChangeText={setPwd}
                    placeholder="1"
                    placeholderTextColor="#A7A7A7"
                    autoCapitalize="none"
                    secureTextEntry={secure}
                    style={styles.input}
                />
                <Pressable hitSlop={8} onPress={() => setSecure(!secure)}>
                    <AntDesign name="eye" size={20} color="#9AA0A6" />
                </Pressable>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Nút Sign In */}
            <TouchableOpacity
                style={[styles.signInBtn, loading && { opacity: 0.7 }]}
                onPress={handleSignIn}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.signInText}>Sign In</Text>
                )}
            </TouchableOpacity>

            {/* Phần dưới giữ nguyên */}
            <View style={styles.orWrap}>
                <View style={styles.hr} />
                <Text style={styles.orText}>OR LOG IN WITH</Text>
                <View style={styles.hr} />
            </View>

            <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                    <AntDesign name="google" size={22} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                    <AntDesign name="facebook" size={22} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                    <AntDesign name="apple" size={22} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomRow}>
                <Text style={{ color: '#666' }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
                    <Text style={{ color: '#4E6CF1', fontWeight: '600' }}>Sign up</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

// Giữ nguyên style của bạn
const RADIUS = 14;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 36,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 24,
        color: '#0B0B0C',
        textAlign: 'center',
        height: '20%',
    },
    wave: { fontSize: 24 },
    label: { fontSize: 13, color: '#666', marginBottom: 6 },
    inputWrap: {
        height: 48,
        borderRadius: RADIUS,
        backgroundColor: '#F3F5F7',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 10,
    },
    input: { flex: 1, fontSize: 15, paddingVertical: 0 },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 18 },
    forgotText: { color: '#4E6CF1', fontSize: 13, fontWeight: '500' },
    signInBtn: {
        height: 50,
        backgroundColor: '#5865F2',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signInText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    orWrap: {
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    orText: { color: '#9AA0A6', fontSize: 12, fontWeight: '700' },
    hr: { flex: 1, height: 1, backgroundColor: '#E6E8EB' },
    socialRow: {
        marginTop: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E6E8EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    bottomRow: {
        marginTop: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
