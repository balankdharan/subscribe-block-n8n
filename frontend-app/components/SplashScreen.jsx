import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onFinish());
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#4F46E5",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 48 }}>📚</Text>
        </View>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#fff",
            letterSpacing: 1,
          }}
        >
          RemindBlock
        </Text>
      </Animated.View>

      <Animated.Text
        style={{
          opacity: taglineAnim,
          fontSize: 16,
          color: "rgba(255,255,255,0.8)",
          marginTop: 12,
          letterSpacing: 0.5,
        }}
      >
        Learn something new every day
      </Animated.Text>
    </View>
  );
}
