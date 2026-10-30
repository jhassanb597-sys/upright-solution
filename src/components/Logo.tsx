import React from 'react';
import {Image, Text, View} from 'react-native';

export function Logo() {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image source={require('../../assets/icon.png')} style={{width: 38, height: 38, resizeMode: 'contain', marginRight: 8}} />
      <Text style={{fontWeight: '800', fontSize: 17}}>Upright Solution</Text>
    </View>
  );
}
