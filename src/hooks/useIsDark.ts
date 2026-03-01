import { useTheme } from "next-themes";

const useIsDark = () => {
  const { theme, systemTheme } = useTheme();
  return theme === "dark" || (theme === "system" && systemTheme === "dark");
};

export default useIsDark;
