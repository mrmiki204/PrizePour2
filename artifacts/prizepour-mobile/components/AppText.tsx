import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

const defaultStyle = StyleSheet.create({
  text: { fontFamily: "PlayfairDisplay_400Regular" },
});

export function AppText({ style, ...props }: TextProps) {
  return <Text style={[defaultStyle.text, style]} {...props} />;
}
