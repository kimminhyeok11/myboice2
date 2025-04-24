import Link from 'next/link';
import { AiOutlineHome, AiOutlineInbox, AiOutlineAudio } from 'react-icons/ai';

const items = [
  { href: '/', icon: AiOutlineHome },
  { href: '/inbox', icon: AiOutlineInbox },
  { href: '/record', icon: AiOutlineAudio },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-lg flex justify-around py-2">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="text-white text-2xl">
          <item.icon />
        </Link>
      ))}
    </nav>
  );
}
