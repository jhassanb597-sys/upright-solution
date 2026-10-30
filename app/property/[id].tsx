import React from 'react';
import {View} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {ListingDetailsScreen} from '../../src/screens/ListingDetailsScreen';
import {MOCK_LISTINGS} from '../../src/data/listings';
import {COLORS} from '../../src/theme';
import {getListingById} from '../../src/services/listingService';

export default function PropertyRoute() {
  const {id} = useLocalSearchParams<{id: string}>();
  const list = MOCK_LISTINGS || [];
  // Safety: never crash on an unknown id - fall back to the first listing.
  const listing = getListingById(String(id)) || list.find(l => l.id === String(id)) || list[0];
  return (
    <View style={{flex: 1, alignItems: 'center', backgroundColor: COLORS.background}}>
      <View style={{flex: 1, width: '100%', maxWidth: 720}}>
        <ListingDetailsScreen listing={listing} />
      </View>
    </View>
  );
}
