import 'react-native-gesture-handler'
import React, {useEffect, useState} from "react";
import Dictionary from "./pages/Dicitionary";
import FlashCards from "./pages/FlashCards";
import {NavigationContainer} from "@react-navigation/native";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {TextInput} from "react-native";
import {TailwindProvider} from "tailwind-rn";
import utilities from "./tailwind.json";
import {useTailwind} from "tailwind-rn/dist";


export default function App() {
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  const tailwind = useTailwind();

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(term);
    }, 700);

    return () => clearTimeout(timerId);
  }, [term]);

  const handleOnChange = value => {
    setTerm(value);
  };

  const Drawer = createDrawerNavigator();

  return (
      <TailwindProvider utilities={utilities}>
        <NavigationContainer>
          <Drawer.Navigator initialRouteName="Dictionary">
            <Drawer.Screen
                options={{
                  headerTitle: () => (
                      <TextInput
                          placeholder="Search"
                          style={[
                            {
                              height: 35,
                              borderWidth: 1,
                              padding: 10,
                              borderColor: "#e5e7eb",
                            },
                          ]}
                          onChangeText={handleOnChange}
                          value={term}
                      />
                  ),
                }}
                name="Dictionary">
              {props => (
                  <Dictionary {...props} term={debouncedTerm} setTerm={setTerm} />
              )}
            </Drawer.Screen>
            <Drawer.Screen name="Flashcards" component={FlashCards} />
          </Drawer.Navigator>
        </NavigationContainer>
      </TailwindProvider>
  );
}
