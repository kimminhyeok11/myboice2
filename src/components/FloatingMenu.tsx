"use client";
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FaRocket, FaTachometerAlt, FaInbox, FaMicrophone, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { IconType } from 'react-icons';

type PageItem = { key: string; href: string; icon: IconType };
type ActionItem = { key: string; action: () => void; icon: IconType };
type MenuItem = PageItem | ActionItem;

const baseMenuItems: PageItem[] = [
  { key: 'dashboard', href: '/', icon: FaTachometerAlt },
  { key: 'inbox', href: '/inbox', icon: FaInbox },
  { key: 'record', href: '/record', icon: FaMicrophone },
];

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const authItem: ActionItem = session
    ? { key: 'signout', action: () => signOut(), icon: FaSignOutAlt }
    : { key: 'signin', action: () => signIn(), icon: FaSignInAlt };
  const menuItems: MenuItem[] = [...baseMenuItems, authItem];

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col items-end space-y-2">
      {open &&
        menuItems.map((item) => (
          'href' in item ? (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center justify-center w-12 h-12 bg-black/60 text-white rounded-full shadow-lg backdrop-blur-md hover:bg-black/80 transition"
            >
              <item.icon className="text-xl" />
            </Link>
          ) : (
            <button
              key={item.key}
              onClick={item.action}
              className="flex items-center justify-center w-12 h-12 bg-black/60 text-white rounded-full shadow-lg backdrop-blur-md hover:bg-black/80 transition"
            >
              <item.icon className="text-xl" />
            </button>
          )
        ))}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition"
      >
        <FaRocket className="text-2xl" />
      </button>
    </div>
  );
}
