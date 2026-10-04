import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { borderWidth, colors, layout, spacing } from '@/theme';
import type { Testable, WithChildren } from '@/types';

export interface ScreenContainerProps extends WithChildren, Testable {
  /** Which safe-area edges to inset. Defaults to top & bottom. */
  edges?: readonly Edge[];
  /** When true, content scrolls vertically if it exceeds the viewport. */
  scroll?: boolean;
  /** When true, insets scrollable content above the keyboard (form screens). */
  keyboardAvoiding?: boolean;
  /** Pinned below the content; stays visible while the content scrolls. */
  footer?: ReactNode;
  /** Optional style overrides for the inner content wrapper. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Standard screen wrapper: applies the app background and safe-area insets so
 * individual screens don't repeat layout boilerplate.
 */
export function ScreenContainer({
  children,
  edges = ['top', 'bottom'],
  scroll = false,
  keyboardAvoiding = false,
  footer,
  style,
  testID,
}: ScreenContainerProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track the keyboard height so scrollable content can be inset above it.
  // Manual insets stay reliable under Android edge-to-edge, where
  // KeyboardAvoidingView is inconsistent.
  useEffect(() => {
    if (!keyboardAvoiding) {
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardAvoiding]);

  if (scroll) {
    const flattened = StyleSheet.flatten([styles.content, styles.scrollContent, style]) as ViewStyle;
    const basePaddingBottom =
      typeof flattened.paddingBottom === 'number' ? flattened.paddingBottom : 0;

    return (
      <SafeAreaView testID={testID} edges={edges} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            styles.scrollContent,
            style,
            keyboardAvoiding ? { paddingBottom: basePaddingBottom + keyboardHeight } : null,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID={testID} edges={edges} style={styles.safeArea}>
      <View style={[styles.content, styles.fill, style]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.contentPaddingHorizontal,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: spacing.smd,
    paddingBottom: spacing.smd,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
