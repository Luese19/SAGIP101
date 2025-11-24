import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';

class HapticService {
  // Light haptic feedback for button presses
  light() {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // Medium haptic feedback for important actions
  medium() {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Heavy haptic feedback for significant actions
  heavy() {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Success haptic feedback
  success() {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  // Error haptic feedback
  error() {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  // Warning haptic feedback
  warning() {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  // Custom haptic pattern
  pattern(pattern = [100, 50, 100]) {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, pattern[1]);
    }
  }
}

export default new HapticService();