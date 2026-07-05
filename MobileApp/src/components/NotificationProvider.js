import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';

const NotificationContext = createContext(null);

const TYPES = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: CheckCircle2, iconColor: '#16a34a' },
  error:   { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', icon: XCircle,      iconColor: '#dc2626' },
  warning: { bg: '#fffbeb', border: '#fed7aa', text: '#92400e', icon: AlertTriangle, iconColor: '#f59e0b' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: Info,          iconColor: '#3b82f6' },
};

const Toast = ({ id, type = 'info', title, message, onDismiss }) => {
  const config = TYPES[type] || TYPES.info;
  const IconComponent = config.icon;
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -120, duration: 250, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss(id));
  }, [id, onDismiss, slideAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.toastIcon, { backgroundColor: config.iconColor + '18' }]}>
        <IconComponent size={18} color={config.iconColor} />
      </View>
      <View style={styles.toastContent}>
        {title ? <Text style={[styles.toastTitle, { color: config.text }]}>{title}</Text> : null}
        {message ? <Text style={[styles.toastMessage, { color: config.text + 'cc' }]}>{message}</Text> : null}
      </View>
      <TouchableOpacity onPress={dismiss} style={styles.toastClose}>
        <X size={16} color={config.text} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// topInset is passed in from App.js (which has access to SafeAreaProvider context)
export const NotificationProvider = ({ children, topInset = 50 }) => {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timerRefs.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    timerRefs.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((title, message, opts) => notify({ type: 'success', title, message, ...opts }), [notify]);
  const error   = useCallback((title, message, opts) => notify({ type: 'error',   title, message, ...opts }), [notify]);
  const warning = useCallback((title, message, opts) => notify({ type: 'warning', title, message, ...opts }), [notify]);
  const info    = useCallback((title, message, opts) => notify({ type: 'info',    title, message, ...opts }), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
      <View style={[styles.container, { top: topInset + 8 }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={dismiss} />
        ))}
      </View>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  toastContent: { flex: 1 },
  toastTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toastMessage: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  toastClose: { padding: 4, flexShrink: 0 },
});
