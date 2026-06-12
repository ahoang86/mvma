import 'dotenv/config';

export default {
  expo: {
    name: 'MVMA Mobile',
    slug: 'mvma-mobile',
    scheme: 'mvma',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0f1117'
    },
    ios: {
      bundleIdentifier: 'com.ahoang.mvma',
      supportsTablet: false
    },
    android: {
      package: 'com.ahoang.mvma',
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE'
      ],
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0f1117'
      },
      softwareKeyboardLayoutMode: 'resize'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      orsKey: process.env.ORS_KEY,
      eas: {
        projectId: 'REPLACE-WITH-YOUR-EAS-PROJECT-ID'
      }
    }
  }
};
