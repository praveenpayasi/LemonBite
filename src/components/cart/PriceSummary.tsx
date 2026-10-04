import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatPrice } from '@/utils/menu';
import { borderWidth, colors, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface PriceSummaryProps extends Testable {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

interface RowProps {
  label: string;
  value: number;
}

function SummaryRow({ label, value }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatPrice(value)}</Text>
    </View>
  );
}

/** Order cost breakdown: subtotal, fees, and a prominent total. */
function PriceSummaryComponent({
  subtotal,
  deliveryFee,
  serviceFee,
  total,
  testID,
}: PriceSummaryProps) {
  return (
    <View style={styles.container} testID={testID}>
      <SummaryRow label="Subtotal" value={subtotal} />
      <SummaryRow label="Delivery" value={deliveryFee} />
      <SummaryRow label="Service" value={serviceFee} />
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue} testID={testID ? `${testID}-total` : undefined}>
          {formatPrice(total)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    ...textVariants.body,
    color: colors.textSecondary,
  },
  value: {
    ...textVariants.body,
    color: colors.textPrimary,
  },
  divider: {
    width: '100%',
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
    marginVertical: spacing.xs,
  },
  totalLabel: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  totalValue: {
    ...textVariants.sectionTitle,
    color: colors.primary,
  },
});

export const PriceSummary = memo(PriceSummaryComponent);
