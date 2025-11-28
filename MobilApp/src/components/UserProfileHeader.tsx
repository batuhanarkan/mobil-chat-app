import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface UserProfileHeaderProps {
  name: string;
  isOnline?: boolean;
  isViewingHistory?: boolean;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  isOnline = true,
  isViewingHistory = false,
}) => {
  // Generate initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate color from name (consistent color for same name)
  const getColorFromName = (name: string): string => {
    const colors = [
      '#007AFF',
      '#34C759',
      '#FF9500',
      '#FF3B30',
      '#5856D6',
      '#5c03cc',
      '#00C7BE',
      '#FF2D55',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  if (isViewingHistory) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, {backgroundColor: '#8E8E93'}]}>
            <Text style={styles.initials}>📋</Text>
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>Chat History</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, {backgroundColor}]}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.status}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

