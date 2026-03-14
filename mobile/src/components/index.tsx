import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

// ============ CARD COMPONENT ============
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ============ BUTTON COMPONENT ============
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    if (variant === 'outline') return styles.buttonTextOutline;
    return styles.buttonText;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ============ BADGE COMPONENT ============
interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'default', style }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return styles.badgeSuccess;
      case 'warning':
        return styles.badgeWarning;
      case 'error':
        return styles.badgeError;
      case 'info':
        return styles.badgeInfo;
      default:
        return styles.badgeDefault;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'success':
        return styles.badgeTextSuccess;
      case 'warning':
        return styles.badgeTextWarning;
      case 'error':
        return styles.badgeTextError;
      case 'info':
        return styles.badgeTextInfo;
      default:
        return styles.badgeTextDefault;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={getTextStyle()}>{text}</Text>
    </View>
  );
};

// ============ STAT CARD COMPONENT ============
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = COLORS.primary, onPress }) => {
  const content = (
    <>
      {icon && (
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
      )}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.statCard}>{content}</View>;
};

// ============ LIST ITEM COMPONENT ============
interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightElement,
  onPress,
}) => {
  const content = (
    <View style={styles.listItemContent}>
      {leftIcon && <View style={styles.listItemIcon}>{leftIcon}</View>}
      <View style={styles.listItemText}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.listItem}>{content}</View>;
};

// ============ EMPTY STATE COMPONENT ============
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    {icon}
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// ============ LOADING COMPONENT ============
export const Loading: React.FC = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

// ============ SECTION HEADER COMPONENT ============
interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionText, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionText && onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============ STYLES ============
const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Button
  button: {
    height: 50,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.status.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.lg,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: COLORS.primary,
    fontSize: FONTS.lg,
    fontWeight: '600',
  },

  // Badge
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  badgeDefault: {
    backgroundColor: COLORS.border,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
  },
  badgeInfo: {
    backgroundColor: '#DBEAFE',
  },
  badgeTextDefault: {
    color: COLORS.text.secondary,
    fontSize: FONTS.xs,
    fontWeight: '500',
  },
  badgeTextSuccess: {
    color: '#059669',
    fontSize: FONTS.xs,
    fontWeight: '500',
  },
  badgeTextWarning: {
    color: '#D97706',
    fontSize: FONTS.xs,
    fontWeight: '500',
  },
  badgeTextError: {
    color: '#DC2626',
    fontSize: FONTS.xs,
    fontWeight: '500',
  },
  badgeTextInfo: {
    color: '#2563EB',
    fontSize: FONTS.xs,
    fontWeight: '500',
  },

  // Stat Card
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statTitle: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },

  // List Item
  listItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    marginRight: SPACING.md,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  listItemSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONTS.lg,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.md,
    color: COLORS.text.muted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Loading
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  sectionAction: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
