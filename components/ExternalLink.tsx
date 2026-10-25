import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

export function ExternalLink(props: React.ComponentProps<typeof Link>) {
  return (
    <Link
      // On web, launch the link in a new tab (hrefAttrs was replaced by a plain target prop in expo-router v3).
      target="_blank"
      {...props}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          WebBrowser.openBrowserAsync(props.href as string);
        }
      }}
    />
  );
}
