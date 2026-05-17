import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";

const defaultStyle = StyleSheet.create({
  input: { fontFamily: "PlayfairDisplay_400Regular" },
});

export function AppTextInput({ style, ...props }: TextInputProps) {
  return <TextInput style={[defaultStyle.input, style]} {...props} />;
}
