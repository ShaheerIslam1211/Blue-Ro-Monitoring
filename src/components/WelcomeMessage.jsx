import { Typography } from "@material-tailwind/react";
import { useAtom } from 'jotai';
import { userAtom } from '@/store/atoms/userAtom';

export function WelcomeMessage() {
  const [user] = useAtom(userAtom);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return { text: "Good Morning", emoji: "🌅" };
    } else if (hour >= 12 && hour < 17) {
      return { text: "Good Afternoon", emoji: "☀️" };
    } else if (hour >= 17 && hour < 21) {
      return { text: "Good Evening", emoji: "🌆" };
    } else {
      return { text: "Shh Night time!", emoji: "🌙" };
    }
  };

  const { text, emoji } = getGreeting();
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="mb-8">
      <Typography variant="h3" className="font-semibold text-gray-800">
        {text} {emoji}
      </Typography>
      <Typography variant="h4" className="font-normal text-gray-600">
        Welcome back, {userName}!
      </Typography>
    </div>
  );
}

export default WelcomeMessage; 