import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface AvatarEditorProps extends Testable {
  uri: string | null;
  initials: string;
  onChange: () => void;
  onRemove: () => void;
}

/** Avatar preview with Change / Remove actions (Figma "Avatar editor"). */
export function AvatarEditor({ uri, initials, onChange, onRemove, testID }: AvatarEditorProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>Avatar</Text>
      <View style={styles.row}>
        <ProfileAvatar uri={uri} initials={initials} size={sizing.avatarLg} />
        <View style={styles.actions}>
          <Pressable
            onPress={onChange}
            accessibilityRole="button"
            accessibilityLabel="Change avatar"
            style={[styles.action, styles.changeAction]}
          >
            <Text style={styles.actionLabel}>Change</Text>
          </Pressable>
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove avatar"
            disabled={!uri}
            style={[styles.action, styles.removeAction, !uri && styles.actionDisabled]}
          >
            <Text style={styles.actionLabel}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  label: {
    ...textVariants.lead,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  action: {
    width: sizing.avatarActionWidth,
    height: sizing.rowHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  changeAction: {
    backgroundColor: colors.surface,
  },
  removeAction: {
    backgroundColor: colors.background,
    borderWidth: borderWidth.thick,
    borderColor: colors.primary,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionLabel: {
    ...textVariants.button,
    color: colors.primary,
  },
});
