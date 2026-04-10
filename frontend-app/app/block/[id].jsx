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

const formatKey = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function BlockDetail() {
  const { id } = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
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
      await api.post(`/cards/${cardId}/view`);
      setViewed(true);
    } catch (err) {
      console.error("Failed to mark viewed", err.message);
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

  const entries = Object.entries(card.content).filter(([k]) => k !== "tags");

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* Fixed header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 16,
          backgroundColor: "#f9f9f9",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <Text style={{ color: "#4F46E5", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
          {new Date().toDateString()}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Today's Card</Text>
      </View>

      {/* Single scrollable card */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {entries.map(([key, value], index) => (
            <View
              key={key}
              style={{
                marginBottom: index === entries.length - 1 ? 0 : 24,
              }}
            >
              {/* Key as heading */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#4F46E5",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                {formatKey(key)}
              </Text>

              {/* Value as paragraph */}
              {Array.isArray(value) ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {value.map((v, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#EEF2FF",
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginRight: 6,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: "#4F46E5" }}>
                        {v}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: "#333",
                    lineHeight: 26,
                  }}
                >
                  {String(value)}
                </Text>
              )}

              {/* Divider between fields */}
              {index < entries.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#f0f0f0",
                    marginTop: 24,
                  }}
                />
              )}
            </View>
          ))}
        </View>

        {/* Tags */}
        {card.content.tags?.length > 0 && (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 16 }}
          >
            {card.content.tags.map((tag, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: "#EEF2FF",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 13, color: "#4F46E5" }}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {viewed && (
          <View
            style={{
              backgroundColor: "#DCFCE7",
              borderRadius: 8,
              padding: 12,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#16A34A", fontWeight: "600" }}>
              Marked as viewed
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
