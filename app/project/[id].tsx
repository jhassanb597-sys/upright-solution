import React from 'react';
import {View} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {BuilderProjectDetailsScreen} from '../../src/screens/BuilderProjectDetailsScreen';
import {getBuilderProjectById} from '../../src/data/builderProjects';
import {COLORS} from '../../src/theme';

export default function BuilderProjectRoute() {
  const {id} = useLocalSearchParams<{id: string}>();
  const project = getBuilderProjectById(String(id));

  return (
    <View style={{flex: 1, alignItems: 'center', backgroundColor: COLORS.background}}>
      <View style={{flex: 1, width: '100%', maxWidth: 720}}>
        <BuilderProjectDetailsScreen project={project} />
      </View>
    </View>
  );
}
