import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const fetchHistory = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await api.get("/cards/history");
      setHistory(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [token]),
  );

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
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>History</Text>
        <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
          Cards you've viewed
        </Text>
      </View>

      {history.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            No history yet
          </Text>
          <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
            Cards you view will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.blockId?.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#999" }}>
                  {new Date(item.viewedDate).toDateString()}
                </Text>
              </View>

              {item.cardId?.content &&
                Object.entries(item.cardId.content)
                  .slice(0, 2)
                  .map(([key, value]) => {
                    if (key === "tags") return null;
                    return (
                      <View key={key} style={{ marginBottom: 6 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#999",
                            textTransform: "capitalize",
                          }}
                        >
                          {key.replace(/_/g, " ")}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={{
                            fontSize: 14,
                            color: "#333",
                            lineHeight: 20,
                          }}
                        >
                          {String(value)}
                        </Text>
                      </View>
                    );
                  })}
            </View>
          )}
        />
      )}
    </View>
  );
}
