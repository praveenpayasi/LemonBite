import { memo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface TextInputFieldProps
  extends
    Pick<
      TextInputProps,
      | 'value'
      | 'onChangeText'
      | 'placeholder'
      | 'secureTextEntry'
      | 'keyboardType'
      | 'autoCapitalize'
      | 'autoCorrect'
      | 'editable'
      | 'accessibilityLabel'
    >,
    Testable {
  /** Visible label rendered above the field. */
  label?: string;
  /** Validation message shown below the field; also styles the border. */
  error?: string;
  /** Optional style overrides for the outer wrapper. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Labelled, controlled text input with optional error state.
 * Presentational only — validation logic lives in the calling screen/hook.
 */
function TextInputFieldComponent({
  label,
  error,
  style,
  testID,
  accessibilityLabel,
  editable = true,
  ...inputProps
}: TextInputFieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        testID={testID}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={colors.textPlaceholder}
        style={[styles.input, !editable && styles.inputDisabled, hasError && styles.inputError]}
        {...inputProps}
      />
      {hasError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...textVariants.lead,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  input: {
    ...textVariants.body,
    height: sizing.inputHeight,
    borderWidth: borderWidth.thick,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputDisabled: {
    backgroundColor: colors.surface,
    color: colors.textSecondary,
  },
  inputError: {
    borderColor: colors.accent,
  },
  error: {
    ...textVariants.caption,
    color: colors.accent,
    marginTop: spacing.xs,
  },
});;

export const TextInputField = memo(TextInputFieldComponent);
