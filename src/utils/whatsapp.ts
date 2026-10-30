import {Alert, Linking} from 'react-native';
import {OFFICE_CONTACTS} from '../data/officeContacts';

export async function openWhatsAppInquiry(message: string): Promise<void> {
  const contact = OFFICE_CONTACTS[0];
  const url = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('WhatsApp unavailable', 'This device cannot open WhatsApp right now.');
  }
}
