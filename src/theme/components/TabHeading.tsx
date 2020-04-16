import { PLATFORM } from './../variables/commonColor';
import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  const platform = variables.platform;

  const tabHeadingTheme = {
    flexDirection: 'row',
    backgroundColor: variables.tabDefaultBg,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: platform === PLATFORM.ANDROID ? 5 : 0,
    '.scrollable': {
      paddingHorizontal: 20,
      flex: platform === PLATFORM.ANDROID ? 0 : 1,
      minWidth: platform === PLATFORM.ANDROID ? undefined : 60
    },
    'NativeBase.Text': {
      color: variables.topTabBarTextColor,
      marginHorizontal: 7,
      marginTop: -5
    },
    'NativeBase.Icon': {
      color: variables.topTabBarTextColor,
      fontSize: platform === PLATFORM.IOS ? 26 : undefined
    },
    '.active': {
      'NativeBase.Text': {
        color: variables.topTabBarActiveTextColor,
        fontWeight: '600',
        marginTop: -5
      },
      'NativeBase.Icon': {
        color: variables.topTabBarActiveTextColor
      }
    }
  };

  return tabHeadingTheme;
};