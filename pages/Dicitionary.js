import React, { useEffect, useState } from "react";
import { useTailwind } from "tailwind-rn";
import {
  ActivityIndicator,
  Button,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const base_url = "https://api.dictionaryapi.dev/api/v2/entries/en";
const MAX_SAVED_WORDS = 20;

const Dictionary = React.memo(function Dictionary({
  term,
  setTerm,
  initInformation,
}) {
  const tailwind = useTailwind();

  const [information, setInformation] = useState(initInformation || false);
  const [loading, setLoading] = useState(false);
  const [cachedWords, setCachedWords] = useState([]);
  const [sound, setSound] = React.useState();

  async function playAndLoadSound(url) {
    const { sound } = await Audio.Sound.createAsync({ uri: `https:${url}` });
    setSound(sound);
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const updateCachedWords = () => {
    AsyncStorage.getItem("cached_words").then((response) => {
      if (!response) return;
      setCachedWords(JSON.parse(response));
    });
  };

  useEffect(() => {
    updateCachedWords();
  }, [information]);

  const handleOnSearch = async () => {
    if (!term) return;

    setLoading(true);

    try {
      const response = await fetch(`${base_url}/${term}`, {
        method: "GET",
      });
      const data = await response.json();

      if (data.message) {
        setInformation(data);
      } else {
        const cachedJSON = await AsyncStorage.getItem("cached_words");
        let temp = JSON.parse(cachedJSON);

        if (!cachedJSON) {
          temp = [];
        }

        if (
          !temp.find(
            (item) => item?.word.toLowerCase() === data[0].word.toLowerCase()
          )
        ) {
          temp.unshift(data[0]);

          await AsyncStorage.setItem(
            "cached_words",
            JSON.stringify(temp.slice(0, MAX_SAVED_WORDS))
          );
        }

        setInformation(data[0]);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!term) {
      return setInformation(false);
    }

    handleOnSearch();
  }, [term]);

  if (loading) {
    return (
      <View
        style={tailwind("bg-white flex justify-center items-center h-full")}
      >
        <ActivityIndicator size="large" color="#7dd3fc" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    return <Item item={item} />;
  };

  const Item = ({ item }) => (
    <View>
      <TouchableOpacity
        style={tailwind("p-3 border-b border-gray-100")}
        onPress={() => setInformation(item)}
      >
        <Text style={tailwind("text-lg")}>{item.word}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={tailwind("bg-white h-full")}>
      {information?.word ? (
        <ScrollView style={tailwind("flex")}>
          <View style={tailwind("p-3 mb-3 border-b border-gray-100")}>
            <View
              style={[
                tailwind("mb-1 flex flex-row"),
                {
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              ]}
            >
              <View style={[tailwind("mb-1 flex flex-row items-center")]}>
                <Text style={tailwind("text-2xl mr-3 font-bold")}>
                  {information.word}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    playAndLoadSound(information.phonetics[0].audio)
                  }
                >
                  <Text style={tailwind("text-4xl mr-3 text-red-600")}>
                    &#9834;
                  </Text>
                </TouchableOpacity>
                <Text style={tailwind("text-xl text-gray-500")}>
                  /{information.phonetic}/
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setInformation(false);
                  setTerm("");
                }}
              >
                <Text style={tailwind("text-4xl mr-3 text-sky-600 font-bold")}>
                  &#8592;
                </Text>
              </TouchableOpacity>
            </View>
            {information.origin ? (
              <Text style={tailwind("text-base italic")}>
                {information.origin}
              </Text>
            ) : null}
          </View>
          <Text style={tailwind("px-3 text-xl mb-3")}>Meanings:</Text>

          {information.meanings.map(({ partOfSpeech, definitions }, index) => (
            <View
              key={partOfSpeech}
              style={tailwind(
                `p-3 ${(index + 1) % 2 === 0 ? "bg-gray-50" : "bg-sky-50"}`
              )}
            >
              <Text style={tailwind("text-lg leading-5")}>
                Part of speech:{" "}
                <Text style={tailwind("italic text-blue-500")}>
                  {partOfSpeech}
                </Text>
              </Text>

              {definitions.slice(0, 1).map(({ definition, example }) => (
                <View style={tailwind("")} key={definition}>
                  <Text
                    style={tailwind("text-lg leading-5 py-2 text-orange-400")}
                  >
                    : {definition}
                  </Text>
                  <Text style={tailwind("text-lg leading-5")}>
                    Example: {example}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : null}
      {information?.title !== undefined ? (
        <View style={tailwind("p-3 flex justify-center ")}>
          <Text style={tailwind("text-2xl text-red-600 leading-7 mb-2")}>
            {information.title}
          </Text>
          <Text style={tailwind("text-xl leading-7 mb-2")}>
            {information.message}
          </Text>
          <Text style={tailwind("text-xl text-gray-500 leading-7 mb-2")}>
            {information.resolution}
          </Text>
        </View>
      ) : null}

      {cachedWords.length && !information ? (
        <SafeAreaView>
          <FlatList
            data={cachedWords}
            renderItem={renderItem}
            keyExtractor={(item) => item.word}
          />
        </SafeAreaView>
      ) : null}
    </View>
  );
});

export default Dictionary;
