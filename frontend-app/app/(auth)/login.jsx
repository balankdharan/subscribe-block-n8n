import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Fixed logo at top center */}
      <View style={{ alignItems: "center", paddingTop: 70 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#00CC44",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginTop: 20,
          }}
        >
          Block
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heading */}
        {/* <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#00CC44",
            letterSpacing: -1,
            marginBottom: 8,
          }}
        >
          Welcome back
        </Text> */}
        <Text
          style={{
            fontSize: 42,
            fontWeight: "800",
            color: "#eefded",
            letterSpacing: -1,
            marginBottom: 8,
          }}
        >
          Welcome back
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#4a7a5a",
            letterSpacing: 1,
            marginBottom: 38,
          }}
        >
          Sign in to continue
        </Text>

        {/* Email */}
        <Text
          style={{
            fontSize: 12,
            color: "#4a7a5a",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Email
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#2a3d2a"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          style={{
            borderWidth: 1,
            borderColor: "#1e2e1e",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: "#eefded",
            backgroundColor: "#0d150d",
            marginBottom: 24,
          }}
        />

        {/* Password */}
        <Text
          style={{
            fontSize: 12,
            color: "#4a7a5a",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Password
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#2a3d2a"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          style={{
            borderWidth: 1,
            borderColor: "#1e2e1e",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: "#eefded",
            backgroundColor: "#0d150d",
            marginBottom: 40,
          }}
        />

        {/* Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: "#00CC44",
            borderRadius: 12,
            padding: 18,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text
              style={{
                color: "#000",
                fontSize: 16,
                fontWeight: "800",
                letterSpacing: 0.5,
              }}
            >
              Sign in
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={{ marginTop: 24, alignItems: "center" }}
        >
          <Text style={{ color: "#4a7a5a", fontSize: 14, letterSpacing: 0.5 }}>
            Don't have an account?{" "}
            <Text style={{ color: "#00CC44", fontWeight: "600" }}>
              Register
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
