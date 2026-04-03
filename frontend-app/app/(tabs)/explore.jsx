import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../../utils/axios";

export default function Explore() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  const fetchBlocks = async () => {
    try {
      const { data } = await api.get("/blocks");
      setBlocks(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load blocks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (blockId) => {
    try {
      setSubscribing(blockId);
      await api.post(`/blocks/${blockId}/subscribe`);
      Alert.alert("Success", "Subscribed successfully!");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to subscribe",
      );
    } finally {
      setSubscribing(null);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View style={{ padding: 24, paddingTop: 60, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Explore Blocks</Text>
        <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
          Discover and subscribe to daily reminder blocks
        </Text>
      </View>

      <FlatList
        data={blocks}
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
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
              {item.name}
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
              {item.description || item.promptTemplate?.topic}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 12,
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
                  <Text style={{ fontSize: 12, color: "#4F46E5" }}>{tag}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => handleSubscribe(item._id)}
              disabled={subscribing === item._id}
              style={{
                backgroundColor: "#4F46E5",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
            >
              {subscribing === item._id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Subscribe
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
