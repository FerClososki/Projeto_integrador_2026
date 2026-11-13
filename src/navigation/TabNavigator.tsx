import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Categories': iconName = focused ? 'grid' : 'grid-outline'; break;
            case 'Cart': iconName = focused ? 'bag-handle' : 'bag-handle-outline'; break;
            case 'Orders': iconName = focused ? 'receipt' : 'receipt-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
            default: iconName = 'circle';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Início' }} 
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{ tabBarLabel: 'Categorias' }} 
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ tabBarLabel: 'Sacola' }} 
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ tabBarLabel: 'Pedidos' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Perfil' }} 
      />
    </Tab.Navigator>
  );
}