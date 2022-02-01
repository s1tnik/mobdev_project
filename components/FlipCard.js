import React, { useRef, useState } from "react";
import {
  Text,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Animated,
} from "react-native";
import { useTailwind } from "tailwind-rn";

const FlipCard = ({ front, back }) => {
  const animate = useRef(new Animated.Value(0));
  const [isFlipped, setIsFlipped] = useState(false);
  const tailwind = useTailwind();

  const doAFlip = () => {
    Animated.timing(animate.current, {
      duration: 300,
      toValue: isFlipped ? 0 : 180,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  const interpolatedValueFront = animate.current.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const interpolatedValueBack = animate.current.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const rotateFront = {
    transform: [
      {
        rotateY: interpolatedValueFront,
      },
    ],
  };

  const rotateBack = {
    transform: [
      {
        rotateY: interpolatedValueBack,
      },
    ],
  };

  return (
    <TouchableWithoutFeedback onPress={doAFlip}>
      <View>
        <Animated.View style={[styles.hidden, rotateFront]}>
          <View
            style={[
              styles.card,
              tailwind(
                "flex justify-center items-center p-6 text-center bg-gray-50 border border-gray-200 mx-16"
              ),
            ]}
          >
            <Text style={tailwind("text-lg text-center")}>{front}</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.hidden, styles.back, rotateBack]}>
          <View
            style={[
              styles.card,
              tailwind(
                "flex justify-center items-center p-6 text-center bg-gray-50 border border-gray-200 mx-16"
              ),
            ]}
          >
            <Text style={tailwind("text-lg text-center")}>{back}</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  hidden: {
    backfaceVisibility: "hidden",
  },
  card: {
    width: 200,
    height: 400,
  },
  back: {
    position: "absolute",
    top: 0,
    width: "100%",
  },
  textInput: {
    fontSize: 18,
  },
});

export default FlipCard;
