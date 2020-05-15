export default createMaterialBottomTabNavigator(
  {
    Album: { screen: Album },
    Library: { screen: Library },
    History: { screen: History },
    Cart: { screen: Cart },
  },
  {
    initialRouteName: 'Album',
    activeColor: '#f0edf6',
    inactiveColor: '#3e2465',
    barStyle: { backgroundColor: '#694fad' },
  }
);