import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen({ onFinish }) {
  const blockScale = useRef(new Animated.Value(0.05)).current;
  const blockOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(20)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // "Block" scales up smoothly like iPhone hello
      Animated.parallel([
        Animated.timing(blockOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(blockScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.bezier(0.16, 1, 0.3, 1)),
          useNativeDriver: true,
        }),
      ]),
      // Subtitle slides up and fades in
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      // Whole screen fades out
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Main "Block" text — iPhone hello style */}
      <Animated.Text
        style={{
          fontSize: width * 0.18,
          fontWeight: "800",
          color: "#14ff57",
          letterSpacing: -2,
          opacity: blockOpacity,
          transform: [{ scale: blockScale }],
        }}
      >
        Block
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        style={{
          fontSize: 15,
          color: "#769a75",
          letterSpacing: 1.5,
          marginTop: 12,
          opacity: subtitleOpacity,
          transform: [{ translateY: subtitleY }],
        }}
      >
        your daily reminder
      </Animated.Text>
    </Animated.View>
  );
}
