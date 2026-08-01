import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';

const LazyThumbnail = ({
  uri,
  style,
  imageStyle,
  resizeMode = 'cover',
  enabled = true,
  placeholderColor = '#f1f5f9',
  cacheKey,
}) => {
  const [loaded, setLoaded] = useState(false);

  if (!uri) return null;

  if (!enabled) {
    return <View style={[styles.wrap, style, { backgroundColor: placeholderColor }]} />;
  }

  return (
    <View style={[styles.wrap, style, { backgroundColor: placeholderColor }]}>
      {!loaded && (
        <View style={[StyleSheet.absoluteFill, styles.loaderWrap]}>
          <ActivityIndicator size="small" color="#16a34a" />
        </View>
      )}
      <Image
        source={cacheKey ? { uri, cache: cacheKey } : { uri }}
        style={imageStyle || StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  loaderWrap: { alignItems: 'center', justifyContent: 'center' },
});

export default LazyThumbnail;
