import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useTailwind } from "tailwind-rn";
import FlipCard from "../components/FlipCard";
import PagerView from "react-native-pager-view";
import { ShakeEventExpo } from "../utils/shake-event";

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function FlashCards({ navigation }) {
  const [cachedWords, setCachedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const tailwind = useTailwind();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      AsyncStorage.getItem("cached_words").then((response) => {
        if (response) {
          setCachedWords(shuffleArray(JSON.parse(response)));
        }
      });
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    ShakeEventExpo.addListener(() => {
      setLoading(true);
      setTimeout(() => {
        setCachedWords((prevState) => shuffleArray(prevState));
        setLoading(false);
      }, 1000);
    });

    return () => {
      ShakeEventExpo.removeListener();
    };
  }, []);

  const renderItem = (item) => {
    return (
      <FlipCard
        key={item.word}
        front={item.meanings[0].definitions[0].definition}
        back={item.word}
      />
    );
  };

  if (loading)
    return (
      <View
        style={tailwind("bg-white flex justify-center items-center h-full")}
      >
        <ActivityIndicator size="large" color="#7dd3fc" />
      </View>
    );

  return (
    <View style={tailwind("bg-white flex items-center h-full")}>
      {cachedWords.length ? (
        <PagerView style={[tailwind("mt-16")]} initialPage={0}>
          {cachedWords.map((item) => renderItem(item))}
        </PagerView>
      ) : (
        <View style={tailwind("flex items-center justify-center h-full")}>
          <Text style={tailwind("text-xl")}>You don't have any flashcards</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Dictionary")}>
            <Text style={tailwind("text-lg text-sky-400")}>
              Try to search for words
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default FlashCards;
