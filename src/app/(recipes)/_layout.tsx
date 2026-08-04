import { Stack } from 'expo-router';

/**
 * Native stack inside the Recipes tab: the list is the root, recipe
 * details push on top with the platform back gesture/header. (NativeTabs
 * has no built-in header/push — nesting a Stack per tab is the SDK 57
 * pattern.)
 */
export default function RecipesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
