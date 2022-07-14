import React, { useEffect } from "react";
import { Text,View, Image,StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';
function CustomSplashScreen(props) {
  return (
    <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: props.isDarkMode ? "#222124" : "#fff",
      }}
      onLayout={props.onLoadLayout}>
      <LottieView 
      style={{ width: 196, height: 196 }}
       source={require("./../assets/cine.json")}
        autoPlay
        loop={false}
        resizeMode='cover'
        onAnimationFinish={() => {
          console.log('animation finished')
        }}
       />
    <Text style={{ text: {
    alignItems: 'center',
    marginTop: 100,
    fontWeight: 'bold',
  
  }}}>My Movies APP!</Text>
    </View>
    
  );
}


export default CustomSplashScreen;
