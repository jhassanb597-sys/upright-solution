import React from 'react';
import {View} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {ServiceDetailsScreen} from '../../src/screens/ServiceDetailsScreen';
import {getServiceBySlug} from '../../src/data/services';
import {COLORS} from '../../src/theme';

export default function ServiceRoute() {
  const {slug} = useLocalSearchParams<{slug: string}>();
  const service = getServiceBySlug(String(slug ?? ''));

  return (
    <View style={{flex: 1, backgroundColor: COLORS.background}}>
      <ServiceDetailsScreen service={service} />
    </View>
  );
}
