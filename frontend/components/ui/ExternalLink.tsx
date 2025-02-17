import { Pressable } from 'react-native';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '@/styles/common';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  style?: object;
}

export function ExternalLink({ href, children, style }: ExternalLinkProps) {
  const handlePress = () => {
    WebBrowser.openBrowserAsync(href);
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={[
        { 
          cursor: 'pointer',
        },
        style
      ]}
    >
      {children}
    </Pressable>
  );
} 