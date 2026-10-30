import React, {useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {COLORS} from '../theme';
import {PressableOpacity} from '../components/PressableOpacity';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OFFICE_CONTACTS} from '../data/officeContacts';


type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const WELCOME_MESSAGE =
  'Assalam-o-alaikum! I can help with buying, selling, renting, builders and contractors across Karachi. What are you looking for?';

const AREA_NOTES: {name: string; pattern: RegExp; note: string}[] = [
  {
    name: 'Gohar Green City',
    pattern: /gohar\s+green\s+city/i,
    note: 'For Gohar Green City, verify the current NOC and approved plan, plot or unit number, title/transfer chain, dues, development status and possession terms directly with the relevant authorities before paying.',
  },
  {
    name: 'Malir',
    pattern: /\bmalir\b/i,
    note: 'In Malir, compare the exact scheme and block rather than relying on the area name alone; confirm title, approvals, access, utilities, development status and transfer charges.',
  },
  {
    name: 'DHA',
    pattern: /\bdha\b/i,
    note: 'In DHA, check phase and street-level comparables, property dues, transfer requirements and any renovation or building approvals with the relevant DHA office.',
  },
  {
    name: 'Clifton',
    pattern: /\bclifton\b/i,
    note: 'In Clifton, compare the block and building, and confirm title/lease status, maintenance charges, parking, building condition and any applicable approvals.',
  },
  {
    name: 'Gulshan-e-Iqbal',
    pattern: /\bgulshan(?:-e-iqbal)?\b/i,
    note: 'In Gulshan-e-Iqbal, compare the exact block and property type; check lease/title records, building condition, utilities, parking and transfer costs.',
  },
  {
    name: 'PECHS',
    pattern: /\bpechs\b/i,
    note: 'In PECHS, verify the exact street/unit situation, title or lease chain, building approvals, parking and serviceability before proceeding.',
  },
  {
    name: 'North Nazimabad',
    pattern: /\bnorth\s+nazimabad\b/i,
    note: 'In North Nazimabad, compare the block, street and unit count; confirm layout approvals, title/lease records, transfer process and maintenance responsibilities.',
  },
  {
    name: 'Bahria Town',
    pattern: /\bbahria\s+town\b/i,
    note: 'In Bahria Town, verify phase, scheme layout, NOC and approved plan, unit eligibility and possession terms with the developer before any payment.',
  },
];

function normalizePakistaniNumber(value: string): string | null {
  if (!/^[+\d\s()-]+$/.test(value.trim())) {
    return null;
  }
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length === 12) {
    digits = digits.slice(2);
  }
  if (/^03\d{9}$/.test(digits)) {
    return digits;
  }
  if (/^3\d{9}$/.test(digits)) {
    return `0${digits}`;
  }
  return null;
}

function getChatbotReply(message: string): string {
  const lowerMessage = message.toLowerCase();
  const area = AREA_NOTES.find(item => item.pattern.test(message));
  let reply: string;

  if (/construction|renovat|repair|builder|developer|contractor/i.test(lowerMessage)) {
    reply =
      'For construction and renovation projects in Karachi, Upright Solution offers end-to-end planning and contractor coordination for residential and development builds. Before selecting a contractor, ask for recent local project references, a written BOQ and scope, material specifications, timeline, payment milestones, warranty terms and proof of relevant approvals (NOC/BC). We can review your project scope and help you shortlist suitable contractors or guide your own contractor through building approvals. Share your budget in PKR, desired location and property type (plot, house or apartment), and I will outline the key checks.';
  } else if (/\binvest(?:ment)?|land.?market|property.?market|buy.?and.?hold|real.?estate.?invest/i.test(lowerMessage)) {
    reply =
      'For property investment in Karachi, focus on area fundamentals: connectivity, title clarity, development status, NOC, transfer dues and rental demand. Compare gross rental yield to your holding cost and financing rate in PKR. Upright Solution provides Investment Plans with one-to-one consultation, property opportunity review, payment-plan guidance and budget-aligned recommendations. Share your budget (PKR), target area (DHA, Clifton, Gulshan-e-Iqbal, PECHS, North Nazimabad, Malir, Bahria Town) and purpose, and I will help structure a plan.';
  } else if (/\bsoft(ware)?|app.?dev|it.?service|tech.?solution/i.test(lowerMessage)) {
    reply =
      'Upright Solution offers Software Services including web and mobile app planning, business workflow discovery, product requirements, implementation support and ongoing improvement. We build solutions for startups and established teams across Karachi. Tell me about your business workflow, target audience and preferred platform (web, mobile app, or both), and I will connect you with our software team for a free consultation.';
  } else if (/\bfinanc(e|ing)|mortgage|loan|installment|emi|bank.?financ/i.test(lowerMessage)) {
    reply =
      'For property financing in Pakistan, compare banks on markup rate, processing fee, loan-to-value (typically 70–80% for plots, up to 90% for under-construction), markup type (MCLR/flat), pre-payment charges and documentation timeline. Upright Solution provides Financing guidance: we help you explore payment plans, understand affordability, and prepare the required documents. Share your budget in PKR, property type and stage (ready vs under-construction) so I can outline the typical financing options.';
  } else if (/\bsell|selling|seller|valuation|list my|sell my|sale|dispose/i.test(lowerMessage)) {
    reply =
      'For selling property in Karachi, start with recent comparable transactions for the same area, block, property type and condition — not just asking prices. Keep ownership/lease papers, approved plan/NOC, paid dues and transfer documents ready; agree commission and payment terms in writing, and verify the buyer’s funds before transfer. Upright Solution helps with pricing strategy, marketing and buyer verification. Share your area, property type, size and desired timeline in PKR, and I will prepare a selling checklist.';
  } else if (/\brent|rental|tenant|landlord|lease|let out|rent.?out/i.test(lowerMessage)) {
    reply =
      'For renting in Karachi, compare rent for the same block, size and condition, then confirm the monthly amount in PKR, security deposit, advance, maintenance/utilities split, lease length, notice period and who handles repairs. Verify both parties’ CNICs and document handover with meter readings and inventory. Upright Solution can help you list your property or find verified tenants. Share your area, budget per month and bedrooms to narrow the search.';
  } else if (/\bbuy|buying|purchase|plot|invest|home|property|apartment|house|portion|flat/i.test(lowerMessage)) {
    reply =
      'For buying property in Karachi, shortlist by area and total PKR budget, then verify the title/lease chain, approved plan/NOC, property dues, transfer process and actual possession before paying. Compare recent completed transactions, not just listings. Upright Solution covers all major Karachi areas: DHA, Clifton, Gulshan-e-Iqbal, PECHS, North Nazimabad, Malir and Bahria Town. Share your area, property type (plot, house, apartment or portion) and budget in PKR, and I will help you prioritise options.';
  } else if (/\bprice|prices|rate|rates|budget|cost|crore|lac|lakh|pkr|rupee|karachi.?rate/i.test(lowerMessage)) {
    reply =
      'Property rates vary by block, street, title status, condition and possession. Approximate Karachi benchmarks in PKR (subject to change — confirm with an agent): 1-kanal plot 5marla–10marla in DHA/Clifton ≈ PKR 3.5–8 crore; Gulshan-e-Iqbal/East Parkinson ≈ PKR 2.5–4 crore; PECHS/North Nazimabad 5marla plot ≈ PKR 1.2–2.5 crore; Malir/Industrial area plots ≈ PKR 0.8–1.8 crore; Bahria Town 5marla ≈ PKR 1.5–3 crore. Monthly rent: 1-bed DHA/Clifton ≈ PKR 1.2–2.5 lakh; 2-bed Gulshan/PECHS ≈ PKR 0.8–1.5 lakh. Share your target area and property type for a sharper checklist.';
  } else if (/gohar\s+green\s+city|malir|dha|clifton|gulshan|north\s+nazimabad|pechs|bahria/i.test(lowerMessage)) {
    reply =
      'I can help compare Karachi areas and property checks across DHA, Clifton, Gulshan-e-Iqbal, PECHS, North Nazimabad, Malir, Bahria Town and Gohar Green City. The right option depends on your goal (buy, sell, rent, invest), budget in PKR, property type and timeline. Which area and purpose are you considering?';
  } else {
    reply =
      'I am Upright Solution\'s real estate assistant for Karachi. I can help with: buying, selling and renting property; construction and renovation guidance; investment planning; software services; and financing. Share your goal, target area (DHA, Clifton, PECHS, Gulshan-e-Iqbal, North Nazimabad, Malir, Bahria Town), property type (plot, house, apartment or portion) and budget in PKR, and I will provide structured next steps. For a personalised consultation, use the Contact Agent button to connect via WhatsApp.';
  }

  return area ? `${reply}\n\n${area.note}` : reply;
}

export function ChatbotScreen() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [lead, setLead] = useState<{name: string; whatsapp: string} | null>(
    null,
  );
  const [formError, setFormError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {id: 'welcome', role: 'assistant', text: WELCOME_MESSAGE},
  ]);
  const messageSequence = useRef(0);
  const conversationRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);

  const continueToChat = () => {
    const trimmedName = name.trim();
    const normalizedNumber = normalizePakistaniNumber(whatsapp);
    if (!trimmedName) {
      setFormError('Please enter your name to continue.');
      return;
    }
    if (!normalizedNumber) {
      setFormError(
        'Enter a valid Pakistani mobile number: 03XXXXXXXXX or 3XXXXXXXXX.',
      );
      return;
    }
    setFormError('');
    setLead({name: trimmedName, whatsapp: normalizedNumber});
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    messageSequence.current += 1;
    const sequence = messageSequence.current;
    setMessages(current => [
      ...current,
      {id: `user-${sequence}`, role: 'user', text},
      {
        id: `assistant-${sequence}`,
        role: 'assistant',
        text: getChatbotReply(text),
      },
    ]);
    setDraft('');
  };

  const sendLeadToWhatsApp = async (officeNumber: string) => {
    if (!lead) {
      return;
    }
    const transcript = messages
      .map(message => `${message.role === 'user' ? lead.name : 'Upright Solution Assistant'}: ${message.text}`)
      .join('\n\n');
    const text = [
      'Upright Solution Chatbot Lead',
      `Name: ${lead.name}`,
      `WhatsApp: ${lead.whatsapp}`,
      '',
      'Full chat summary:',
      transcript,
    ].join('\n');
    const url = `https://wa.me/${officeNumber}?text=${encodeURIComponent(text)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'WhatsApp unavailable',
        'Could not open WhatsApp on this device. Please try again or check that a browser is available.',
      );
    }
  };

  const guestName = lead?.name ?? 'You';

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Upright Solution Assistant</Text>
            <Text style={styles.subtitle}>Local guidance · Prices in PKR</Text>
          </View>
        </View>

        <ScrollView
          ref={conversationRef}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            conversationRef.current?.scrollToEnd({animated: true})
          }
          showsVerticalScrollIndicator={false}>
          <Text style={styles.disclaimer}>
            Guidance only—not live market quotes or legal advice. Verify
            current prices, approvals and documents independently.
          </Text>
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.role === 'user' && styles.userMessageRow,
              ]}>
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user'
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}>
                <Text style={[
                  styles.messageText,
                  message.role === 'user' && styles.userMessageText,
                  message.role === 'assistant' && styles.assistantMessageText,
                ]}>{message.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <View style={styles.inputRow}>
            <TextInput
              accessibilityLabel="Message the Upright Solution assistant"
              onChangeText={setDraft}
              onSubmitEditing={sendMessage}
              placeholder="Ask about Karachi property…"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="send"
              style={styles.messageInput}
              value={draft}
            />
            <PressableOpacity
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={sendMessage}
              style={styles.sendButton}>
              <Ionicons name="arrow-up" size={20} color={COLORS.white} />
            </PressableOpacity>
          </View>

          {!contactOpen ? (
            <PressableOpacity
              accessibilityRole="button"
              onPress={() => setContactOpen(true)}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Contact Agent</Text>
            </PressableOpacity>
          ) : !lead ? (
            <View>
              <Text style={styles.officePrompt}>
                Share your name and WhatsApp number so our office can reach you.
                Your details are only used if you send an enquiry on WhatsApp.
              </Text>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                accessibilityLabel="Name"
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={COLORS.textMuted}
                style={styles.textInput}
                value={name}
              />
              <Text style={styles.inputLabel}>WhatsApp number</Text>
              <TextInput
                accessibilityLabel="WhatsApp number"
                keyboardType="phone-pad"
                onChangeText={value => {
                  setWhatsapp(value);
                  setFormError('');
                }}
                placeholder="03XXXXXXXXX"
                placeholderTextColor={COLORS.textMuted}
                style={styles.textInput}
                value={whatsapp}
              />
              {formError ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {formError}
                </Text>
              ) : null}
              <PressableOpacity
                accessibilityRole="button"
                onPress={continueToChat}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </PressableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.officePrompt}>
                Hi {guestName}! Choose an office to open WhatsApp with your chat
                summary prefilled. Review and send it in WhatsApp.
              </Text>
              <View style={styles.officeButtons}>
                {OFFICE_CONTACTS.map((office, index) => (
                  <PressableOpacity
                    key={office.whatsappNumber}
                    accessibilityRole="button"
                    accessibilityLabel={`Send lead to ${office.label}, ${office.phoneNumber}`}
                    onPress={() => sendLeadToWhatsApp(office.whatsappNumber)}
                    style={[
                      styles.whatsappButton,
                      index > 0 && styles.secondaryWhatsappButton,
                    ]}>
                    <Text style={styles.whatsappButtonText}>{office.label}</Text>
                    <Text style={styles.whatsappNumberText}>{office.phoneNumber}</Text>
                  </PressableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
  },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomColor: COLORS.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 3},
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800',
  },
  headerCopy: {
    marginLeft: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  formContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(232,238,235,0.9)',
    elevation: 5,
    shadowColor: COLORS.text,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 7},
  },
  formEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  formTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 8,
  },
  formDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  textInput: {
    minHeight: 52,
    paddingHorizontal: 15,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 16,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: -8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.primaryDark,
    marginTop: 18,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  privacyText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 14,
  },
  officeContactsCard: {
    marginTop: 16,
    paddingHorizontal: 2,
  },
  officeContactsTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 9,
    letterSpacing: 0.15,
  },
  officeContacts: {
    flexDirection: 'row',
    gap: 8,
  },
  officeContactBadge: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.primarySoft,
  },
  officeContactLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  officeContactNumber: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
  },
  disclaimer: {
    alignSelf: 'center',
    maxWidth: 330,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 18,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  assistantBubble: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: COLORS.primaryDark,
    borderBottomRightRadius: 5,
  },
  userMessageText: {
    color: COLORS.white,
  },
  assistantMessageText: {
    color: COLORS.text,
  },
  composer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    color: COLORS.text,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.primaryDark,
    marginLeft: 8,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '700',
  },
  whatsappButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 4,
  },
  secondaryWhatsappButton: {
    backgroundColor: COLORS.primaryDark,
  },
  officePrompt: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 9,
    marginBottom: 7,
  },
  officeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsappButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  whatsappNumberText: {
    color: COLORS.white,
    fontSize: 11,
    marginTop: 3,
  },
});
