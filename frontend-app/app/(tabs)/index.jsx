import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../utils/axios";
import { useAuthStore } from "../../store/authStore";

export default function Home() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const fetchSubscribedBlocks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/blocks/subscribed");
      setBlocks(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load your blocks");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubscribedBlocks();
    }, []),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View
        style={{
          padding: 24,
          paddingTop: 60,
          backgroundColor: "#fff",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Good day,</Text>
          <Text style={{ fontSize: 16, color: "#666" }}>{user?.name}</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#FEE2E2",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "#EF4444", fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {blocks.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            No blocks yet
          </Text>
          <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
            Go to Explore tab to subscribe to your first block
          </Text>
        </View>
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/block/${item._id}`)}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}
              >
                {item.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                {item.description || item.promptTemplate?.topic}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {item.tags?.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: "#EEF2FF",
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginRight: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#4F46E5" }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={{ fontSize: 12, color: "#4F46E5", fontWeight: "600" }}
              >
                Tap to see today's card →
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
