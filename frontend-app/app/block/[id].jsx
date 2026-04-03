import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../utils/axios";

export default function BlockDetail() {
  const { id } = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [viewed, setViewed] = useState(false);
  const router = useRouter();

  const fetchTodayCard = async () => {
    try {
      const { data } = await api.get(`/cards/today/${id}`);
      setCard(data);
    } catch (err) {
      Alert.alert(
        "No card today",
        err.response?.data?.message || "No card scheduled for today",
      );
    } finally {
      setLoading(false);
    }
  };

  const markViewed = async (cardId) => {
    if (viewed) return;
    try {
      setMarking(true);
      await api.post(`/cards/${cardId}/view`);
      setViewed(true);
    } catch (err) {
      console.error("Failed to mark viewed", err.message);
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    fetchTodayCard();
  }, [id]);

  useEffect(() => {
    if (card) markViewed(card._id);
  }, [card]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!card) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          No card for today
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Check back tomorrow or wait for the nightly generation
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: "#4F46E5", borderRadius: 8, padding: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View style={{ padding: 24, paddingTop: 60 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <Text style={{ color: "#4F46E5", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
          {new Date().toDateString()}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 24 }}>
          Today's Card
        </Text>

        {/* Render all content fields dynamically */}
        {Object.entries(card.content).map(([key, value]) => {
          if (key === "tags") return null;
          return (
            <View
              key={key}
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
                style={{
                  fontSize: 12,
                  color: "#999",
                  marginBottom: 6,
                  textTransform: "capitalize",
                }}
              >
                {key.replace(/_/g, " ")}
              </Text>
              <Text style={{ fontSize: 16, color: "#333", lineHeight: 24 }}>
                {String(value)}
              </Text>
            </View>
          );
        })}

        {viewed && (
          <View
            style={{
              backgroundColor: "#DCFCE7",
              borderRadius: 8,
              padding: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#16A34A", fontWeight: "600" }}>
              Marked as viewed
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
